package com.simon.armas_springboot_api.security.services;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.services.UserPrivilegeAssignmentService;

import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.models.UserPrincipal;

import java.util.HashSet;
import java.util.List;
import java.util.ArrayList;

import java.util.Set;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {
    private static final Logger logger = LoggerFactory.getLogger(MyUserDetailsService.class);
    private final UserPrivilegeAssignmentService assignmentService;
    private final UserRepository userRepository;

    @Autowired
    public MyUserDetailsService(UserPrivilegeAssignmentService assignmentService, UserRepository userRepository) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
    }

   @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        logger.info("Loading user: {}", username);
        User user = userRepository.findByUsername(username);
        if (user == null) {
            logger.error("User not found: {}", username);
            throw new UsernameNotFoundException("User not found: " + username);
        }
        List<GrantedAuthority> authorities = new ArrayList<>();
        for (Role role : user.getRoles()) {
            logger.debug("Adding role: ROLE_{}", role.getDescription());
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getDescription()));
            for (Privilege privilege : role.getPrivileges()) {
                logger.debug("Adding privilege: {}", privilege.getDescription());
                authorities.add(new SimpleGrantedAuthority(privilege.getDescription()));
            }
        }
        logger.info("User {} authorities: {}", username, authorities);
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            authorities
        );
    }
}
