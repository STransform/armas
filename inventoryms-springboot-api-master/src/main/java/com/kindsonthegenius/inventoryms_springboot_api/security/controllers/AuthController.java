package com.kindsonthegenius.inventoryms_springboot_api.security.controllers;

import com.kindsonthegenius.inventoryms_springboot_api.models.User;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.UserPrincipal;
import com.kindsonthegenius.inventoryms_springboot_api.security.services.AuthenticationService;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.LoginRequest;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.Role;
import com.kindsonthegenius.inventoryms_springboot_api.security.services.TokenService;
import com.kindsonthegenius.inventoryms_springboot_api.security.services.UserPrivilegeAssignmentService;
import com.kindsonthegenius.inventoryms_springboot_api.services.UserService;
import jakarta.servlet.http.HttpSession;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final UserService userService;

    private final UserPrivilegeAssignmentService userPrivilegeAssignmentService;
    private final TokenService tokenService;
    private final AuthenticationService authenticationService;

    public AuthController(UserService userService, UserPrivilegeAssignmentService userPrivilegeAssignmentService, TokenService tokenService, AuthenticationService authenticationService) {
        this.userService = userService;
        this.userPrivilegeAssignmentService = userPrivilegeAssignmentService;
        this.tokenService = tokenService;
        this.authenticationService = authenticationService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest, HttpSession session) {
        try {
            boolean isAuthenticated = authenticationService.authenticate(loginRequest.getUsername(), loginRequest.getPassword());
            if (isAuthenticated) {
                User user = userService.getUserByUsername(loginRequest.getUsername());
                UserPrincipal principal = new UserPrincipal(userPrivilegeAssignmentService, user);
                Authentication authentication = new UsernamePasswordAuthenticationToken(user, null, principal.getAuthorities());
                String jwtToken = tokenService.generateToken(authentication);
                session.setAttribute("user", loginRequest.getUsername());

                // Extract roles
                List<String> roles = user.getRoles().stream()
                    .map(Role::getDescription)
                    .collect(Collectors.toList());

                Map<String, Object> response = new HashMap<>();
                response.put("token", jwtToken);
                response.put("roles", roles);
                response.put("username", user.getUsername());

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "An error occurred during login"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();  // Invalidate the session
        return ResponseEntity.ok("Logout successful");
    }

}
