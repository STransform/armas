package com.kindsonthegenius.inventoryms_springboot_api.security.services;


import com.kindsonthegenius.inventoryms_springboot_api.models.User;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.UserRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private static final Logger log = LoggerFactory.getLogger(AuthenticationService.class);
    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final UserRepository userRepository;

    public AuthenticationService(BCryptPasswordEncoder bCryptPasswordEncoder, UserRepository userRepository) {
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.userRepository = userRepository;
    }

    public boolean authenticate(String username, String password) {
        log.info("Authenticating user: {}", username);
        if (username == null || password == null) {
            log.warn("Username or password is null");
            return false;
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            log.warn("User not found: {}", username);
            throw new UsernameNotFoundException("User not found: " + username);
        }

        try {
            boolean passwordMatches = bCryptPasswordEncoder.matches(password, user.getPassword());
            if (!passwordMatches) {
                log.warn("Invalid password for user: {}", username);
                return false;
            }
            log.info("Authentication successful for user: {}", username);
            return true;
        } catch (IllegalArgumentException e) {
            log.warn("Invalid password hash for user: {}. Treating as authentication failure.", username, e);
            return false; // Treat invalid hash as failed authentication
        }
    }
}