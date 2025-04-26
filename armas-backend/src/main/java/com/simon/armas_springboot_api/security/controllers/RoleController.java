package com.simon.armas_springboot_api.security.controllers;

import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.repositories.PrivilegeRepository;
import com.simon.armas_springboot_api.security.services.RoleService;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.services.UserService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/roles")
@Transactional
public class RoleController {

    private final PrivilegeRepository privilegeRepository;
    private final RoleService roleService;
    private final UserService userService;

    @Autowired
    public RoleController(PrivilegeRepository privilegeRepository, RoleService roleService, UserService userService) {
        this.privilegeRepository = privilegeRepository;
        this.roleService = roleService;
        this.userService = userService;
    }

    @GetMapping
    public List<Role> getAllRoles() {
        return roleService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Role> getRoleById(@PathVariable Long id) {
        Role role = roleService.findById(id);
        return role != null ? ResponseEntity.ok(role) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Role> createRole(@RequestBody Role role) {
        Role savedRole = roleService.save(role);
        return ResponseEntity.status(201).body(savedRole);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roleId}/assign/user/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> assignUserRole(@PathVariable("roleId") Long roleId, @PathVariable("userId") Long userId) {
        roleService.assignUserRole(userId, roleId);
        UserDTO updatedUser = userService.getUserById(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{roleId}/unassign/user/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> unAssignUserRole(@PathVariable("roleId") Long roleId, @PathVariable("userId") Long userId) {
        roleService.unAssignUserRole(userId, roleId);
        UserDTO updatedUser = userService.getUserById(userId);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{roleId}/privileges")
    @PreAuthorize("hasAuthority('ADMIN')")
    public List<Privilege> getPrivilegesInRole(@PathVariable("roleId") Long roleId) {
        return roleService.getPrivilegesInRole(roleId);
    }
}