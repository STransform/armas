package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.BudgetYear;
import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.repositories.BudgetYearRepository;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.services.MasterTransactionService;
import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import org.springframework.http.HttpStatus;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.GrantedAuthority;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.security.Principal;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

import java.util.Arrays;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/transactions")
public class MasterTransactionController {
    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MasterTransactionService masterTransactionService;

    @Autowired
    private BudgetYearRepository budgetYearRepository; // Add this

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MasterTransaction> uploadFile(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @RequestParam("reportcategory") String reportcategory,
            @RequestParam("budgetYearId") Long budgetYearId,
            @RequestParam("transactiondocumentid") String transactionDocumentId,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.uploadFile(
                file, budgetYearId, reportcategory, transactionDocumentId, principal);
        return ResponseEntity.ok(transaction);
    }

    // In MasterTransactionController.java
@GetMapping("/download/{id}/{type}")
@PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER', 'USER')")
public ResponseEntity<Resource> downloadFile(
        @PathVariable Integer id,
        @PathVariable String type,
        Principal principal) throws IOException {
    MasterTransaction transaction = masterTransactionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Transaction not found: " + id));

    // Restrict letter download to the original uploader (USER)
    if ("letter".equals(type)) {
        User currentUser = userRepository.findByUsername(principal.getName());
        if (currentUser == null || !currentUser.getId().equals(transaction.getUser().getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }

    String filePath;
    String fileName;
    if ("original".equals(type)) {
        filePath = transaction.getFilepath();
        fileName = transaction.getDocname();
    } else if ("supporting".equals(type)) {
        filePath = transaction.getSupportingDocumentPath();
        fileName = transaction.getSupportingDocname();
    } else if ("letter".equals(type)) {
        filePath = transaction.getLetterPath();
        fileName = transaction.getLetterDocname();
    } else {
        return ResponseEntity.badRequest().build();
    }

    if (filePath == null || fileName == null || !Files.exists(Paths.get(filePath))) {
        return ResponseEntity.notFound().build();
    }

    Resource resource = new UrlResource(Paths.get(filePath).toUri());
    String contentType = Files.probeContentType(Paths.get(filePath));
    if (contentType == null) {
        contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
    }

    return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
            .body(resource);
}
 @GetMapping("/my-reports")
@PreAuthorize("hasRole('USER')")
public ResponseEntity<List<MasterTransaction>> getMyReports(Principal principal) {
    User user = userRepository.findByUsername(principal.getName());
    if (user == null) {
        throw new IllegalStateException("User not found: " + principal.getName());
    }
    List<MasterTransaction> reports = masterTransactionRepository.findByUserIdWithLetters(user.getId());
    System.out.println("Fetched reports for user " + principal.getName() + ": " + reports.size());
    reports.forEach(report -> System.out.println("Report ID=" + report.getId() + ", LetterDocname=" + report.getLetterDocname()));
    return ResponseEntity.ok(reports);
}
    @PostMapping("/upload-letter/{transactionId}")
    @PreAuthorize("hasRole('ARCHIVER')")
    public ResponseEntity<MasterTransaction> uploadLetter(
            @PathVariable Integer transactionId,
            @RequestParam("letter") MultipartFile letter,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.uploadLetter(transactionId, letter, principal.getName());
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/sent-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER')")
    public ResponseEntity<List<SentReportResponseDTO>> getSentReports(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> auth.equals("ARCHIVER") || auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElse("USER");
        System.out.println("Fetching sent reports for role: " + role);
        return ResponseEntity.ok(masterTransactionService.getSentReportData(role));
    }

    @GetMapping("/listdocuments")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        System.out.println("User: " + SecurityContextHolder.getContext().getAuthentication().getName());
        System.out.println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        System.out.println("Fetched documents: " + documents);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/users-by-role/{roleName}")
    public ResponseEntity<?> getUsersByRole(@PathVariable String roleName) {
        try {
            System.out.println("Received request for users with role: " + roleName);
            List<UserDTO> users = masterTransactionService.getUsersByRole(roleName);
            System.out.println("Returning users: " + users);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("Error fetching users for role " + roleName + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to fetch users for role " + roleName + ": " + e.getMessage());
        }
    }

    @PostMapping("/assign/{transactionId}")
    @PreAuthorize("hasRole('ARCHIVER')")
    public ResponseEntity<MasterTransaction> assignAuditor(@PathVariable Integer transactionId,
            @RequestParam String auditorUsername,
            Principal principal) {
        MasterTransaction transaction = masterTransactionService.assignAuditor(transactionId, auditorUsername,
                principal.getName());
        return ResponseEntity.ok(transaction);
    }

@PostMapping("/submit-findings/{transactionId}")
    @PreAuthorize("hasRole('SENIOR_AUDITOR')")
    public ResponseEntity<?> submitFindings(
            @PathVariable Integer transactionId,
            @RequestParam String remarks,
            @RequestParam String approverUsername,
            @RequestParam String responseNeeded,
            @RequestParam(value = "supportingDocument", required = false) MultipartFile supportingDocument,
            Principal principal) {
        try {
            MasterTransaction transaction = masterTransactionService.submitFindings(transactionId, remarks,
                    approverUsername, responseNeeded, principal.getName(), supportingDocument);
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException | IllegalStateException e) {
            System.err.println("Validation error: " + e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            System.err.println("File storage error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to store file: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An unexpected error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/approved-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getApprovedReports(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> auth.equals("ARCHIVER") || auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("User does not have required role"));

        List<MasterTransactionDTO> approvedReports = masterTransactionService.getApprovedReports(principal.getName(),
                role);
        return ResponseEntity.ok(approvedReports);
    }

    @PostMapping("/approve/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> approveReport(
            @PathVariable Integer transactionId,
            @RequestParam(value = "approvalDocument", required = false) org.springframework.web.multipart.MultipartFile approvalDocument,
            Principal principal) throws IOException {
        System.out.println("Received approve request: transactionId=" + transactionId + ", principal=" + principal.getName());
        MasterTransaction transaction = masterTransactionService.approveReport(transactionId, principal.getName(), approvalDocument);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/reject/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> rejectReport(
            @PathVariable Integer transactionId,
            @RequestParam String rejectionReason,
            @RequestParam(value = "rejectionDocument", required = false) org.springframework.web.multipart.MultipartFile rejectionDocument,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.rejectReport(transactionId, rejectionReason,
                principal.getName(), rejectionDocument);
        return ResponseEntity.ok(transaction);
    }

@GetMapping("/rejected-reports")
@PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
public ResponseEntity<List<MasterTransaction>> getRejectedReports() {
    List<MasterTransaction> reports = masterTransactionRepository.findByReportStatus("Rejected");
    System.out.println("Rejected reports fetched: " + reports.size());
    reports.forEach(report -> {
        System.out.println("Report ID=" + report.getId() +
                ", Orgname=" + (report.getOrganization() != null ? report.getOrganization().getOrgname() : "null") +
                ", FiscalYear=" + (report.getBudgetYear() != null ? report.getBudgetYear().getFiscalYear() : "null") +
                ", ReportType=" + (report.getTransactiondocument() != null ? report.getTransactiondocument().getReportype() : "null") +
                ", ResponseNeeded=" + report.getResponse_needed());
    });
    return ResponseEntity.ok(reports);
}

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getTasks(Principal principal) {
        User user = userRepository.findByUsername(principal.getName());
        if (user == null) {
            throw new IllegalStateException("User not found: " + principal.getName());
        }

        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> Arrays.asList("ARCHIVER", "SENIOR_AUDITOR", "APPROVER").contains(auth))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No valid role found"));

        List<MasterTransaction> tasks = masterTransactionService.getTasks(user.getId(), role);
        List<MasterTransactionDTO> taskDTOs = tasks.stream()
                .map(MasterTransactionDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(taskDTOs);
    }

    @GetMapping("/under-review-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR')")
    public ResponseEntity<List<MasterTransaction>> getUnderReviewReports() {
        List<MasterTransaction> reports = masterTransactionService.getUnderReviewReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/corrected-reports")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR')")
    public ResponseEntity<List<MasterTransaction>> getCorrectedReports() {
        List<MasterTransaction> reports = masterTransactionService.getCorrectedReports();
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/budget-years")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER')")
    public ResponseEntity<List<BudgetYear>> getBudgetYears() {
        List<BudgetYear> budgetYears = budgetYearRepository.findAll();
        return ResponseEntity.ok(budgetYears);
    }

    @PostMapping("/budget-years")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BudgetYear> createBudgetYear(@RequestBody BudgetYear budgetYear) {
        BudgetYear saved = budgetYearRepository.save(budgetYear);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/report-non-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<Organization>> getReportNonSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        List<Organization> nonSenders = masterTransactionService.getReportNonSenders(reportype, fiscalYear);
        return ResponseEntity.ok(nonSenders);
    }

    @GetMapping("/reports-by-org")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getReportsByOrgAndFilters(
            @RequestParam String reportype,
            @RequestParam String fiscalYear,
            @RequestParam String orgId) {
        List<MasterTransactionDTO> reports = masterTransactionService.getReportsByOrgAndFilters(reportype, fiscalYear, orgId);
        return ResponseEntity.ok(reports);
    }

    @GetMapping("/organizations-with-reports")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<Organization>> getAllOrganizationsWithReports() {
        List<Organization> organizations = masterTransactionService.getAllOrganizationsWithReports();
        return ResponseEntity.ok(organizations);
    }

    @GetMapping("/feedback-non-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<Organization>> getFeedbackNonSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        List<Organization> nonSenders = masterTransactionService.getFeedbackNonSenders(reportype, fiscalYear);
        return ResponseEntity.ok(nonSenders);
    }

    @GetMapping("/feedback-senders")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransactionDTO>> getFeedbackSenders(
            @RequestParam String reportype,
            @RequestParam String fiscalYear) {
        List<MasterTransactionDTO> senders = masterTransactionService.getFeedbackSenders(reportype, fiscalYear);
        return ResponseEntity.ok(senders);
    }
}