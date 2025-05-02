package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.security.models.Role;
import org.springframework.beans.factory.annotation.Autowired;
//import collection
import java.util.Collections;
import java.util.HashSet;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import com.simon.armas_springboot_api.services.FileStorageService;
import org.springframework.dao.DataIntegrityViolationException;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Optional;
//import organization

import com.simon.armas_springboot_api.models.Organization;

@Service
public class MasterTransactionService {
    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;

    // Upload file by Uploader
    public MasterTransaction uploadFile(MultipartFile file, String responseNeeded, String fiscalYear,
            String transactionDocumentId, Principal principal) throws IOException {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) throw new IllegalArgumentException("User not found");

        String docname = file.getOriginalFilename();
        if (masterTransactionRepository.existsByDocnameAndUser(docname, user)) {
            throw new IllegalArgumentException("Document already exists");
        }

        Document document = documentRepository.findById(transactionDocumentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        MasterTransaction transaction = new MasterTransaction();
        transaction.setUser(user); // Uploader
        transaction.setUser2(null); // Initially unassigned
        transaction.setOrganization(user.getOrganization());
        transaction.setDocname(docname);
        transaction.setReportstatus("Submitted");
        transaction.setFiscal_year(fiscalYear);
        transaction.setReportcategory(document.getReportype());
        transaction.setTransactiondocument(document);
        transaction.setResponse_needed(responseNeeded);
        transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal));

        return masterTransactionRepository.save(transaction);
    }

    public Path getFilePath(Integer id) {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        return Paths.get(transaction.getFilepath());
    }

    public List<SentReportResponseDTO> getSentReportData(String role) {
        List<String> statuses;
        if ("ARCHIVER".equals(role)) {
            statuses = Arrays.asList("Submitted", "Approved"); // Only Submitted and Aproved reports for ARCHIVER
        } else if ("SENIOR_AUDITOR".equals(role)) {
            statuses = Arrays.asList("Assigned", "Rejected");
        } else if ("APPROVER".equals(role)) {
            statuses = Arrays.asList("Under Review");
        } else {
            statuses = Arrays.asList("Submitted", "Assigned", "Under Review", "Rejected", "Approved");
        }
        System.out.println("Fetching reports for role: " + role + ", statuses: " + statuses);
        List<SentReportResponseDTO> reports = masterTransactionRepository.fetchDataByStatuses(statuses);
        System.out.println("Fetched reports: " + reports);
        return reports;
    }

    public List<UserDTO> getUsersByRole(String roleName) {
        System.out.println("Fetching users for role: " + roleName);
        List<User> users = userRepository.findByRoleName(roleName);
        List<UserDTO> userDTOs = users.stream()
                .map(user -> new UserDTO(user.getId(), user.getUsername(), user.getFirstName(), user.getLastName()))
                .collect(Collectors.toList());
        System.out.println("Fetched users for role " + roleName + ": " + userDTOs);
        return userDTOs;
    }

    // Assign to Senior Auditor by Archiver
    @Transactional
    public MasterTransaction assignAuditor(Integer transactionId, String auditorUsername, String currentUsername) {
        User archiver = userRepository.findByUsername(currentUsername);
        if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an Archiver");
        }

        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        if (!"Submitted".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only assign Submitted tasks");
        }

        User auditor = userRepository.findByUsername(auditorUsername);
        if (auditor == null || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Senior Auditor");
        }

        transaction.setUser2(auditor); // Assign to Senior Auditor
        transaction.setReportstatus("Assigned");
        return masterTransactionRepository.save(transaction);
    }



     // Submit findings by Senior Auditor
     @Transactional
     public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername, String currentUsername) {
        System.out.println("Submitting findings: transactionId=" + transactionId + ", currentUsername=" + currentUsername + ", approverUsername=" + approverUsername);
        
        // Fetch transaction
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    System.out.println("Transaction not found: " + transactionId);
                    return new IllegalArgumentException("Transaction not found: " + transactionId);
                });
        
        // Fetch current user (Senior Auditor)
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            System.out.println("Current user not found: " + currentUsername);
            throw new IllegalArgumentException("Current user not found: " + currentUsername);
        }

        // Log current state
        System.out.println("Transaction state before update: id=" + transaction.getId() + 
                          ", user2_id=" + (transaction.getUser2() != null ? transaction.getUser2().getId() : "null") + 
                          ", reportstatus=" + transaction.getReportstatus() + 
                          ", lastModifiedBy=" + transaction.getLastModifiedBy());

        // Verify SENIOR_AUDITOR role
        if (!currentUser.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            System.out.println("Current user does not have SENIOR_AUDITOR role: " + currentUsername);
            throw new IllegalArgumentException("Unauthorized: Must have SENIOR_AUDITOR role");
        }

        // Verify transaction is in valid state
        if (!Arrays.asList("Assigned", "Rejected", "Under Review").contains(transaction.getReportstatus())) {
            System.out.println("Invalid report status: " + transaction.getReportstatus());
            throw new IllegalStateException("Can only submit findings for Assigned, Rejected, or Under Review reports");
        }

        // Verify approver
        User approver = userRepository.findByUsername(approverUsername);
        if (approver == null) {
            System.out.println("Approver not found: " + approverUsername);
            throw new IllegalArgumentException("Approver not found: " + approverUsername);
        }
        if (!approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            System.out.println("Invalid approver role: " + approverUsername);
            throw new IllegalArgumentException("Invalid Approver: User does not have APPROVER role: " + approverUsername);
        }
        System.out.println("Approver ID: " + approver.getId() + ", username: " + approver.getUsername());

        // Update transaction
        transaction.setRemarks(findings);
        transaction.setUser2(approver);
        transaction.setReportstatus("Under Review");
        transaction.setLastModifiedBy(currentUsername);

        // Save and log updated state
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);
        System.out.println("Transaction state after update: id=" + savedTransaction.getId() + 
                          ", user2_id=" + (savedTransaction.getUser2() != null ? savedTransaction.getUser2().getId() : "null") + 
                          ", reportstatus=" + savedTransaction.getReportstatus() + 
                          ", lastModifiedBy=" + savedTransaction.getLastModifiedBy() + 
                          ", remarks=" + savedTransaction.getRemarks());
        System.out.println("Findings submitted successfully for transactionId: " + transactionId);
        
        return savedTransaction;
    }
    // Approve by Approver
    @Transactional
    public MasterTransaction approveReport(Integer transactionId, String currentUsername) {
        System.out.println("Approving report: transactionId=" + transactionId + ", currentUsername=" + currentUsername);
        
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            System.out.println("Current user not found: " + currentUsername);
            throw new IllegalArgumentException("Current user not found: " + currentUsername);
        }

        // Verify APPROVER role
        if (!currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            System.out.println("Current user does not have APPROVER role: " + currentUsername);
            throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
        }

        // Verify transaction is Under Review
        if (!"Under Review".equals(transaction.getReportstatus())) {
            System.out.println("Invalid report status for approval: " + transaction.getReportstatus());
            throw new IllegalStateException("Can only approve reports in Under Review status");
        }

        // Verify current user is the assigned Approver
        if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            System.out.println("Authorization failed: User is not the assigned Approver");
            throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
        }

        // Update status to Approved
        transaction.setReportstatus("Approved");
        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);
        System.out.println("Report approved successfully: transactionId=" + transactionId + ", status=" + savedTransaction.getReportstatus());
        return savedTransaction;
    }


      // Reject by Approver
      @Transactional
    public MasterTransaction rejectReport(Integer transactionId, String auditorUsername, String currentUsername) {
        System.out.println("Rejecting report: transactionId=" + transactionId + ", currentUsername=" + currentUsername + ", auditorUsername=" + auditorUsername);
        
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null) {
            System.out.println("Current user not found: " + currentUsername);
            throw new IllegalArgumentException("Current user not found: " + currentUsername);
        }

        // Verify APPROVER role
        if (!currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            System.out.println("Current user does not have APPROVER role: " + currentUsername);
            throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
        }

        // Verify transaction is Under Review
        if (!"Under Review".equals(transaction.getReportstatus())) {
            System.out.println("Invalid report status for rejection: " + transaction.getReportstatus());
            throw new IllegalStateException("Can only reject reports in Under Review status");
        }

        // Verify current user is the assigned Approver
        if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            System.out.println("Authorization failed: User is not the assigned Approver");
            throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
        }

        // Verify auditor
        User auditor = userRepository.findByUsername(auditorUsername);
        if (auditor == null || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            System.out.println("Invalid auditor: " + auditorUsername);
            throw new IllegalArgumentException("Invalid Senior Auditor: " + auditorUsername);
        }

        // Update status to Rejected and reassign to auditor
        transaction.setReportstatus("Rejected");
        transaction.setUser2(auditor);
        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);
        System.out.println("Report rejected successfully: transactionId=" + transactionId + ", status=" + savedTransaction.getReportstatus() + ", assigned to auditor=" + auditorUsername);
        return savedTransaction;
    }

   // Get tasks based on role and user
   public List<MasterTransaction> getTasks(String username, String role) {
    User user = userRepository.findByUsername(username);
    if (user == null) {
        System.out.println("User not found: " + username);
        throw new IllegalArgumentException("User not found: " + username);
    }
    System.out.println("Fetching tasks for user: " + username + ", role: " + role);

    if ("ARCHIVER".equals(role)) {
        List<MasterTransaction> tasks = masterTransactionRepository.findByReportStatus("Submitted");
        System.out.println("Archiver tasks: " + tasks.size());
        return tasks;
    } else if ("SENIOR_AUDITOR".equals(role)) {
        List<MasterTransaction> tasks = masterTransactionRepository.findSeniorAuditorTasks(
            user.getId(), Arrays.asList("Assigned", "Rejected"), username
        );
        System.out.println("Senior Auditor tasks: " + tasks.size());
        return tasks;
    } else if ("APPROVER".equals(role)) {
        List<MasterTransaction> tasks = masterTransactionRepository.findByUserAndStatuses(
            user.getId(), Arrays.asList("Under Review", "Approved", "Rejected")
        );
        System.out.println("Approver tasks: " + tasks.size());
        for (MasterTransaction task : tasks) {
            System.out.println("Approver task: id=" + task.getId() + ", status=" + task.getReportstatus() + 
                              ", user2_id=" + (task.getUser2() != null ? task.getUser2().getId() : "null"));
        }
        return tasks;
    }
    System.out.println("No tasks found for role: " + role);
    return Collections.emptyList();
}
   
}