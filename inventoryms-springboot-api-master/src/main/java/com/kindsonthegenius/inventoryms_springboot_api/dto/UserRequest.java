package com.kindsonthegenius.inventoryms_springboot_api.dto;

import java.util.List;

public class UserRequest {
    private String firstName;
    private String lastName;
    private String username;
    private String password;
    private String confirmPassword;
    private String organizationId;
    private String directorateId;
    private String role;

    // Getters and Setters
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getOrganizationId() { return organizationId; }
    public void setOrganizationId(String organizationId) { this.organizationId = organizationId; }
    public String getDirectorateId() { return directorateId; }
    public void setDirectorateId(String directorateId) { this.directorateId = directorateId; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}