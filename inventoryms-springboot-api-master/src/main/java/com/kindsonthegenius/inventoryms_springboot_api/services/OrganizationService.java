package com.kindsonthegenius.inventoryms_springboot_api.services;

import com.kindsonthegenius.inventoryms_springboot_api.models.Organization;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.OrganizationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;
    @Autowired
    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }
    public List<Organization> getAllOrganizations() {
        return organizationRepository.findAll();
    }
    public Organization getOrganizationById(String id) {
        return organizationRepository.findById(id).orElse(null);
    }
    public Organization save(Organization organization) {
        return organizationRepository.save(organization);
    }
    public void deleteOrganization(String id) {
        organizationRepository.deleteById(id);
    }
    public Object findById(String id) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findById'");
    }
}