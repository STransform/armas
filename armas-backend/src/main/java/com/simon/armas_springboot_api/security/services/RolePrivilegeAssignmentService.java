// package com.simon.armas_springboot_api.security.services;


// import com.simon.armas_springboot_api.security.repositories.PrivilegeRepository;
// import com.simon.armas_springboot_api.security.repositories.RoleRepository;
// import com.simon.armas_springboot_api.security.models.RolePrivilegeAssignment;
// import com.simon.armas_springboot_api.security.repositories.RolePrivilegeAssignmentRepository;
// import com.simon.armas_springboot_api.security.models.Privilege;
// import com.simon.armas_springboot_api.security.models.Role;
// import com.simon.armas_springboot_api.dto.PrivilegeAssignmentDTO;

// import jakarta.transaction.Transactional;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.stereotype.Service;

// import java.util.Arrays;
// import java.util.List;
// import java.util.Set;
// import java.util.stream.Collectors;

// @Service
// @Transactional
// public class RolePrivilegeAssignmentService {
//     @Autowired
//     private RolePrivilegeAssignmentRepository repository;

//     @Autowired
//     private RoleRepository roleRepository;

//     @Autowired
//     private PrivilegeRepository privilegeRepository;

//     public List<RolePrivilegeAssignment> findByRoleId(Long roleId) {
//         return repository.findByRoleid(roleId);
//     }

//     public RolePrivilegeAssignment save(RolePrivilegeAssignment assignment) {
//         return repository.save(assignment);
//     }

//     @Transactional
//     public List<Privilege> savePrivileges(Long roleId, List<PrivilegeAssignmentDTO> privilegeAssignments) {
//         Role role = roleRepository.findById(roleId)
//                 .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        
//         repository.deleteByRoleid(roleId);

//         List<RolePrivilegeAssignment> assignments = privilegeAssignments.stream()
//                 .map(dto -> {
//                     Privilege privilege = privilegeRepository.findById(dto.getPrivilegeId())
//                             .orElseThrow(() -> new IllegalArgumentException("Privilege not found: " + dto.getPrivilegeId()));
//                     return new RolePrivilegeAssignment(roleId, privilege.getId(), dto.isActive());
//                 })
//                 .toList();

//         repository.saveAll(assignments);
//         return assignments.stream()
//                 .filter(RolePrivilegeAssignment::isActive)
//                 .map(RolePrivilegeAssignment::getPrivilege)
//                 .toList();
//     }

//     public void togglePrivilege(Long roleId, Long privilegeId, boolean isActive) {
//         RolePrivilegeAssignment assignment = repository.findByRoleidAndPrivilegeid(roleId, privilegeId);
//         if (assignment == null) {
//             throw new IllegalArgumentException("Privilege assignment not found for role: " + roleId + " and privilege: " + privilegeId);
//         }
//         assignment.setActive(isActive);
//         repository.save(assignment);
//     }

//     public void deleteByRoleId(Long roleId) {
//         repository.deleteByRoleid(roleId);
//     }
// }