package com.simon.armas_springboot_api.security.models;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.security.services.UserPrivilegeAssignmentService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class UserPrincipal implements UserDetails {
    private static final Logger log = LoggerFactory.getLogger(UserPrincipal.class);
    private final User user;
    private final UserPrivilegeAssignmentService userPrivilegeAssignmentService;

    public UserPrincipal(UserPrivilegeAssignmentService userPrivilegeAssignmentService, User user) {
        if (user == null) {
            log.error("User cannot be null in UserPrincipal");
            throw new IllegalArgumentException("User cannot be null");
        }
        this.user = user;
        this.userPrivilegeAssignmentService = userPrivilegeAssignmentService;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<Role> roles = user.getRoles();
        if (roles == null || roles.isEmpty()) {
            log.warn("No roles found for user: {}", user.getUsername());
            return Collections.emptyList();
        }

        Set<GrantedAuthority> authorities = new HashSet<>();
        roles.forEach(role -> {
            if (role != null && role.getDescription() != null) {
                authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getDescription()));
                List<Privilege> privileges = role.getPrivileges();
                if (privileges != null) {
                    privileges.forEach(privilege -> {
                        if (privilege != null && privilege.getDescription() != null) {
                            authorities.add(new SimpleGrantedAuthority(privilege.getDescription()));
                        }
                    });
                }
            }
        });

        // Add user-specific privileges
        List<Privilege> userPrivileges = userPrivilegeAssignmentService.getUserPrivileges(user.getId());
        if (userPrivileges != null) {
            userPrivileges.forEach(privilege -> {
                if (privilege != null && privilege.getDescription() != null) {
                    authorities.add(new SimpleGrantedAuthority(privilege.getDescription()));
                }
            });
        }

        // Dynamically add VIEW_ORG_REPORTS if the user is the organization head
        if (user.getOrganization() != null && 
            user.getUsername().equals(user.getOrganization().getOrganizationhead())) {
            authorities.add(new SimpleGrantedAuthority("VIEW_ORG_REPORTS"));
            log.debug("Granted VIEW_ORG_REPORTS to organization head: {}", user.getUsername());
        }

        log.debug("Authorities for user {}: {}", user.getUsername(), authorities);
        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    // @Override
    // public boolean isEnabled() {
    //     return user.isEnabled();
    // }
}