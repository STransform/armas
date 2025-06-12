// package com.simon.armas_springboot_api.security.models;

// import jakarta.persistence.*;
// import lombok.Data;
// import lombok.EqualsAndHashCode;
// import lombok.NoArgsConstructor;
// import lombok.AllArgsConstructor;
// //import privelege here
// import com.simon.armas_springboot_api.security.models.Privilege;
// import com.simon.armas_springboot_api.security.models.Role;
// import com.fasterxml.jackson.annotation.JsonIdentityInfo;
// import com.fasterxml.jackson.annotation.ObjectIdGenerators;
// import com.fasterxml.jackson.annotation.JsonManagedReference;
// import com.fasterxml.jackson.annotation.JsonBackReference;

// import jakarta.persistence.*;
// import lombok.Data;
// import java.util.Objects;

// @Entity
// @NoArgsConstructor
// @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
// @Table(name = "role_privilege_assignment",
//        uniqueConstraints = {@UniqueConstraint(columnNames = {"roleid", "privilegeid"})})
// public class RolePrivilegeAssignment {

//     @Id
//     @GeneratedValue(strategy = GenerationType.IDENTITY)
//     private Long id;

//     @ManyToOne
//     @JoinColumn(name = "roleid", insertable = false, updatable = false)
//     private Role role;

//     private Long roleid;

//     @ManyToOne
//     @JoinColumn(name = "privilegeid", insertable = false, updatable = false)
//     private Privilege privilege;

//     private Long privilegeid;

//     @Column(name = "is_active")
//     private boolean isActive;

//     public RolePrivilegeAssignment(Long roleid, Long privilegeid, boolean isActive) {
//         this.roleid = roleid;
//         this.privilegeid = privilegeid;
//         this.isActive = isActive;
//     }

//     // Getter and Setter for id
//     public Long getId() {
//         return id;
//     }

//     public void setId(Long id) {
//         this.id = id;
//     }

//     // Getter and Setter for role
//     public Role getRole() {
//         return role;
//     }

//     public void setRole(Role role) {
//         this.role = role;
//     }

//     // Getter and Setter for roleid
//     public Long getRoleid() {
//         return roleid;
//     }

//     public void setRoleid(Long roleid) {
//         this.roleid = roleid;
//     }

//     // Getter and Setter for privilege
//     public Privilege getPrivilege() {
//         return privilege;
//     }

//     public void setPrivilege(Privilege privilege) {
//         this.privilege = privilege;
//     }

//     // Getter and Setter for privilegeid
//     public Long getPrivilegeid() {
//         return privilegeid;
//     }

//     public void setPrivilegeid(Long privilegeid) {
//         this.privilegeid = privilegeid;
//     }

//     // Getter and Setter for isActive
//     public boolean isActive() {
//         return isActive;
//     }

//     public void setActive(boolean isActive) {
//         this.isActive = isActive;
//     }

//     // Optional: Override equals and hashCode for consistency
//     @Override
//     public boolean equals(Object o) {
//         if (this == o) return true;
//         if (o == null || getClass() != o.getClass()) return false;
//         RolePrivilegeAssignment that = (RolePrivilegeAssignment) o;
//         return isActive == that.isActive &&
//                Objects.equals(id, that.id) &&
//                Objects.equals(roleid, that.roleid) &&
//                Objects.equals(privilegeid, that.privilegeid);
//     }

//     @Override
//     public int hashCode() {
//         return Objects.hash(id, roleid, privilegeid, isActive);
//     }
// }