package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.models.Document;
import com.kindsonthegenius.inventoryms_springboot_api.models.Directorate;
import com.kindsonthegenius.inventoryms_springboot_api.services.DocumentService;
import com.kindsonthegenius.inventoryms_springboot_api.services.DirectorateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.kindsonthegenius.inventoryms_springboot_api.dto.DocumentRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;

@RestController
@RequestMapping("/documents")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = {"Authorization", "Content-Type", "*"},
             allowCredentials = "true")
public class DocumentController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;
    private final DirectorateService directorateService;

    @Autowired
    public DocumentController(DocumentService documentService, DirectorateService directorateService) {
        this.documentService = documentService;
        this.directorateService = directorateService;
    }

    @GetMapping
    public ResponseEntity<Object> getAllDocuments() {
        try {
            logger.info("Fetching all documents");
            List<Document> documents = documentService.getAllDocuments();
            logger.info("Found {} documents", documents.size());
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            logger.error("Error fetching documents: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch documents: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Object> getDocumentById(@PathVariable String id) {
        logger.info("Fetching document with ID: {}", id);
        Document document = documentService.getDocumentById(id.trim());
        if (document == null) {
            logger.warn("Document {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found: " + id);
        }
        return ResponseEntity.ok(document);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Object> createDocument(@RequestBody DocumentRequest documentRequest) {
        logger.info("Received document request: {}", documentRequest);
        if (documentRequest.getId() == null || documentRequest.getId().trim().isEmpty() ||
            documentRequest.getReportype() == null || documentRequest.getReportype().trim().isEmpty() ||
            documentRequest.getDirectoratename() == null || documentRequest.getDirectoratename().trim().isEmpty()) {
            logger.warn("Invalid document request: missing or empty fields");
            return ResponseEntity.badRequest().body("Document ID, report type, and directorate name are required");
        }
        String id = documentRequest.getId().trim();
        String reportype = documentRequest.getReportype().trim();
        String directoratename = documentRequest.getDirectoratename().trim();

        if (documentService.getDocumentById(id) != null) {
            logger.warn("Document with ID {} already exists", id);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Document ID already exists");
        }
        Directorate directorate = directorateService.getDirectorateById(directoratename);
        if (directorate == null) {
            logger.warn("Directorate {} not found", directoratename);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Directorate not found: " + directoratename);
        }
        try {
            Document document = new Document();
            document.setId(id);
            document.setReportype(reportype);
            document.setDirectorate(directorate);
            document.setDirectoratename(directoratename); // Ensure directoratename is set for response
            Document saved = documentService.save(document);
            logger.info("Document created: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (DataIntegrityViolationException e) {
            logger.error("Database error creating document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Database error: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error creating document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create document: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Object> updateDocument(@PathVariable String id, @RequestBody DocumentRequest documentRequest) {
        logger.info("Updating document with ID: {}", id);
        if (!id.equals(documentRequest.getId()) ||
            documentRequest.getReportype() == null || documentRequest.getReportype().trim().isEmpty() ||
            documentRequest.getDirectoratename() == null || documentRequest.getDirectoratename().trim().isEmpty()) {
            logger.warn("Invalid update request for document ID: {}", id);
            return ResponseEntity.badRequest().body("Document ID in path and body must match, and report type and directorate name are required");
        }
        Document existing = documentService.getDocumentById(id);
        if (existing == null) {
            logger.warn("Document {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
        }
        Directorate directorate = directorateService.getDirectorateById(documentRequest.getDirectoratename().trim());
        if (directorate == null) {
            logger.warn("Directorate {} not found for update", documentRequest.getDirectoratename());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Directorate not found: " + documentRequest.getDirectoratename());
        }
        try {
            existing.setReportype(documentRequest.getReportype().trim());
            existing.setDirectorate(directorate);
            existing.setDirectoratename(documentRequest.getDirectoratename().trim()); // Ensure directoratename is set
            Document updated = documentService.save(existing);
            logger.info("Document updated: {}", updated.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update document: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Object> deleteDocument(@PathVariable String id) {
        logger.info("Deleting document with ID: {}", id);
        Document existing = documentService.getDocumentById(id);
        if (existing == null) {
            logger.warn("Document {} not found for deletion", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
        }
        try {
            documentService.deleteDocument(id);
            logger.info("Document deleted: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting document: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete document: " + e.getMessage());
        }
    }
}