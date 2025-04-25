package com.simon.armas_springboot_api.security.services;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.models.UserPrincipal;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserPrivilegeAssignmentService assignmentService;
    private final UserRepository userRepository;

    @Autowired
    public MyUserDetailsService(UserPrivilegeAssignmentService assignmentService, UserRepository userRepository) {
        this.assignmentService = assignmentService;
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        Set<GrantedAuthority> authorities = new HashSet<>();
        user.getRoles().forEach(role -> {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getDescription()));
            role.getPrivileges().forEach(privilege ->
                authorities.add(new SimpleGrantedAuthority(privilege.getDescription())));
        });

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.isEnabled(),
            true, true, true,
            authorities
        );
    }
}
