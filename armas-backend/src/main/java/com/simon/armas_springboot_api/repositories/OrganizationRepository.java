package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;


@Repository
public interface OrganizationRepository extends JpaRepository<Organization, String> {
    List<Organization> findAll();
}