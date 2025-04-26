package com.simon.armas_springboot_api.dto;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import jakarta.persistence.Transient;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import com.simon.armas_springboot_api.dto.RoleDTO;
import java.io.Serializable;
import java.util.Set;
import com.simon.armas_springboot_api.dto.RoleDTO;

public class UserDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String orgname;
    private String directoratename;
    private boolean enabled;
    private Set<RoleDTO> roles;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getOrgname() { return orgname; }
    public void setOrgname(String orgname) { this.orgname = orgname; }
    public String getDirectoratename() { return directoratename; }
    public void setDirectoratename(String directoratename) { this.directoratename = directoratename; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public Set<RoleDTO> getRoles() { return roles; }
    public void setRoles(Set<RoleDTO> roles) { this.roles = roles; }
}