package com.kindsonthegenius.inventoryms_springboot_api.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.exception.UserAlreadyExistException;
import com.kindsonthegenius.inventoryms_springboot_api.models.User;
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
@RequestMapping("/api/users")
@PreAuthorize("hasAuthority('ADMIN')")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserWithRelations(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping
    
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> requestBody) {
        try {
            logger.info("Attempting to register user: {}", requestBody.get("username"));
            User user = new User();
            user.setFirstName((String) requestBody.get("firstName"));
            user.setLastName((String) requestBody.get("lastName"));
            user.setUsername((String) requestBody.get("username"));
            user.setPassword((String) requestBody.get("password"));
            String role = (String) requestBody.get("role"); // Expecting "ADMIN" or "USER"
            if (!role.equals("ADMIN") && !role.equals("USER")) {
                return ResponseEntity.badRequest().body("Invalid role: Must be ADMIN or USER");
            }
            User registeredUser = userService.register(user, role);
            logger.info("User registered successfully: {}", registeredUser.getUsername());
            return ResponseEntity.status(201).body(registeredUser);
        } catch (UserAlreadyExistException e) {
            logger.warn("User registration failed: {}", e.getMessage());
            return ResponseEntity.status(409).body("User already exists: " + e.getMessage());
        } catch (Exception e) {
            logger.error("Unexpected error during user registration", e);
            return ResponseEntity.status(500).body("Failed to register user: " + e.getMessage());
        }
    }
    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasAuthority('ADMIN')") // Restrict to admins
    public ResponseEntity<User> assignRoleToUser(@PathVariable Long userId, @PathVariable Long roleId) {
        try {
            User updatedUser = userService.assignRoleToUser(userId, roleId);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        User existingUser = userService.getUserById(id);
        if (existingUser != null) {
            user.setId(id);
            return ResponseEntity.ok(userService.save(user));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        User existingUser = userService.getUserById(id);
        if (existingUser != null) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}