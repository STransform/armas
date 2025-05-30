package com.simon.armas_springboot_api.controllers;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.services.DirectorateService;


import java.util.List;

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
    public List<Directorate> getAllDirectorates() {
        logger.info("Fetching all directorates");
        return directorateService.getAllDirectorates();
    }

    @GetMapping("/{directoratename}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Directorate> getDirectorateById(@PathVariable String directoratename) {
        logger.info("Fetching directorate with name: {}", directoratename);
        Directorate directorate = directorateService.getDirectorateById(directoratename);
        if (directorate != null) {
            return ResponseEntity.ok(directorate);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Directorate> createDirectorate(@RequestBody Directorate directorate) {
        logger.info("Creating directorate: {}", directorate.getDirectoratename());
        try {
            Directorate savedDirectorate = directorateService.save(directorate);
            return ResponseEntity.ok(savedDirectorate);
        } catch (Exception e) {
            logger.error("Error creating directorate: {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{directoratename}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Directorate> updateDirectorate(@PathVariable String directoratename, @RequestBody Directorate directorate) {
        logger.info("Updating directorate with name: {}", directoratename);
        Directorate existingDirectorate = directorateService.getDirectorateById(directoratename);
        if (existingDirectorate != null) {
            directorate.setDirectoratename(directoratename); // Ensure the ID is not changed
            return ResponseEntity.ok(directorateService.save(directorate));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{directoratename}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteDirectorate(@PathVariable String directoratename) {
        logger.info("Deleting directorate with name: {}", directoratename);
        Directorate existingDirectorate = directorateService.getDirectorateById(directoratename);
        if (existingDirectorate != null) {
            directorateService.deleteDirectorate(directoratename);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
