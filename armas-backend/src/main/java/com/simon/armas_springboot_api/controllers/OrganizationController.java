package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.services.OrganizationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/organizations")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = {"Authorization", "Content-Type", "*"},
             allowCredentials = "true")
public class OrganizationController {

    private static final Logger logger = LoggerFactory.getLogger(OrganizationController.class);
    private final OrganizationService organizationService;

    @Autowired
    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @GetMapping
    public List<Organization> getAllOrganizations() {
        logger.info("Fetching all organizations");
        return organizationService.getAllOrganizations();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Organization> getOrganizationById(@PathVariable String id) {
        logger.info("Fetching organization with ID: {}", id);
        Organization organization = organizationService.getOrganizationById(id);
        if (organization != null) {
            return ResponseEntity.ok(organization);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Organization createOrganization(@RequestBody Organization organization) {
        logger.info("Creating organization: {}", organization.getOrgname());
        return organizationService.save(organization);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Organization> updateOrganization(@PathVariable String id, @RequestBody Organization organization) {
        logger.info("Updating organization with ID: {}", id);
        Organization existingOrganization = organizationService.getOrganizationById(id);
        if (existingOrganization != null) {
            organization.setId(id);
            return ResponseEntity.ok(organizationService.save(organization));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrganization(@PathVariable String id) {
        logger.info("Deleting organization with ID: {}", id);
        Organization existingOrganization = organizationService.getOrganizationById(id);
        if (existingOrganization != null) {
            organizationService.deleteOrganization(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}