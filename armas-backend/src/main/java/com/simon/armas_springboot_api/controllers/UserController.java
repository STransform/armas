package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.dto.UserRequest;
import com.simon.armas_springboot_api.dto.PasswordChangeRequest;
import com.simon.armas_springboot_api.exception.UserAlreadyExistException;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.services.RoleService;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import com.simon.armas_springboot_api.services.UserService;
import com.simon.armas_springboot_api.dto.PasswordResetRequest;
import org.springframework.http.HttpStatus;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
//import Map
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = {"Authorization", "Content-Type", "*"},
             allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final RoleService roleService;
    private final OrganizationRepository organizationRepository;
    private final DirectorateRepository directorateRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, RoleService roleService,
                          OrganizationRepository organizationRepository,
                          DirectorateRepository directorateRepository,
                          RoleRepository roleRepository,
                          UserRepository userRepository) {
        this.userService = userService;
        this.roleService = roleService;
        this.organizationRepository = organizationRepository;
        this.directorateRepository = directorateRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAllWithOrganizationsAndDirectorates().stream()
            .map(userService::convertToDTO) // Use userService.convertToDTO
            .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDTO getUserById(@PathVariable Long id) {
        User user = userRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return userService.convertToDTO(user); // Use userService.convertToDTO
    }

    @PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest) {
    logger.info("Creating user: {}, password: {}", userRequest.getUsername(), userRequest.getPassword());
    if ("admin".equals(userRequest.getPassword())) {
        logger.warn("Attempt to use restricted password for user: {}", userRequest.getUsername());
        return ResponseEntity.badRequest().body("Invalid password");
    }
    if (!userRequest.getPassword().equals(userRequest.getConfirmPassword())) {
        logger.warn("Password and confirm password do not match for user: {}", userRequest.getUsername());
        return ResponseEntity.badRequest().body("Password and confirm password do not match");
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
        return ResponseEntity.status(201).body(userService.convertToDTO(registeredUser));
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

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody User user) {
        UserDTO existingUser = userService.getUserById(id);
        if (existingUser != null) {
            user.setId(id);
            return ResponseEntity.ok(userService.convertToDTO(userService.save(user)));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        UserDTO existingUser = userService.getUserById(id);
        if (existingUser != null) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

@PostMapping("/change-password")
@PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER', 'ADMIN', 'USER')")
public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
    logger.info("Password change request received");
    try {
        // Retrieve username from authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            logger.warn("No authenticated user found. Authentication: {}", authentication);
            return ResponseEntity.status(401).body("User not authenticated");
        }
        String username = authentication.getName();
        logger.info("Authenticated username: {}", username);
        request.setUsername(username); // Set username in the request
        userService.changePassword(request);
        logger.info("Password changed successfully for user: {}", username);
        return ResponseEntity.ok("Password changed successfully");
    } catch (IllegalArgumentException e) {
        logger.warn("Password change failed: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        logger.error("Unexpected error during password change", e);
        return ResponseEntity.status(500).body("Failed to change password: " + e.getMessage());
    }
}
 @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long userId,
            @RequestBody PasswordResetRequest request) {
        try {
            userService.resetUserPassword(userId, request.getNewPassword(), request.getConfirmPassword());
            return ResponseEntity.ok().body(Map.of("message", "Password reset successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password: " + e.getMessage()));
        }
    }
}