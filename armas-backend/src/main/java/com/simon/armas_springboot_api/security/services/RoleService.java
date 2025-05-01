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
import java.util.List;
import java.util.Set;
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
    public void assignUserRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Set<Role> newRoles = roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId)))
                .collect(Collectors.toSet());
        user.getRoles().clear(); // Remove all existing roles
        user.getRoles().addAll(newRoles); // Add the new roles
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
        List<String> privilegeNames = Arrays.asList(
                "CREATE_PRODUCT", "UPDATE_PRODUCT", "DELETE_PRODUCT",
                "VIEW_REPORTS", "REVIEW_REPORTS", "ASSIGN_REPORTS", "APPROVE_REPORTS"
        );
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
            roleRepository.save(newApproverRole);
        }
    }

    public Role findByDescription(String roleDescription) {
        return roleRepository.findByDescription(roleDescription);
    }
}