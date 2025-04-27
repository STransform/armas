package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.MasterTransaction;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import com.simon.armas_springboot_api.services.MasterTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
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
    public ResponseEntity<MasterTransaction> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("reportstatus") String reportstatus,
            @RequestParam("fiscal_year") String fiscal_year,
            @RequestParam("transactiondocumentid") String transactiondocumentid,
            Principal principal) throws IOException {
        MasterTransaction transaction = masterTransactionService.uploadFile(file, reportstatus, fiscal_year, transactiondocumentid, principal);
        return ResponseEntity.ok(transaction);
    }
    @GetMapping("/download/{id}")
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
    public ResponseEntity<List<SentReportResponseDTO>> getSentReports() {
        return ResponseEntity.ok(masterTransactionService.getSentReportData());
    }

    @GetMapping("/listdocuments")
    public ResponseEntity<List<Document>> getAllDocuments() {
        List<Document> documents = documentRepository.findAll();
        System.out.println("Fetched documents: " + documents);
        return ResponseEntity.ok(documents);
    }
}