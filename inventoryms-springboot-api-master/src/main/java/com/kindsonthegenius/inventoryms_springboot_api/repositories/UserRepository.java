package com.kindsonthegenius.inventoryms_springboot_api.repositories;

import com.kindsonthegenius.inventoryms_springboot_api.models.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
    
    @Query("SELECT u FROM User u JOIN FETCH u.organization JOIN FETCH u.directorate")
    List<User> findAllWithOrganizationsAndDirectorates();

    // Fixed method: Use a standard name and rely on @EntityGraph
    @EntityGraph(attributePaths = {"organization", "directorate"})
    Optional<User> findById(Long id); // Changed from findByIdWithOrganizationsAndDirectorates

}