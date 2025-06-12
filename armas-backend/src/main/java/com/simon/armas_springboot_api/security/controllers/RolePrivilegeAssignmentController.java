// package com.simon.armas_springboot_api.security.controllers;

// import com.simon.armas_springboot_api.dto.UserDTO;
// import com.simon.armas_springboot_api.security.models.Privilege;
// import com.simon.armas_springboot_api.security.repositories.PrivilegeRepository;
// import com.simon.armas_springboot_api.security.services.RoleService;
// import com.simon.armas_springboot_api.security.models.Role;
// import com.simon.armas_springboot_api.services.UserService;
// import com.simon.armas_springboot_api.dto.PrivilegeAssignmentDTO;
// import com.simon.armas_springboot_api.security.models.RolePrivilegeAssignment;
// import com.simon.armas_springboot_api.security.services.RolePrivilegeAssignmentService;
// import com.simon.armas_springboot_api.security.services.PrivilegeService;
// import org.springframework.http.HttpStatus;
// import jakarta.transaction.Transactional;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.http.ResponseEntity;
// import org.springframework.security.access.prepost.PreAuthorize;
// import org.springframework.web.bind.annotation.*;

// import java.util.List;
// import java.util.Map;


// @RestController
// @RequestMapping("/role-privileges")
// @Transactional
// public class RolePrivilegeAssignmentController {

//     @Autowired
//     private RolePrivilegeAssignmentService rolePrivilegeAssignmentService;

//     @Autowired
//     private PrivilegeService privilegeService;

//     @GetMapping("/{roleId}/assignments")
//     @PreAuthorize("hasAuthority('ADMIN')")
//     public List<RolePrivilegeAssignment> getAssignmentsByRole(@PathVariable Long roleId) {
//         return rolePrivilegeAssignmentService.findByRoleId(roleId);
//     }

//     @PostMapping("/{roleId}/assign")
//     @PreAuthorize("hasAuthority('ADMIN')")
//     public ResponseEntity<String> assignPrivileges(@PathVariable Long roleId, @RequestBody List<PrivilegeAssignmentDTO> privilegeAssignments) {
//         try {
//             rolePrivilegeAssignmentService.savePrivileges(roleId, privilegeAssignments);
//             return ResponseEntity.status(HttpStatus.CREATED).body("Privileges assigned successfully");
//         } catch (Exception ex) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred: " + ex.getMessage());
//         }
//     }

//     @PutMapping("/{roleId}/privilege/{privilegeId}/toggle")
//     @PreAuthorize("hasAuthority('ADMIN')")
//     public ResponseEntity<String> togglePrivilege(@PathVariable Long roleId, @PathVariable Long privilegeId, @RequestBody Map<String, Boolean> payload) {
//         try {
//             boolean isActive = payload.getOrDefault("isActive", false);
//             rolePrivilegeAssignmentService.togglePrivilege(roleId, privilegeId, isActive);
//             return ResponseEntity.ok("Privilege state updated successfully");
//         } catch (Exception ex) {
//             return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error occurred: " + ex.getMessage());
//         }
//     }
// }