package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.dto.UserRequest;
import com.kindsonthegenius.inventoryms_springboot_api.exception.UserAlreadyExistException;
import com.kindsonthegenius.inventoryms_springboot_api.models.Directorate;
import com.kindsonthegenius.inventoryms_springboot_api.models.Organization;
import com.kindsonthegenius.inventoryms_springboot_api.models.User;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.DirectorateRepository;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.OrganizationRepository;
import com.kindsonthegenius.inventoryms_springboot_api.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, 
             allowedHeaders = {"Authorization", "Content-Type", "*"}, 
             allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    
    @Autowired
     private OrganizationRepository organizationRepository;

    @Autowired
    private DirectorateRepository directorateRepository;
    @Autowired
    public UserController(UserService userService,OrganizationRepository organizationRepository,DirectorateRepository directorateRepository) {
        this.userService = userService;
        this.directorateRepository= directorateRepository;
        this.organizationRepository= organizationRepository;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserWithRelations(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

@PostMapping
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest) {
    logger.info("Creating user: {}, password: {}", userRequest.getUsername(), userRequest.getPassword());
    if ("admin".equals(userRequest.getPassword())) {
        logger.warn("Attempt to use restricted password for user: {}", userRequest.getUsername());
        return ResponseEntity.badRequest().body("Invalid password");
    }
    try {
        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
        user.setConfirmPassword(userRequest.getConfirmPassword());

        // Handle organization
        if (userRequest.getOrganizationId() != null && !userRequest.getOrganizationId().isBlank()) {
            Organization org = organizationRepository.findById(userRequest.getOrganizationId())
                    .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + userRequest.getOrganizationId()));
            user.setOrganization(org);
        }

        // Handle directorate
        if (userRequest.getDirectorateId() != null && !userRequest.getDirectorateId().isBlank()) {
            Directorate dir = directorateRepository.findById(userRequest.getDirectorateId())
                    .orElseThrow(() -> new IllegalArgumentException("Directorate not found: " + userRequest.getDirectorateId()));
            user.setDirectorate(dir);
        }

        String role = userRequest.getRole();
        if (role == null || (!role.equals("ADMIN") && !role.equals("USER"))) {
            role = "USER";
        }
        User registeredUser = userService.register(user, role);
        logger.info("User registered successfully: {}", registeredUser.getUsername());
        return ResponseEntity.status(201).body(registeredUser);
    } catch (UserAlreadyExistException e) {
        logger.warn("User registration failed: {}", e.getMessage());
        return ResponseEntity.status(409).body("User already exists: " + e.getMessage());
    } catch (IllegalArgumentException e) {
        logger.warn("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        logger.error("Unexpected error during user registration", e);
        return ResponseEntity.status(500).body("Failed to register user: " + e.getMessage());
    }
}
    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        try {
            User updatedUser = userService.assignRoleToUser(userId, roleId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User existingUser = userService.getUserById(id);
        if (existingUser != null) {
            user.setId(id);
            return ResponseEntity.ok(userService.save(user));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User existingUser = userService.getUserById(id);
        if (existingUser != null) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}