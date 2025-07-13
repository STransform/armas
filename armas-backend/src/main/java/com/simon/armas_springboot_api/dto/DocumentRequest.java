package com.simon.armas_springboot_api.dto;

import jakarta.validation.constraints.NotBlank;

public class DocumentRequest {
    @NotBlank(message = "Document ID is required")
    private String id;
    
    @NotBlank(message = "Report type is required")
    private String reportype;
    
    @NotBlank(message = "Directorate ID is required")
    private String directorateId;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getReportype() { return reportype; }
    public void setReportype(String reportype) { this.reportype = reportype; }
    
    public String getDirectorateId() { return directorateId; }
    public void setDirectorateId(String directorateId) { this.directorateId = directorateId; }
}