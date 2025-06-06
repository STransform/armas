package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Notification;
import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.repositories.NotificationRepository;
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
    private BudgetYearRepository budgetYearRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private DocumentRepository documentRepository;
    @Autowired
    private OrganizationRepository organizationRepository;
    @Autowired
    private NotificationRepository notificationRepository;
    
    private void createNotification(User user, String title, String message, String entityType, Long entityId, String context) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setEntityType(entityType);
        notification.setEntityId(entityId);
        notification.setContext(context);
        notificationRepository.save(notification);
    }

    // Upload file by Uploader
   @Transactional
    public MasterTransaction uploadFile(MultipartFile file, Long budgetYearId, String reportcategory,
            String transactionDocumentId, Principal principal) throws IOException {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }

        String docname = file.getOriginalFilename();
        if (masterTransactionRepository.existsByDocnameAndUser(docname, user)) {
            throw new IllegalArgumentException("Document already exists");
        }

        Document document = documentRepository.findById(transactionDocumentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found"));

        // Fetch BudgetYear by ID
        BudgetYear budgetYear = budgetYearRepository.findById(budgetYearId)
                .orElseThrow(() -> new IllegalArgumentException("Budget Year not found: " + budgetYearId));

        // Validation for Feedback category
        if ("Feedback".equalsIgnoreCase(reportcategory.trim())) {
            List<MasterTransaction> existingReports = masterTransactionRepository.findTransactionByDocumentId(
               "Report", transactionDocumentId, user.getOrganization().getId(), budgetYear.getFiscalYear());
            if (existingReports.isEmpty()) {
                throw new IllegalArgumentException("Report for this feedback was not uploaded. Upload the report first!");
            }
            boolean hasResponseNeededYes = existingReports.stream()
                    .anyMatch(report -> "Yes".equalsIgnoreCase(report.getResponse_needed()));
            if (!hasResponseNeededYes) {
                throw new IllegalArgumentException(
                        "The uploaded report’s response_needed is not set to 'Yes'. Wait until the experts respond to your report.");
            }
        }

        MasterTransaction transaction = new MasterTransaction();
        transaction.setUser(user);
        transaction.setUser2(null);
        transaction.setOrganization(user.getOrganization());
        transaction.setDocname(docname);
        transaction.setReportstatus("Submitted");
        transaction.setReportcategory(reportcategory);
        transaction.setBudgetYear(budgetYear); // Set BudgetYear entity
        transaction.setTransactiondocument(document);
        transaction.setFilepath(fileStorageService.storeFile(file, transaction, principal, false));
        transaction.setCreatedDate(new Date());
        transaction.setCreatedBy(principal.getName());

        if ("Report".equalsIgnoreCase(reportcategory.trim())) {
            transaction.setResponse_needed("Pending");
        }

        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        // Notify all ARCHIVER users
        List<User> archivers = userRepository.findByRoleName("ARCHIVER");
        for (User archiver : archivers) {
            createNotification(
                        archiver,
                        "New Report Uploaded",
                        "A new report '" + savedTransaction.getDocname() + "' has been uploaded by " + principal.getName(),
                        "MasterTransaction",
                        savedTransaction.getId().longValue(),
                        "report_uploaded"
                    );
        }

        return savedTransaction;
    }
    
    @Transactional
    public MasterTransaction uploadLetter(Integer transactionId, MultipartFile letter, String currentUsername) throws IOException {
        User archiver = userRepository.findByUsername(currentUsername);
        if (archiver == null || !archiver.getRoles().stream().anyMatch(r -> "ARCHIVER".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Unauthorized: Must be an ARCHIVER");
        }

        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));

        if (letter == null || letter.isEmpty()) {
            throw new IllegalArgumentException("Letter file is required");
        }

        String letterPath = fileStorageService.storeFile(letter, transaction, new Principal() {
            @Override
            public String getName() {
                return currentUsername;
            }
        }, true); // true indicates a supporting/letter file

        transaction.setLetterPath(letterPath);
        transaction.setLetterDocname(letter.getOriginalFilename());
        transaction.setLastModifiedBy(currentUsername);

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
        if (auditor == null
                || !auditor.getRoles().stream().anyMatch(r -> "SENIOR_AUDITOR".equals(r.getDescription()))) {
            throw new IllegalArgumentException("Invalid Senior Auditor: " + auditorUsername);
        }

        transaction.setUser2(auditor);
        transaction.setAssignedBy(archiver);
        transaction.setReportstatus("Assigned");
        transaction.setLastModifiedBy(currentUsername);
        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

         // Notify the assigned SENIOR_AUDITOR
        createNotification(
                auditor,
                "Task Assigned",
                "You have been assigned to evaluate report '" + savedTransaction.getDocname() + "'",
                "MasterTransaction",
                savedTransaction.getId().longValue(),
                "task_assigned"
            );

        System.out.println("Assigned task: ID=" + savedTransaction.getId() + ", user2=" + auditor.getUsername());
        return savedTransaction;
    }

@Transactional
public MasterTransaction submitFindings(Integer transactionId, String findings, String approverUsername,
        String responseNeeded, String currentUsername, MultipartFile supportingDocument) throws IOException {
    System.out.println("Starting submitFindings: transactionId=" + transactionId + ", currentUsername=" + currentUsername);
    
    MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
    System.out.println("Transaction found: status=" + transaction.getReportstatus());

    if (!Arrays.asList("Assigned", "Rejected").contains(transaction.getReportstatus())) {
        System.out.println("Invalid status: " + transaction.getReportstatus());
        throw new IllegalStateException("Can only submit findings for Assigned or Rejected reports");
    }

    User approver = userRepository.findByUsername(approverUsername);
    System.out.println("Approver fetched: " + (approver != null ? approver.getUsername() : "null"));
    if (approver == null || !approver.getRoles().stream().anyMatch(r -> "APPROVER".equals(r.getDescription()))) {
        throw new IllegalArgumentException("Invalid Approver: " + approverUsername);
    }

    if (!Arrays.asList("Pending", "Yes", "No").contains(responseNeeded)) {
        throw new IllegalArgumentException("Invalid response_needed value: " + responseNeeded);
    }

    User currentUser = userRepository.findByUsername(currentUsername);
    System.out.println("Current user: " + (currentUser != null ? currentUser.getUsername() : "null"));
    if (currentUser == null) {
        throw new IllegalArgumentException("Current user not found: " + currentUsername);
    }

    transaction.setRemarks(findings);
    transaction.setUser2(approver);
    transaction.setReportstatus(transaction.getReportstatus().equals("Rejected") ? "Corrected" : "Under Review");
    transaction.setSubmittedByAuditor(currentUser);
    transaction.setResponse_needed(responseNeeded);

    if (supportingDocument != null && !supportingDocument.isEmpty()) {
        try {
            String supportingPath = fileStorageService.storeFile(supportingDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            transaction.setSupportingDocumentPath(supportingPath);
            transaction.setSupportingDocname(supportingDocument.getOriginalFilename());
            System.out.println("Supporting document stored: " + supportingPath);
        } catch (IOException e) {
            System.err.println("File storage failed: " + e.getMessage());
            throw e;
        }
    }

    transaction.setLastModifiedBy(currentUsername);
   MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        // Notify the selected APPROVER
        createNotification(
                approver,
                "New Task for Review",
                "A task '" + savedTransaction.getDocname() + "' has been submitted for your review by " + currentUsername,
                "MasterTransaction",
                savedTransaction.getId().longValue(),
                "task_evaluated"
            );

        System.out.println("Transaction saved: ID=" + savedTransaction.getId());
        return savedTransaction;
}
    @Transactional
    public MasterTransaction approveReport(Integer transactionId, String currentUsername,
            MultipartFile approvalDocument) throws IOException {
        MasterTransaction transaction = masterTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + transactionId));
        // ... validation ...
        transaction.setReportstatus("Approved");
        transaction.setLastModifiedBy(currentUsername);

        if (approvalDocument != null && !approvalDocument.isEmpty()) {
            String approvalPath = fileStorageService.storeFile(approvalDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            transaction.setSupportingDocumentPath(approvalPath);
            System.out.println(
                    "Approver attachment: Path=" + approvalPath + ", Name=" + transaction.getSupportingDocname());
        } else {
            System.out.println("No Approver attachment provided for transaction ID=" + transactionId);
        }

        MasterTransaction savedTransaction = masterTransactionRepository.save(transaction);

        // Notify the ARCHIVER who assigned the task
        if (savedTransaction.getAssignedBy() != null) {
           createNotification(
                    savedTransaction.getAssignedBy(),
                    "Task Approved",
                    "The task '" + savedTransaction.getDocname() + "' you assigned has been approved",
                    "MasterTransaction",
                    savedTransaction.getId().longValue(),
                    "task_approved"
                );
        }

        System.out.println("Saved transaction: ID=" + savedTransaction.getId() +
                ", SupportingDocumentPath=" + savedTransaction.getSupportingDocumentPath() +
                ", SupportingDocname=" + savedTransaction.getSupportingDocname());
        return savedTransaction;
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
        transaction.setReason_of_rejection(rejectionReason); // Store in new field
        if (rejectionDocument != null && !rejectionDocument.isEmpty()) {
            String rejectionPath = fileStorageService.storeFile(rejectionDocument, transaction, new Principal() {
                @Override
                public String getName() {
                    return currentUsername;
                }
            }, true);
            transaction.setSupportingDocumentPath(rejectionPath);
            transaction.setSupportingDocname(rejectionDocument.getOriginalFilename());
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
                List<MasterTransaction> approvedTasks = masterTransactionRepository
                        .findApprovedSeniorAuditorTasks(userId);
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
                ", FiscalYear=" + (report.getBudgetYear() != null ? report.getBudgetYear().getFiscalYear() : "null") +
                ", SupportingDocname=" + report.getSupportingDocname());
    });
    return reports.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
}
public List<MasterTransactionDTO> getRejectedReports() {
    List<MasterTransaction> reports = masterTransactionRepository.findRejectedReports();
    System.out.println("Fetched " + reports.size() + " rejected reports");
    reports.forEach(report -> {
        System.out.println("Report: ID=" + report.getId() +
                ", FiscalYear=" + (report.getBudgetYear() != null ? report.getBudgetYear().getFiscalYear() : "null"));
    });
    return reports.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
}

    public List<MasterTransaction> getUnderReviewReports() {
        return masterTransactionRepository.findUnderReviewReports();
    }

    public List<MasterTransaction> getCorrectedReports() {
        return masterTransactionRepository.findCorrectedReports();
    }

    public List<Organization> getReportNonSenders(String reportype, String fiscalYear) {
    System.out.println("Fetching report non-senders: reportype=" + reportype + ", fiscalYear=" + fiscalYear);
    try {
        // Validate parameters
        if (reportype == null || reportype.trim().isEmpty()) {
            throw new IllegalArgumentException("Report type is required");
        }
        if (fiscalYear == null || fiscalYear.trim().isEmpty()) {
            throw new IllegalArgumentException("Fiscal year is required");
        }
        // Check if BudgetYear exists
        boolean budgetYearExists = budgetYearRepository.existsByFiscalYear(fiscalYear);
        if (!budgetYearExists) {
            System.out.println("No BudgetYear found for fiscalYear: " + fiscalYear);
            return new ArrayList<>(); // Return empty list if no matching budget year
        }
        // Check if Document exists
        boolean documentExists = documentRepository.existsByReportype(reportype);
        if (!documentExists) {
            System.out.println("No Document found for reportype: " + reportype);
            return new ArrayList<>(); // Return empty list if no matching document
        }
        List<Organization> nonSenders = masterTransactionRepository.findReportNonSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        System.out.println("Found " + nonSenders.size() + " non-senders");
        return nonSenders;
    } catch (Exception e) {
        System.err.println("Error fetching report non-senders: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch report non-senders: " + e.getMessage(), e);
    }
}
    public List<MasterTransactionDTO> getReportsByOrgAndFilters(String reportype, String fiscalYear, String orgId) {
        List<MasterTransaction> transactions = masterTransactionRepository
                .findReportsByOrgAndReportTypeAndBudgetYear(reportype, fiscalYear, orgId);
        return transactions.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
    }

    public List<Organization> getAllOrganizationsWithReports() {
        return masterTransactionRepository.findAllOrganizationsWithReports();
    }

    public List<Organization> getFeedbackNonSenders(String reportype, String fiscalYear) {
    System.out.println("Fetching feedback non-senders: reportype=" + reportype + ", fiscalYear=" + fiscalYear);
    try {
        // Validate parameters
        if (reportype == null || reportype.trim().isEmpty()) {
            throw new IllegalArgumentException("Report type is required");
        }
        if (fiscalYear == null || fiscalYear.trim().isEmpty()) {
            throw new IllegalArgumentException("Fiscal year is required");
        }
        // Check if BudgetYear exists
        boolean budgetYearExists = budgetYearRepository.existsByFiscalYear(fiscalYear);
        if (!budgetYearExists) {
            System.out.println("No BudgetYear found for fiscalYear: " + fiscalYear);
            return new ArrayList<>(); // Return empty list if no matching budget year
        }
        // Check if Document exists
        boolean documentExists = documentRepository.existsByReportype(reportype);
        if (!documentExists) {
            System.out.println("No Document found for reportype: " + reportype);
            return new ArrayList<>(); // Return empty list if no matching document
        }
        List<Organization> nonSenders = masterTransactionRepository.findFeedbackNonSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        System.out.println("Found " + nonSenders.size() + " feedback non-senders");
        return nonSenders;
    } catch (Exception e) {
        System.err.println("Error fetching feedback non-senders: " + e.getMessage());
        e.printStackTrace();
        throw new RuntimeException("Failed to fetch feedback non-senders: " + e.getMessage(), e);
    }
}

    public List<MasterTransactionDTO> getFeedbackSenders(String reportype, String fiscalYear) {
        List<MasterTransaction> transactions = masterTransactionRepository
                .findFeedbackSendersByReportTypeAndBudgetYear(reportype, fiscalYear);
        return transactions.stream().map(MasterTransactionDTO::new).collect(Collectors.toList());
    }


    public long getTotalOrganizations() {
    return organizationRepository.count();
}

public long getTotalReportTypes() {
    return documentRepository.count();
}

public long getSendersCount(String fiscalYear) {
    return masterTransactionRepository.countSendersByFiscalYear(fiscalYear);
}

public long getNonSendersCount(String fiscalYear) {
    return getTotalOrganizations() - getSendersCount(fiscalYear);
}

public long getSendersCountForReportType(String reportype, String fiscalYear) {
    return masterTransactionRepository.countSendersByReportTypeAndFiscalYear(reportype, fiscalYear);
}

public long getNonSendersCountForReportType(String reportype, String fiscalYear) {
    return getTotalOrganizations() - getSendersCountForReportType(reportype, fiscalYear);
}
}