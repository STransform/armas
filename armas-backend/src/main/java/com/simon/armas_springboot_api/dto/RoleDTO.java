package com.simon.armas_springboot_api.dto;
import java.util.Set;
import java.io.Serializable;

public class RoleDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long id;
    private String description;
    private String details;

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}