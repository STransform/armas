package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.services.DocumentService;
import com.simon.armas_springboot_api.services.DirectorateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.simon.armas_springboot_api.dto.DocumentRequest;
import com.simon.armas_springboot_api.dto.DocumentDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/documents")
@CrossOrigin(
    origins = {"http://localhost:3000", "http://localhost:3001"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
    allowedHeaders = {"Authorization", "Content-Type", "*"},
    allowCredentials = "true"
)
public class DocumentController {

    private static final Logger logger = LoggerFactory.getLogger(DocumentController.class);
    private final DocumentService documentService;
    private final DirectorateService directorateService;

    @Autowired
    public DocumentController(DocumentService documentService, DirectorateService directorateService) {
        this.documentService = documentService;
        this.directorateService = directorateService;
    }

    private DocumentDTO toDTO(Document document) {
        DocumentDTO dto = new DocumentDTO();
        dto.setId(document.getId());
        dto.setReportype(document.getReportype());
        dto.setDirectoratename(document.getDirectorate() != null ? document.getDirectorate().getDirectoratename() : null);
        return dto;
    }

    @GetMapping
    public ResponseEntity<Object> getAllDocuments() {
        try {
            logger.info("Fetching all documents");
            List<Document> documents = documentService.getAllDocuments();
            List<DocumentDTO> documentDTOs = documents.stream().map(this::toDTO).collect(Collectors.toList());
            logger.info("Found {} documents", documentDTOs.size());
            return ResponseEntity.ok(documentDTOs);
        } catch (Exception e) {
            logger.error("Error fetching documents: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to fetch documents: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> getDocumentById(@PathVariable String id) {
        logger.info("Fetching document with ID: {}", id);
        Document document = documentService.getDocumentById(id.trim());
        if (document == null) {
            logger.warn("Document {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found: " + id);
        }
        return ResponseEntity.ok(toDTO(document));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> createDocument(@RequestBody DocumentRequest documentRequest) {
        logger.info("Received document request: {}", documentRequest);
        if (documentRequest.getId() == null || documentRequest.getId().trim().isEmpty() ||
            documentRequest.getReportype() == null || documentRequest.getReportype().trim().isEmpty() ||
            documentRequest.getDirectorateId() == null || documentRequest.getDirectorateId().trim().isEmpty()) {
            logger.warn("Invalid document request: missing or empty fields");
            return ResponseEntity.badRequest().body("Document ID, report type, and directorate ID are required");
        }
        String id = documentRequest.getId().trim();
        String reportype = documentRequest.getReportype().trim();
        String directorateId = documentRequest.getDirectorateId().trim();
        logger.info("Processed document ID: '{}', reportype: '{}', directorateId: '{}'", id, reportype, directorateId);

        if (documentService.getDocumentById(id) != null) {
            logger.warn("Document with ID {} already exists", id);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Document ID already exists: " + id);
        }

        if (documentService.existsByReportype(reportype)) {
            logger.warn("Document with reportype {} already exists", reportype);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Report type already exists: " + reportype);
        }

        Directorate directorate = directorateService.getDirectorateById(directorateId);
        if (directorate == null) {
            logger.warn("Directorate with ID '{}' not found in database", directorateId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Directorate not found: " + directorateId);
        }

        try {
            Document document = new Document();
            document.setId(id);
            document.setReportype(reportype);
            document.setDirectorate(directorate);
            logger.debug("Saving document: {}", document);
            Document saved = documentService.save(document);
            logger.info("Document created: {}", saved.getId());
            return ResponseEntity.ok(toDTO(saved));
        } catch (DataIntegrityViolationException e) {
            logger.error("Database error creating document: {}", e.getMessage(), e);
            String errorMessage = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
            if (errorMessage.contains("foreign key constraint")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid directorate ID: " + directorateId);
            } else if (errorMessage.contains("unique constraint") || errorMessage.contains("reportype")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Report type already exists: " + reportype);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Database error: " + errorMessage);
        } catch (Exception e) {
            logger.error("Unexpected error creating document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to create document: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> updateDocument(@PathVariable String id, @RequestBody DocumentRequest documentRequest) {
        logger.info("Updating document with ID: {}", id);
        if (!id.equals(documentRequest.getId()) ||
            documentRequest.getReportype() == null || documentRequest.getReportype().trim().isEmpty() ||
            documentRequest.getDirectorateId() == null || documentRequest.getDirectorateId().trim().isEmpty()) {
            logger.warn("Invalid update request for document ID: {}", id);
            return ResponseEntity.badRequest()
                .body("Document ID in path and body must match, and report type and directorate ID are required");
        }
        Document existing = documentService.getDocumentById(id);
        if (existing == null) {
            logger.warn("Document {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
        }

        String reportype = documentRequest.getReportype().trim();
        if (!reportype.equals(existing.getReportype()) && documentService.existsByReportype(reportype)) {
            logger.warn("Report type {} already exists for another document", reportype);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Report type already exists: " + reportype);
        }

        Directorate directorate = directorateService.getDirectorateById(documentRequest.getDirectorateId().trim());
        if (directorate == null) {
            logger.warn("Directorate with ID '{}' not found for update", documentRequest.getDirectorateId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body("Directorate not found: " + documentRequest.getDirectorateId());
        }

        try {
            existing.setReportype(reportype);
            existing.setDirectorate(directorate);
            logger.debug("Updating document: {}", existing);
            Document updated = documentService.save(existing);
            logger.info("Document updated: {}", updated.getId());
            return ResponseEntity.ok(toDTO(updated));
        } catch (DataIntegrityViolationException e) {
            logger.error("Database error updating document: {}", e.getMessage(), e);
            String errorMessage = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();
            if (errorMessage.contains("foreign key constraint")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Invalid directorate ID: " + documentRequest.getDirectorateId());
            } else if (errorMessage.contains("unique constraint") || errorMessage.contains("reportype")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Report type already exists: " + reportype);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("Database error: " + errorMessage);
        } catch (Exception e) {
            logger.error("Error updating document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to update document: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
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
            logger.error("Error deleting document: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Failed to delete document: " + e.getMessage());
        }
    }
}