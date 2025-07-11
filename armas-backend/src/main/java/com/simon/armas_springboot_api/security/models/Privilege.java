
package com.simon.armas_springboot_api.security.models;

import com.fasterxml.jackson.annotation.*;
import com.simon.armas_springboot_api.models.User;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import lombok.ToString;
import com.simon.armas_springboot_api.security.models.Auditable;

@Entity
@Data
@ToString(exclude = {"role", "users"}) // Exclude role and users to prevent recursion
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Privilege extends Auditable<String> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String description;

    @ManyToOne(cascade = CascadeType.ALL) 
    @JoinColumn(name = "roleid") // Maps to roleid column in the database
    @JsonBackReference
    private Role role;

    @OneToMany(mappedBy = "privilege")
    @JsonIgnore
    private List<UserPrivilegeAssignment> users;

    // Getter and Setter for id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter and Setter for role
    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    // Getter and Setter for roleid
    // public Long getRoleid() {
    //     return roleid;
    // }

    // public void setRoleid(Long roleid) {
    //     this.roleid = roleid;
    // }

    // Getter and Setter for users
    public List<UserPrivilegeAssignment> getUsers() {
        return users;
    }

    public void setUsers(List<UserPrivilegeAssignment> users) {
        this.users = users;
    }
}
