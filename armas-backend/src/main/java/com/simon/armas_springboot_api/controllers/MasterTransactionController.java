package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.repositories.MasterTransactionRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.services.MasterTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.dto.MasterTransactionDTO;
import com.simon.armas_springboot_api.dto.SentReportResponseDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;
//import Arrays
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.nio.file.Files;
//import SentReportResponseDTO;
import com.simon.armas_springboot_api.dto.SentReportResponseDTO;

import java.io.IOException;
import java.nio.file.Path;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/transactions")
public class MasterTransactionController {
    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private MasterTransactionRepository masterTransactionRepository;

    @Autowired
    private MasterTransactionService masterTransactionService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<MasterTransaction> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("response_needed") String responseNeeded,
            @RequestParam("fiscal_year") String fiscalYear,
            @RequestParam("transactiondocumentid") String transactionDocumentId,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.uploadFile(file, responseNeeded, fiscalYear,
                transactionDocumentId, principal);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/download/{id}/{type}")
    @PreAuthorize("hasAnyRole('APPROVER', 'SENIOR_AUDITOR', 'ARCHIVER', 'USER')")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer id, @PathVariable String type)
            throws IOException {
        Map<String, Path> paths = masterTransactionService.getFilePaths(id);
        Path filePath = type.equals("original") ? paths.get("original") : paths.get("supporting");
        if (filePath == null || !Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }
        Resource resource = new UrlResource(filePath.toUri());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
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
    public ResponseEntity<MasterTransaction> submitFindings(
            @PathVariable Integer transactionId,
            @RequestParam String findings,
            @RequestParam String approverUsername,
            @RequestParam(value = "supportingDocument", required = false) MultipartFile supportingDocument,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.submitFindings(transactionId, findings,
                approverUsername, principal.getName(), supportingDocument);
        return ResponseEntity.ok(transaction);
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
            Principal principal) {
        System.out.println(
                "Received approve request: transactionId=" + transactionId + ", principal=" + principal.getName());
        MasterTransaction transaction = masterTransactionService.approveReport(
                transactionId, principal.getName());
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/reject/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> rejectReport(
            @PathVariable Integer transactionId,
            @RequestParam String rejectionReason,
            @RequestParam(value = "rejectionDocument", required = false) MultipartFile rejectionDocument,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.rejectReport(transactionId, rejectionReason,
                principal.getName(), rejectionDocument);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/rejected-reports")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransaction>> getRejectedReports() {
        return ResponseEntity.ok(masterTransactionRepository.findByReportStatus("Rejected"));
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransaction>> getTasks(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .map(auth -> auth.replace("ROLE_", ""))
                .filter(auth -> Arrays.asList("ARCHIVER", "SENIOR_AUDITOR", "APPROVER").contains(auth))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No valid role found"));
        List<MasterTransaction> tasks = masterTransactionService.getTasks(principal.getName(), role);
        return ResponseEntity.ok(tasks);
    }

}