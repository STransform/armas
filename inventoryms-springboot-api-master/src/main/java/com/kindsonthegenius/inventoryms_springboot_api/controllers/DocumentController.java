package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.models.Document;
import com.kindsonthegenius.inventoryms_springboot_api.models.Directorate;
import com.kindsonthegenius.inventoryms_springboot_api.services.DocumentService;
import com.kindsonthegenius.inventoryms_springboot_api.services.DirectorateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;
    private final DirectorateService directorateService;

    @Autowired
    public DocumentController(DocumentService documentService, DirectorateService directorateService) {
        this.documentService = documentService;
        this.directorateService = directorateService;
    }

    @GetMapping
    public List<Document> getAllDocuments() {
        return documentService.getAllDocuments();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        Document document = documentService.getDocumentById(id);
        if (document != null) {
            return ResponseEntity.ok(document);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

@PostMapping
public ResponseEntity<Document> createDocument(@RequestBody Document documentRequest) {
    try {
        System.out.println("Received document request: " + documentRequest);
        // Validate request
        if (documentRequest.getId() == null || documentRequest.getReportype() == null || 
            documentRequest.getdirectoratename() == null) {
            return ResponseEntity.badRequest().build();
        }

        // Check if document already exists
        if (documentService.getDocumentById(documentRequest.getId()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Fetch the Directorate entity by name
        Directorate directorate = directorateService.getDirectorateById(documentRequest.getdirectoratename());
        if (directorate == null) {
            return ResponseEntity.notFound().build();
        }

        // Create and save the document
        Document document = new Document();
        document.setId(documentRequest.getId());
        document.setReportype(documentRequest.getReportype());
        document.setDirectorate(directorate);

        Document savedDocument = documentService.save(document);
        return ResponseEntity.ok(savedDocument);
    } catch (Exception e) {
        return ResponseEntity.internalServerError().build();
    }
}
    
    @PutMapping("/{id}")
    public ResponseEntity<Document> updateDocument(@PathVariable String id, @RequestBody Document documentRequest) {
        try {
            // Validate request
            if (!id.equals(documentRequest.getId()) || documentRequest.getReportype() == null || 
                documentRequest.getdirectoratename() == null) {
                return ResponseEntity.badRequest().build();
            }
    
            // Fetch existing document
            Document existingDocument = documentService.getDocumentById(id);
            if (existingDocument == null) {
                return ResponseEntity.notFound().build();
            }
    
            // Fetch the Directorate entity
            Directorate directorate = directorateService.getDirectorateById(documentRequest.getdirectoratename());
            if (directorate == null) {
                return ResponseEntity.notFound().build();
            }
    
            // Update the document
            existingDocument.setReportype(documentRequest.getReportype());
            existingDocument.setDirectorate(directorate);
    
            Document updatedDocument = documentService.save(existingDocument);
            return ResponseEntity.ok(updatedDocument);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable String id) {
        Document existingDocument = documentService.getDocumentById(id);
        if (existingDocument != null) {
            documentService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}