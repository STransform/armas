package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.models.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.services.MasterTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import com.simon.armas_springboot_api.dto.UserDTO;
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
    private MasterTransactionService masterTransactionService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MasterTransaction> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("response_needed") String responseNeeded,
            @RequestParam("fiscal_year") String fiscal_year,
            @RequestParam("transactiondocumentid") String transactiondocumentid,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.uploadFile(file, responseNeeded, fiscal_year, transactiondocumentid, principal);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/download/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<Resource> downloadFile(@PathVariable Integer id) throws IOException {
        Path filePath = masterTransactionService.getFilePath(id);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/sent-reports")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<SentReportResponseDTO>> getSentReports(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.equals("ARCHIVER") || auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElse("USER");
        System.out.println("Fetching sent reports for role: " + role);
        return ResponseEntity.ok(masterTransactionService.getSentReportData(role));
    }

    @GetMapping("/listdocuments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        System.out.println("User: " + SecurityContextHolder.getContext().getAuthentication().getName());
        System.out.println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        System.out.println("Fetched documents: " + documents);
        return ResponseEntity.ok(documents);
    }

    @GetMapping("/users-by-role/{roleName}")
    @PreAuthorize("hasAnyRole('ARCHIVER', 'SENIOR_AUDITOR', 'APPROVER')")
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
                                                          @RequestParam String auditorUsername) {
        MasterTransaction transaction = masterTransactionService.assignAuditor(transactionId, auditorUsername);
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/submit-findings/{transactionId}")
    @PreAuthorize("hasRole('SENIOR_AUDITOR')")
    public ResponseEntity<MasterTransaction> submitFindings(@PathVariable Integer transactionId,
                                                           @RequestParam String findings,
                                                           @RequestParam String approverUsername,
                                                           Principal principal) {
        MasterTransaction transaction = masterTransactionService.submitFindings(transactionId, findings, approverUsername, principal.getName());
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/approve/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> approveReport(@PathVariable Integer transactionId, Principal principal) {
        MasterTransaction transaction = masterTransactionService.approveReport(transactionId, principal.getName());
        return ResponseEntity.ok(transaction);
    }

    @PostMapping("/reject/{transactionId}")
    @PreAuthorize("hasRole('APPROVER')")
    public ResponseEntity<MasterTransaction> rejectReport(@PathVariable Integer transactionId,
                                                         @RequestParam String auditorUsername,
                                                         Principal principal) {
        MasterTransaction transaction = masterTransactionService.rejectReport(transactionId, principal.getName(), auditorUsername);
        return ResponseEntity.ok(transaction);
    }

    @GetMapping("/tasks")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER')")
    public ResponseEntity<List<MasterTransaction>> getTasks(Principal principal) {
        String role = SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(auth -> auth.equals("SENIOR_AUDITOR") || auth.equals("APPROVER"))
                .findFirst()
                .orElse("USER");
        System.out.println("Fetching tasks for user: " + principal.getName() + ", role: " + role);
        return ResponseEntity.ok(masterTransactionService.getTasks(principal.getName(), role));
    }
}