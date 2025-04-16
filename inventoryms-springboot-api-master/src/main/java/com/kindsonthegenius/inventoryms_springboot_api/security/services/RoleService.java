package com.kindsonthegenius.inventoryms_springboot_api.security.services;

import com.kindsonthegenius.inventoryms_springboot_api.models.User;
import com.kindsonthegenius.inventoryms_springboot_api.repositories.UserRepository;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.Privilege;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.Role;
import com.kindsonthegenius.inventoryms_springboot_api.security.repositories.PrivilegeRepository;
import com.kindsonthegenius.inventoryms_springboot_api.security.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PrivilegeRepository privilegeRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository, UserRepository userRepository,
            PrivilegeRepository privilegeRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.privilegeRepository = privilegeRepository;
    }

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        roleRepository.deleteById(id);
    }

    @Transactional
    public Role save(Role role) {
        if (roleRepository.findByDescription(role.getDescription()) != null) {
            throw new IllegalArgumentException("Role already exists: " + role.getDescription());
        }
        return roleRepository.save(role);
    }

    @Transactional
    public void assignUserRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Transactional
    public void unAssignUserRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Role role = roleRepository.findById(roleId)
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public List<Privilege> getPrivilegesInRole(Long roleId) {
        Role role = findById(roleId);
        return role != null ? role.getPrivileges() : List.of();
    }

    @Transactional
    public void initializeRolesAndPrivileges() {
        List<String> privilegeNames = Arrays.asList( "CREATE_PRODUCT", "UPDATE_PRODUCT",
                "DELETE_PRODUCT");
        privilegeNames.forEach(name -> {
            if (privilegeRepository.findByDescription(name) == null) {
                Privilege privilege = new Privilege();
                privilege.setDescription(name);
                privilegeRepository.save(privilege);
            }
        });

        Role adminRole = roleRepository.findByDescription("ADMIN");
        if (adminRole == null) {
            Role newAdminRole = new Role();
            newAdminRole.setDescription("ADMIN");
            newAdminRole.setDetails("Administrator with full access");
            List<Privilege> adminPrivileges = privilegeRepository.findAll();
            newAdminRole.setPrivileges(adminPrivileges);
            adminPrivileges.forEach(p -> p.setRole(newAdminRole));
            roleRepository.save(newAdminRole);
        }

        Role userRole = roleRepository.findByDescription("USER");
        if (userRole == null) {
            Role newUserRole = new Role();
            newUserRole.setDescription("USER");
            newUserRole.setDetails("Standard user with view access");
            List<Privilege> userPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> p.getDescription().startsWith("VIEW_"))
                    .collect(Collectors.toList());
            newUserRole.setPrivileges(userPrivileges);
            userPrivileges.forEach(p -> p.setRole(newUserRole));
            roleRepository.save(newUserRole);
        }
    }

    public Role findByDescription(String roleDescription) {
       return roleRepository.findByDescription(roleDescription);
}}