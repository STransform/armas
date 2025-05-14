package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
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
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.Optional;
import java.util.Date;
import java.util.Collections;
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
   @Transactional
    public MasterTransaction uploadFile(MultipartFile file, String responseNeeded, String fiscalYear,
            String transactionDocumentId, Principal principal) throws IOException {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null)
            throw new IllegalArgumentException("User not found");

        String docname = file.getOriginalFilename();
        if (masterTransactionRepository.existsByDocnameAndUser(docname, user)) {
            throw new IllegalArgumentException("Document already exists");
        }

        Document document = documentRepository.findById(transactionDocumentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        MasterTransaction transaction = new MasterTransaction();
        transaction.setUser(user);
        transaction.setUser2(null);
        transaction.setOrganization(user.getOrganization());
        transaction.setDocname(docname);
        transaction.setReportstatus("Submitted");
        transaction.setFiscal_year(fiscalYear);
        transaction.setReportcategory(document.getReportype());
        transaction.setTransactiondocument(document);
        transaction.setResponse_needed(responseNeeded);
        transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal, false));
        transaction.setCreatedDate(new Date());
        transaction.setCreatedBy(principal.getName());

        return masterTransactionRepository.save(transaction);
    }

    public Map<String, Path> getFilePaths(Integer id) {
        MasterTransaction transaction = masterTransactionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));
        Map<String, Path> paths = new HashMap<>();
        paths.put("original", Paths.get(transaction.getFilepath()));
        if (transaction.getSupportingDocumentPath() != null) {
            paths.put("supporting", Paths.get(transaction.getSupportingDocumentPath()));
        }
        return paths;
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

    @Transactional
    public MasterTransaction assignAuditor(Integer transactionId, String auditorUsername, String currentUsername) {
        User archiver = userRepository.findByUsername(currentUsername);
        if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an Archiver");
        }

        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        if (!"Submitted".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only assign Submitted tasks");
        }

        User auditor = userRepository.findByUsername(auditorUsername);
        if (auditor == null || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Senior Auditor: " + auditorUsername);
        }

        transaction.setUser2(auditor);
        transaction.setAssignedBy(archiver);
        transaction.setReportstatus("Assigned");
        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        System.out.println("Assigned task: ID=" + savedTransaction.getId() + ", user2=" + auditor.getUsername());
        return savedTransaction;
    }

    @Transactional
public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername,
        String currentUsername, MultipartFile supportingDocument) throws IOException {
    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    
    // Validate transaction status
    if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only submit findings for Assigned or Rejected reports");
    }
    
    // Fetch and validate the approver
    User approver = userRepository.findByUsername(approverUsername);
    if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Invalid Approver: " + approverUsername);
    }
    
    // Set transaction details
    transaction.setRemarks(findings);
    transaction.setUser2(approver);
    // Set status to "Corrected" if previously Rejected, otherwise "Under Review"
    transaction.setReportstatus(transaction.getReportstatus().equals("Rejected") ? "Corrected" : "Under Review");
    transaction.setSubmittedByAuditor(userRepository.findByUsername(currentUsername));
    
    // Handle supporting document
    if (supportingDocument != null && !supportingDocument.isEmpty()) {
        String supportingPath = fileStorageService.storeFile(supportingDocument, transaction, new Principal() {
            @Override
            public String getName() {
                return currentUsername;
            }
        }, true);
        transaction.setSupportingDocumentPath(supportingPath);
    }
    
    transaction.setLastModifiedBy(currentUsername);
    return masterTransactionRepository.save(transaction);
}

    @Transactional
public MasterTransaction approveReport(Integer transactionId, String currentUsername) {
    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    User currentUser = userRepository.findByUsername(currentUsername);
    if (currentUser == null
            || !currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
    }
    if (!Arrays.asList("Under Review", "Corrected").contains(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only approve reports in Under Review or Corrected status");
    }
    if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
        throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
    }
    transaction.setReportstatus("Approved");
    transaction.setLastModifiedBy(currentUsername);
    return masterTransactionRepository.save(transaction);
}

    @Transactional
public MasterTransaction rejectReport(Integer transactionId, String rejectionReason, String currentUsername,
        MultipartFile rejectionDocument) throws IOException {
    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    User currentUser = userRepository.findByUsername(currentUsername);
    if (currentUser == null
            || !currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
    }
    if (!Arrays.asList("Under Review", "Corrected").contains(transaction.getReportstatus())) {
        throw new IllegalStateException("Can only reject reports in Under Review or Corrected status");
    }
    if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
        throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
    }
    transaction.setReportstatus("Rejected");
    transaction.setRemarks(rejectionReason);
    if (rejectionDocument != null && !rejectionDocument.isEmpty()) {
        String rejectionPath = fileStorageService.storeFile(rejectionDocument, transaction, new Principal() {
            @Override
            public String getName() {
                return currentUsername;
            }
        }, true);
        transaction.setSupportingDocumentPath(rejectionPath);
    }
    transaction.setUser2(transaction.getSubmittedByAuditor());
    transaction.setLastModifiedBy(currentUsername);
    return masterTransactionRepository.save(transaction);
}

    public List<MasterTransaction> getTasks(Long userId, String role) {
        List<MasterTransaction> tasks = new ArrayList<>();
        System.out.println("Fetching tasks for userId=" + userId + ", role=" + role);
        switch (role) {
            case "ARCHIVER":
                tasks = masterTransactionRepository.findTasksAssignedByArchiver(userId);
                System.out.println("ARCHIVER tasks fetched: " + tasks.size());
                break;
            case "SENIOR_AUDITOR":
                List<MasterTransaction> activeTasks = masterTransactionRepository.findActiveSeniorAuditorTasks(userId);
                List<MasterTransaction> approvedTasks = masterTransactionRepository.findApprovedSeniorAuditorTasks(userId);
                System.out.println("SENIOR_AUDITOR active tasks: " + activeTasks.size());
                activeTasks.forEach(task -> System.out.println("Active task: ID=" + task.getId() + 
                    ", Status=" + task.getReportstatus() + 
                    ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") + 
                    ", Docname=" + task.getDocname()));
                System.out.println("SENIOR_AUDITOR approved tasks: " + approvedTasks.size());
                approvedTasks.forEach(task -> System.out.println("Approved task: ID=" + task.getId() + 
                    ", Status=" + task.getReportstatus() + 
                    ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") + 
                    ", Docname=" + task.getDocname()));
                tasks.addAll(activeTasks);
                tasks.addAll(approvedTasks);
                break;
            case "APPROVER":
                List<String> underReview = Collections.singletonList("Under Review");
                List<String> completed = Arrays.asList("Approved", "Rejected");
                tasks.addAll(masterTransactionRepository.findApproverTasks(userId, underReview));
                tasks.addAll(masterTransactionRepository.findCompletedApproverTasks(userId, completed));
                System.out.println("APPROVER tasks fetched: " + tasks.size());
                break;
            default:
                throw new IllegalArgumentException("Invalid role: " + role);
        }
        System.out.println("Total tasks returned: " + tasks.size());
        tasks.forEach(task -> System.out.println("Task: ID=" + task.getId() + 
            ", Status=" + task.getReportstatus() + 
            ", User2=" + (task.getUser2() != null ? task.getUser2().getId() : "null") + 
            ", Docname=" + task.getDocname()));
        return tasks;
    }

    public List<MasterTransactionDTO> getApprovedReports(String username, String role) {
        List<MasterTransaction> reports;
        if ("ARCHIVER".equals(role) || "APPROVER".equals(role)) {
            reports = masterTransactionRepository.findByReportstatus("Approved");
        } else if ("SENIOR_AUDITOR".equals(role)) {
            User user = userRepository.findByUsername(username);
            if (user == null) {
                throw new IllegalArgumentException("User not found: " + username);
            }
            reports = masterTransactionRepository.findByReportstatusAndSubmittedByAuditor("Approved", user);
        } else {
            throw new IllegalArgumentException("Invalid role for approved reports: " + role);
        }
        System.out.println("Fetched " + reports.size() + " approved reports for " + username + " (" + role + ")");
        reports.forEach(report -> {
            System.out.println("Report: ID=" + report.getId() +
                    ", CreatedDate=" + report.getCreatedDate() +
                    ", Org=" + (report.getOrganization() != null ? report.getOrganization().getOrgname() : "null") +
                    ", FiscalYear=" + report.getFiscal_year() +
                    ", ReportType="
                    + (report.getTransactiondocument() != null ? report.getTransactiondocument().getReportype()
                            : "null")
                    +
                    ", Status=" + report.getReportstatus() +
                    ", Docname=" + report.getDocname());
        });
        return reports.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
    }
  public List<MasterTransaction> getUnderReviewReports() {
    return masterTransactionRepository.findUnderReviewReports();
}
public List<MasterTransaction> getCorrectedReports() {
    return masterTransactionRepository.findCorrectedReports();
}
}