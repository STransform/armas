package com.simon.armas_springboot_api.security.services;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.repositories.PrivilegeRepository;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
@Transactional
public class RoleService {
    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
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

    @Transactional
    public void assignPrivilegesToRole(Long roleId, List<Long> privilegeIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        logger.info("Assigning privileges {} to role {}", privilegeIds, role.getDescription());

        // Clear existing privileges
        List<Privilege> currentPrivileges = role.getPrivileges();
        if (currentPrivileges != null && !currentPrivileges.isEmpty()) {
            currentPrivileges.forEach(privilege -> privilege.setRole(null));
            privilegeRepository.saveAll(currentPrivileges);
            role.setPrivileges(new ArrayList<>());
            roleRepository.save(role); // Save role to update cleared privileges
        }

        // Assign new privileges
        if (privilegeIds != null && !privilegeIds.isEmpty()) {
            List<Privilege> newPrivileges = privilegeIds.stream()
                    .map(privilegeId -> privilegeRepository.findById(privilegeId)
                            .orElseThrow(() -> new IllegalArgumentException("Privilege not found: " + privilegeId)))
                    .collect(Collectors.toList());
            newPrivileges.forEach(privilege -> privilege.setRole(role));
            role.setPrivileges(newPrivileges);
            privilegeRepository.saveAll(newPrivileges); // Save privileges to update roleid
            roleRepository.save(role); // Save role to update its privileges
        }

        logger.info("Successfully assigned privileges {} to role {}", privilegeIds, role.getDescription());
    }

    @Transactional
    public void initializeRolesAndPrivileges() {
        List<String> privilegeNames = Arrays.asList(
                "CREATE_PRODUCT", "VIEW_LETTERS",
                "READ", "WRITE", "CREATE", "DELETE"
        );
        for (String name : privilegeNames) {
            if (privilegeRepository.findByDescription(name) == null) {
                Privilege privilege = new Privilege();
                privilege.setDescription(name);
                privilegeRepository.saveAndFlush(privilege);
                logger.info("Created privilege: {}", name);
            } else {
                logger.debug("Privilege {} already exists", name);
            }
        }

        Role adminRole = roleRepository.findByDescription("ADMIN");
        if (adminRole == null) {
            Role newAdminRole = new Role();
            newAdminRole.setDescription("ADMIN");
            newAdminRole.setDetails("Administrator with full access");
            List<Privilege> adminPrivileges = privilegeRepository.findAll();
            newAdminRole.setPrivileges(adminPrivileges);
            adminPrivileges.forEach(p -> p.setRole(newAdminRole));
            privilegeRepository.saveAll(adminPrivileges); // Save privileges
            roleRepository.save(newAdminRole);
        }

        Role userRole = roleRepository.findByDescription("USER");
        if (userRole == null) {
            Role newUserRole = new Role();
            newUserRole.setDescription("USER");
            newUserRole.setDetails("Standard user with view access");
            List<Privilege> userPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> p.getDescription().startsWith("VIEW_") || p.getDescription().equals("READ"))
                    .collect(Collectors.toList());
            newUserRole.setPrivileges(userPrivileges);
            userPrivileges.forEach(p -> p.setRole(newUserRole));
            privilegeRepository.saveAll(userPrivileges); // Save privileges
            roleRepository.save(newUserRole);
        }

        Role seniorAuditorRole = roleRepository.findByDescription("SENIOR_AUDITOR");
        if (seniorAuditorRole == null) {
            Role newSeniorAuditorRole = new Role();
            newSeniorAuditorRole.setDescription("SENIOR_AUDITOR");
            newSeniorAuditorRole.setDetails("Senior auditor with review privileges");
            List<Privilege> seniorAuditorPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> p.getDescription().equals("REVIEW_REPORTS"))
                    .collect(Collectors.toList());
            newSeniorAuditorRole.setPrivileges(seniorAuditorPrivileges);
            seniorAuditorPrivileges.forEach(p -> p.setRole(newSeniorAuditorRole));
            privilegeRepository.saveAll(seniorAuditorPrivileges); // Save privileges
            roleRepository.save(newSeniorAuditorRole);
        }

        Role archiverRole = roleRepository.findByDescription("ARCHIVER");
        if (archiverRole == null) {
            Role newArchiverRole = new Role();
            newArchiverRole.setDescription("ARCHIVER");
            newArchiverRole.setDetails("Archiver with assignment privileges");
            List<Privilege> archiverPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> p.getDescription().equals("ASSIGN_REPORTS"))
                    .collect(Collectors.toList());
            newArchiverRole.setPrivileges(archiverPrivileges);
            archiverPrivileges.forEach(p -> p.setRole(newArchiverRole));
            privilegeRepository.saveAll(archiverPrivileges); // Save privileges
            roleRepository.save(newArchiverRole);
        }

        Role approverRole = roleRepository.findByDescription("APPROVER");
        if (approverRole == null) {
            Role newApproverRole = new Role();
            newApproverRole.setDescription("APPROVER");
            newApproverRole.setDetails("Approver with approval/rejection privileges");
            List<Privilege> approverPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> p.getDescription().equals("APPROVE_REPORTS"))
                    .collect(Collectors.toList());
            newApproverRole.setPrivileges(approverPrivileges);
            approverPrivileges.forEach(p -> p.setRole(newApproverRole));
            privilegeRepository.saveAll(approverPrivileges); // Save privileges
            roleRepository.save(newApproverRole);
        }

        Role managerRole = roleRepository.findByDescription("MANAGER");
        if (managerRole == null) {
            logger.info("Creating new MANAGER role...");
            Role newManagerRole = new Role();
            newManagerRole.setDescription("MANAGER");
            newManagerRole.setDetails("Manager with letter viewing privileges");
            List<Privilege> managerPrivileges = privilegeRepository.findAll().stream()
                    .filter(p -> "VIEW_LETTERS".equals(p.getDescription()))
                    .collect(Collectors.toList());
            newManagerRole.setPrivileges(managerPrivileges);
            managerPrivileges.forEach(p -> p.setRole(newManagerRole));
            privilegeRepository.saveAll(managerPrivileges); // Save privileges
            roleRepository.saveAndFlush(newManagerRole);
            logger.info("Created MANAGER role with VIEW_LETTERS privilege");
        } else {
            logger.info("Updating existing MANAGER role...");
            List<Privilege> privileges = managerRole.getPrivileges() != null ? new ArrayList<>(managerRole.getPrivileges()) : new ArrayList<>();
            boolean hasViewLetters = privileges.stream().anyMatch(p -> "VIEW_LETTERS".equals(p.getDescription()));
            if (!hasViewLetters) {
                Privilege viewLetters = privilegeRepository.findByDescription("VIEW_LETTERS");
                if (viewLetters != null) {
                    privileges.add(viewLetters);
                    viewLetters.setRole(managerRole);
                    privileges.forEach(p -> p.setRole(managerRole)); // Ensure role is set
                    privilegeRepository.saveAll(privileges); // Save privileges
                    managerRole.setPrivileges(privileges);
                    roleRepository.saveAndFlush(managerRole);
                    logger.info("Added VIEW_LETTERS privilege to existing MANAGER role");
                } else {
                    logger.error("VIEW_LETTERS privilege not found in database");
                }
            } else {
                logger.debug("MANAGER role already has VIEW_LETTERS privilege");
            }
        }
    }

    // Other methods unchanged
    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        roleRepository.deleteById(id);
    }

    public Role save(Role role) {
        if (roleRepository.findByDescription(role.getDescription()) != null) {
            throw new IllegalArgumentException("Role already exists: " + role.getDescription());
        }
        return roleRepository.save(role);
    }

    public void assignUserRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        List<Role> newRoles = roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId)))
                .collect(Collectors.toList());
        user.getRoles().clear();
        user.getRoles().addAll(newRoles);
        userRepository.save(user);
    }

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

    public Role findByDescription(String roleDescription) {
        return roleRepository.findByDescription(roleDescription);
    }
}