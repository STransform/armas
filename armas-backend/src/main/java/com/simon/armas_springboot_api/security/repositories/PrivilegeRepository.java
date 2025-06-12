package com.simon.armas_springboot_api.security.repositories;

import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {
    public List<Privilege> findByRoleid(Long roleid);
    Privilege findByDescription(String description);
}