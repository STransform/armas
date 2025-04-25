package com.simon.armas_springboot_api.security.repositories;

import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Role findByDescription(String description);
}
