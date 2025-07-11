package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.User;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    @Query("SELECT u FROM User u JOIN FETCH u.organization JOIN FETCH u.directorate")
    List<User> findAllWithOrganizationsAndDirectorates();

    @Query("SELECT u FROM User u JOIN FETCH u.roles")
    List<User> findAll();

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.description = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.description = :roleName AND u.organization.id = :organizationId")
    List<User> findByRoleNameAndOrganizationId(@Param("roleName") String roleName, @Param("organizationId") String organizationId);


    @Query("SELECT u FROM User u JOIN FETCH u.organization JOIN FETCH u.directorate WHERE u.id = :id")
    Optional<User> findByIdWithRelations(@Param("id") Long id);
}