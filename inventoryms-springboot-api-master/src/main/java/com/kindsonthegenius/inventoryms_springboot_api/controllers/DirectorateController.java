package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.models.Directorate;
import com.kindsonthegenius.inventoryms_springboot_api.services.DirectorateService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/#/buttons/directorates")
@PreAuthorize("hasAuthority('ADMIN')")
public class DirectorateController {

    private final DirectorateService directorateService;

    @Autowired
    public DirectorateController(DirectorateService directorateService) {
        this.directorateService = directorateService;
    }

    @GetMapping
    public List<Directorate> getAllDirectorates() {
        return directorateService.getAllDirectorates();
    }

    @GetMapping("/{directoratename}")
    public ResponseEntity<Directorate> getDirectorateById(@PathVariable String directoratename) {
        Directorate directorate = directorateService.getDirectorateById(directoratename);
        if (directorate != null) {
            return ResponseEntity.ok(directorate);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Directorate createDirectorate(@RequestBody Directorate directorate) {
        return directorateService.save(directorate);
    }

    @PutMapping("/{directoratename}")
    public ResponseEntity<Directorate> updateDirectorate(@PathVariable String directoratename, @RequestBody Directorate directorate) {
        Directorate existingDirectorate = directorateService.getDirectorateById(directoratename);
        if (existingDirectorate != null) {
            directorate.setDirectoratename(directoratename); // Ensure the ID is preserved
            return ResponseEntity.ok(directorateService.save(directorate));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{directoratename}")
    public ResponseEntity<Void> deleteDirectorate(@PathVariable String directoratename) {
        Directorate existingDirectorate = directorateService.getDirectorateById(directoratename);
        if (existingDirectorate != null) {
            directorateService.deleteDirectorate(directoratename);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}