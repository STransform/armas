package com.simon.armas_springboot_api.security.controllers;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.security.models.UserPrincipal;
import com.simon.armas_springboot_api.security.services.AuthenticationService;
import com.simon.armas_springboot_api.security.models.LoginRequest;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.services.TokenService;
import com.simon.armas_springboot_api.security.services.UserPrivilegeAssignmentService;
import com.simon.armas_springboot_api.services.UserService;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final UserService userService;
    private final UserPrivilegeAssignmentService userPrivilegeAssignmentService;
    private final TokenService tokenService;
    private final AuthenticationService authenticationService;

    public AuthController(UserService userService, UserPrivilegeAssignmentService userPrivilegeAssignmentService,
                          TokenService tokenService, AuthenticationService authenticationService) {
        this.userService = userService;
        this.userPrivilegeAssignmentService = userPrivilegeAssignmentService;
        this.tokenService = tokenService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login") // Changed from "/api/v1/login" to "/login"
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        log.info("Login attempt for username: {}", loginRequest.getUsername());
        try {
            if (loginRequest.getUsername() == null || loginRequest.getPassword() == null) {
                log.warn("Invalid login request: username or password is null");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Username and password are required"));
            }

            boolean isAuthenticated = authenticationService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            if (!isAuthenticated) {
                log.warn("Authentication failed for username: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid username or password"));
            }

            User user = userService.getUserByUsername(loginRequest.getUsername());
            if (user == null) {
                log.error("User not found after authentication: {}", loginRequest.getUsername());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of("error", "User not found after authentication"));
            }

            UserPrincipal principal = new UserPrincipal(userPrivilegeAssignmentService, user);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    user.getUsername(), null, principal.getAuthorities()
            );

            String jwtToken = tokenService.generateToken(authentication);

            List<String> roles = user.getRoles().stream()
                    .map(Role::getDescription)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("roles", roles);

            log.info("Login successful for username: {}", loginRequest.getUsername());
            return ResponseEntity.ok(response);
        } catch (UsernameNotFoundException e) {
            log.warn("User not found: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid username or password"));
        } catch (Exception e) {
            log.error("Unexpected error during login for username: {}", loginRequest.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "An error occurred during login: " + e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout() {
        log.info("User logged out");
        return ResponseEntity.ok("Logout successful");
    }
}