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
        transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal));
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
            statuses = Arrays.asList("Submitted", "Approved"); // Include Approved for ARCHIVER
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
        if (auditor == null
                || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Senior Auditor");
        }

        transaction.setUser2(auditor);
        transaction.setReportstatus("Assigned");
        transaction.setLastModifiedBy(currentUsername);
        return masterTransactionRepository.save(transaction);
    }

    // Submit findings by Senior Auditor
    @Transactional
    public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername,
            String currentUsername, MultipartFile supportingDocument) throws IOException {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only submit findings for Assigned or Rejected reports");
        }
        User approver = userRepository.findByUsername(approverUsername);
        if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Approver: " + approverUsername);
        }
        transaction.setRemarks(findings);
        transaction.setUser2(approver);
        transaction.setReportstatus("Under Review");
        transaction.setSubmittedByAuditor(userRepository.findByUsername(currentUsername));
        if (supportingDocument != null && !supportingDocument.isEmpty()) {
            String supportingPath = fileStorageService.storeFile(supportingDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            });
            transaction.setSupportingDocumentPath(supportingPath);
        }
        transaction.setLastModifiedBy(currentUsername);
        return masterTransactionRepository.save(transaction);
    }

    // Approve by Approver
    @Transactional
    public MasterTransaction approveReport(Integer transactionId, String currentUsername) {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        User currentUser = userRepository.findByUsername(currentUsername);
        if (currentUser == null
                || !currentUser.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must have APPROVER role");
        }
        if (!"Under Review".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only approve reports in Under Review status");
        }
        if (transaction.getUser2() == null || !transaction.getUser2().getId().equals(currentUser.getId())) {
            throw new IllegalArgumentException("Unauthorized: Must be the assigned Approver");
        }
        transaction.setReportstatus("Approved");
        transaction.setLastModifiedBy(currentUsername);
        return masterTransactionRepository.save(transaction);
    }

    // Reject by Approver
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
        if (!"Under Review".equals(transaction.getReportstatus())) {
            throw new IllegalStateException("Can only reject reports in Under Review status");
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
            });
            transaction.setSupportingDocumentPath(rejectionPath); // Overwrite with rejection document
        }
        transaction.setUser2(transaction.getSubmittedByAuditor()); // Reassign to Senior Auditor
        transaction.setLastModifiedBy(currentUsername);
        return masterTransactionRepository.save(transaction);
    }

    // Get tasks based on role and user
    public List<MasterTransaction> getTasks(String username, String role) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            System.out.println("User not found: " + username);
            throw new IllegalArgumentException("User not found: " + username);
        }
        System.out.println("Fetching tasks for user: " + username + ", role: " + role + ", userId: " + user.getId());

        if ("ARCHIVER".equals(role)) {
            List<MasterTransaction> submitted = masterTransactionRepository.findByReportStatus("Submitted");
            List<MasterTransaction> approved = masterTransactionRepository.findByReportStatus("Approved");
            List<MasterTransaction> tasks = new ArrayList<>(submitted);
            tasks.addAll(approved);
            System.out.println("Archiver tasks: " + tasks.size());
            tasks.forEach(task -> System.out.println("Archiver task: id=" + task.getId() +
                    ", status=" + task.getReportstatus()));
            return tasks;
        } else if ("SENIOR_AUDITOR".equals(role)) {
            List<MasterTransaction> tasks = masterTransactionRepository.findSeniorAuditorTasks(
                    user.getId(), Arrays.asList("Assigned", "Rejected"), username);
            System.out.println("Senior Auditor tasks: " + tasks.size());
            tasks.forEach(task -> System.out.println("Senior Auditor task: id=" + task.getId() +
                    ", status=" + task.getReportstatus() +
                    ", user2_id=" + (task.getUser2() != null ? task.getUser2().getId() : "null") +
                    ", submittedByAuditor_id="
                    + (task.getSubmittedByAuditor() != null ? task.getSubmittedByAuditor().getId() : "null")));
            return tasks;
        } else if ("APPROVER".equals(role)) {
            List<MasterTransaction> activeTasks = masterTransactionRepository.findApproverTasks(
                    user.getId(), Arrays.asList("Under Review"));
            List<MasterTransaction> completedTasks = masterTransactionRepository.findCompletedApproverTasks(username);
            List<MasterTransaction> tasks = new ArrayList<>(activeTasks);
            tasks.addAll(completedTasks);
            System.out.println("Approver tasks: active=" + activeTasks.size() + ", completed=" + completedTasks.size());
            tasks.forEach(task -> System.out.println("Approver task: id=" + task.getId() +
                    ", status=" + task.getReportstatus() +
                    ", user2_id=" + (task.getUser2() != null ? task.getUser2().getId() : "null") +
                    ", lastModifiedBy=" + task.getLastModifiedBy()));
            return tasks;
        }
        System.out.println("No tasks found for role: " + role);
        return Collections.emptyList();
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

}