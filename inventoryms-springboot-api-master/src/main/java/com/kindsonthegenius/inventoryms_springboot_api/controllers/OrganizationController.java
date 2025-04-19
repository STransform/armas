package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.models.Organization;
import com.kindsonthegenius.inventoryms_springboot_api.services.OrganizationService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@PreAuthorize("hasAuthority('ADMIN')")
public class OrganizationController {

    private final OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public List<Organization> getAllOrganizations() {
        return organizationService.getAllOrganizations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable String id) {
        Organization organization = organizationService.getOrganizationById(id);
        if (organization != null) {
            return ResponseEntity.ok(organization);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public Organization createOrganization(@RequestBody Organization organization) {
        return organizationService.save(organization);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Organization> updateOrganization(@PathVariable String id, @RequestBody Organization organization) {
        Organization existingOrganization = organizationService.getOrganizationById(id);
        if (existingOrganization != null) {
            organization.setId(id);
            return ResponseEntity.ok(organizationService.save(organization));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String id) {
        Organization existingOrganization = organizationService.getOrganizationById(id);
        if (existingOrganization != null) {
            organizationService.deleteOrganization(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}