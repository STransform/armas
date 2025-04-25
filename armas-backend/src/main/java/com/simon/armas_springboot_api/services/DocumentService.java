package com.simon.armas_springboot_api.services;

import com.simon.armas_springboot_api.models.Document;
import com.simon.armas_springboot_api.repositories.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    @Autowired
    public DocumentService(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }
    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
    public Document getDocumentById(String id) {
        return documentRepository.findById(id).orElse(null);
    }
    public Document save(Document document) {
        return documentRepository.save(document);
    }
    public void deleteDocument(String id) {
        documentRepository.deleteById(id);
    }
}