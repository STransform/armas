package com.simon.armas_springboot_api.controllers;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.annotation.*;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import com.simon.armas_springboot_api.services.DirectorateService;
import com.simon.armas_springboot_api.dto.DirectorateDTO;
import org.springframework.dao.DataIntegrityViolationException;

import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/directorates")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = {"Authorization", "Content-Type", "*"},
             allowCredentials = "true")
public class DirectorateController {

    private static final Logger logger = LoggerFactory.getLogger(DirectorateController.class);
    private final DirectorateService directorateService;

    @Autowired
    public DirectorateController(DirectorateService directorateService) {
        this.directorateService = directorateService;
    }

    @GetMapping
    public ResponseEntity<Object> getAllDirectorates() {
        try {
            logger.info("Fetching all directorates");
            List<Directorate> directorates = directorateService.getAllDirectorates();
            logger.info("Found {} directorates", directorates.size());
            return ResponseEntity.ok(directorates);
        } catch (Exception e) {
            logger.error("Error fetching directorates: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to fetch directorates: " + e.getMessage());
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> createDirectorate(@RequestBody DirectorateDTO directorateRequest) {
        logger.info("Received directorate request: {}", directorateRequest);
        if (directorateRequest.getDirectoratename() == null || directorateRequest.getDirectoratename().trim().isEmpty()) {
            logger.warn("Invalid directorate request: directorate name is required");
            return ResponseEntity.badRequest().body("Directorate name is required");
        }
        String directoratename = directorateRequest.getDirectoratename().trim();
        logger.info("Processed directoratename: '{}'", directoratename);

        // Check for existing directorate with case-insensitive comparison
        if (directorateService.existsByDirectoratenameIgnoreCase(directoratename)) {
            logger.warn("Directorate with name '{}' already exists", directoratename);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Directorate name already exists: " + directoratename);
        }

        try {
            Directorate directorate = new Directorate();
            directorate.setDirectoratename(directoratename);
            directorate.setTelephone(directorateRequest.getTelephone() != null ? directorateRequest.getTelephone().trim() : null);
            directorate.setEmail(directorateRequest.getEmail() != null ? directorateRequest.getEmail().trim() : null);
            Directorate saved = directorateService.save(directorate);
            logger.info("Directorate created: {}", saved.getId());
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            logger.error("Unexpected error creating directorate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to create directorate: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> updateDirectorate(@PathVariable String id, @RequestBody DirectorateDTO directorateRequest) {
        logger.info("Updating directorate with ID: {}", id);
        if (directorateRequest.getDirectoratename() == null || directorateRequest.getDirectoratename().trim().isEmpty()) {
            logger.warn("Invalid update request for directorate ID: {}", id);
            return ResponseEntity.badRequest().body("Directorate name is required");
        }
        Directorate existing = directorateService.getDirectorateById(id);
        if (existing == null) {
            logger.warn("Directorate {} not found", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Directorate not found");
        }

        String directoratename = directorateRequest.getDirectoratename().trim();
        // Check if the new directoratename is taken by another directorate
        Directorate existingByName = directorateService.getDirectorateByNameIgnoreCase(directoratename);
        if (existingByName != null && !existingByName.getId().equals(id)) {
            logger.warn("Directorate name '{}' already exists", directoratename);
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Directorate name already exists: " + directoratename);
        }

        try {
            existing.setDirectoratename(directoratename);
            existing.setTelephone(directorateRequest.getTelephone() != null ? directorateRequest.getTelephone().trim() : null);
            existing.setEmail(directorateRequest.getEmail() != null ? directorateRequest.getEmail().trim() : null);
            Directorate updated = directorateService.save(existing);
            logger.info("Directorate updated: {}", updated.getId());
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            logger.error("Error updating directorate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update directorate: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> deleteDirectorate(@PathVariable String id) {
        logger.info("Deleting directorate with ID: {}", id);
        Directorate existing = directorateService.getDirectorateById(id);
        if (existing == null) {
            logger.warn("Directorate {} not found for deletion", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Directorate not found");
        }
        try {
            directorateService.deleteDirectorate(id);
            logger.info("Directorate deleted: {}", id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            logger.error("Error deleting directorate: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to delete directorate: " + e.getMessage());
        }
    }
}