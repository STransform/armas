package com.kindsonthegenius.inventoryms_springboot_api.repositories;

import com.kindsonthegenius.inventoryms_springboot_api.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
}