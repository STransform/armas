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
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, 
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, 
             allowedHeaders = {"Authorization", "Content-Type", "*"}, 
             allowCredentials = "true")
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
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        User user = userService.getUserWithRelations(id);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> requestBody) {
        String username = (String) requestBody.get("username");
        String password = (String) requestBody.get("password");
        logger.info("Creating user: {}, password: {}", username, password);
        if ("admin".equals(password)) {
            logger.warn("Attempt to use restricted password for user: {}", username);
            return ResponseEntity.badRequest().body("Invalid password");
        }
        try {
            User user = new User();
            user.setFirstName((String) requestBody.get("firstName"));
            user.setLastName((String) requestBody.get("lastName"));
            user.setUsername(username);
            user.setPassword(password);
            user.setConfirmPassword(password);
            String role = (String) requestBody.get("role");
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