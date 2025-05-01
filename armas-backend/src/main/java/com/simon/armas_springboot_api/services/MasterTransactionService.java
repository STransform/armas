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
//import collectors
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

    public MasterTransaction uploadFile(MultipartFile file, String responseNeeded, String fiscal_year,
            String transactiondocumentid, Principal principal) throws IOException {
        String username = principal.getName();
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new IllegalArgumentException("User not found: " + username);
        }

        String docname = file.getOriginalFilename();
        if (docname == null || docname.isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }
        if (masterTransactionRepository.existsByDocnameAndUser(docname, user)) {
            throw new IllegalArgumentException("Document already exists for this user: " + docname);
        }

        Document document = documentRepository.findById(transactiondocumentid)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + transactiondocumentid));

        MasterTransaction transaction = new MasterTransaction();
        transaction.setUser(user); // Uploader (USER)
        transaction.setUser2(user); // Set uploader as default user2 to avoid null
        Organization organization = user.getOrganization();
        if (organization == null || organization.getId() == null) {
            throw new IllegalArgumentException("User has no associated organization or organization ID is null");
        }
        transaction.setOrganization(organization);
        transaction.setDocname(docname);
        transaction.setReportstatus("Submitted"); // Initial status
        transaction.setFiscal_year(fiscal_year);
        transaction.setReportcategory(document.getReportype());
        transaction.setTransactiondocument(document);
        transaction.setResponse_needed(responseNeeded); // "Report" or "Feedback"

        String filePath = fileStorageService.storeFile(file, transaction, principal);
        if (filePath == null || filePath.isEmpty()) {
            throw new IllegalArgumentException("File storage failed: Invalid file path");
        }
        transaction.setFilepath(filePath);

        try {
            return masterTransactionRepository.save(transaction);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalArgumentException(
                    "Failed to save transaction due to database constraint: " + e.getMostSpecificCause().getMessage(),
                    e);
        } catch (Exception e) {
            throw new IllegalStateException("Unexpected error saving transaction: " + e.getMessage(), e);
        }
    }

    public Path getFilePath(Integer id) {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        return Paths.get(transaction.getFilepath());
    }

    public List<SentReportResponseDTO> getSentReportData(String role) {
        List<String> statuses;
        if ("ARCHIVER".equals(role)) {
            statuses = Arrays.asList("Submitted", "Approved");
        } else if ("SENIOR_AUDITOR".equals(role)) {
            statuses = Arrays.asList("Assigned", "Rejected");
        } else if ("APPROVER".equals(role)) {
            statuses = Arrays.asList("Under Review");
        } else {
            statuses = Arrays.asList("Submitted", "Assigned", "Under Review", "Rejected", "Approved");
        }
        return masterTransactionRepository.fetchDataByStatuses(statuses);
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

    @Transactional
public MasterTransaction assignAuditor(Integer transactionId, String auditorUsername) {
    System.out.println("Assigning auditor: transactionId=" + transactionId + ", auditorUsername=" + auditorUsername);
    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    User auditor = userRepository.findByUsername(auditorUsername.trim());
    if (auditor == null) {
        throw new IllegalArgumentException("Auditor not found: " + auditorUsername);
    }
    boolean isSeniorAuditor = auditor.getRoles().stream()
            .anyMatch(role -> "SENIOR_AUDITOR".equals(role.getDescription()));
    if (!isSeniorAuditor) {
        throw new IllegalArgumentException("User is not a SENIOR_AUDITOR: " + auditorUsername);
    }
    if (!"Submitted".equals(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only assign auditors to Submitted reports");
    }
    transaction.setUser2(auditor);
    transaction.setReportstatus("Assigned");
    MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);
    System.out.println("Transaction updated: id=" + savedTransaction.getId() + 
                      ", status=" + savedTransaction.getReportstatus() + 
                      ", assigned_expert_user_id=" + savedTransaction.getUser2().getId());
    return savedTransaction;
}


    @Transactional
    public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername,
            String currentUsername) {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized: You are not assigned to this task");
        }
        if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only submit findings for Assigned or Rejected reports");
        }
        User approver = userRepository.findByUsername(approverUsername);
        if (approver == null) {
            throw new IllegalArgumentException("Approver not found: " + approverUsername);
        }
        transaction.setRemarks(findings);
        transaction.setUser2(approver); // Assign to APPROVER
        transaction.setReportstatus("Under Review");
        return masterTransactionRepository.save(transaction);
    }

    @Transactional
    public MasterTransaction approveReport(Integer transactionId, String currentUsername) {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized: You are not assigned to this task");
        }
        if (!"Under Review".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only approve Under Review reports");
        }
        transaction.setUser2(null); // Clear assignment, back to ARCHIVER
        transaction.setReportstatus("Approved");
        return masterTransactionRepository.save(transaction);
    }

    @Transactional
    public MasterTransaction rejectReport(Integer transactionId, String currentUsername, String auditorUsername) {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized: You are not assigned to this task");
        }
        if (!"Under Review".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only reject Under Review reports");
        }
        User auditor = userRepository.findByUsername(auditorUsername);
        if (auditor == null) {
            throw new IllegalArgumentException("Auditor not found: " + auditorUsername);
        }
        transaction.setUser2(auditor); // Reassign to SENIOR_AUDITOR
        transaction.setReportstatus("Rejected");
        return masterTransactionRepository.save(transaction);
    }

    public List<MasterTransaction> getTasks(String username, String role) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.err.println("User not found: " + username);
            throw new IllegalArgumentException("User not found: " + username);
        }
        System.out.println("Fetching tasks for user: " + username + ", role: " + role + ", userId: " + user.getId());
        List<MasterTransaction> tasks;
        if ("SENIOR_AUDITOR".equals(role)) {
            tasks = masterTransactionRepository.findByUserAndStatuses(user.getId(), Arrays.asList("Assigned", "Rejected"));
        } else if ("APPROVER".equals(role)) {
            tasks = masterTransactionRepository.findByUserAndStatuses(user.getId(), Arrays.asList("Under Review"));
        } else {
            tasks = new ArrayList<>();
        }
        System.out.println("Tasks fetched: " + tasks);
        return tasks;
    }


    
}