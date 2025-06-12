

// package com.simon.armas_springboot_api.security.repositories;

// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.util.List;

// import com.simon.armas_springboot_api.security.models.RolePrivilegeAssignment;


// @Repository
// public interface RolePrivilegeAssignmentRepository extends JpaRepository<RolePrivilegeAssignment, Long> {
//     List<RolePrivilegeAssignment> findByRoleid(Long roleid);
//     void deleteByRoleid(Long roleid);
//     RolePrivilegeAssignment findByRoleidAndPrivilegeid(Long roleid, Long privilegeid);
// }