package com.simon.armas_springboot_api.dto;

public class DocumentDTO {
    private String id;
    private String reportype;
    private String directoratename;

    public DocumentDTO() {}

    public DocumentDTO(String id, String reportype, String directoratename) {
        this.id = id;
        this.reportype = reportype;
        this.directoratename = directoratename;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReportype() {
        return reportype;
    }

    public void setReportype(String reportype) {
        this.reportype = reportype;
    }

    public String getDirectoratename() {
        return directoratename;
    }

    public void setDirectoratename(String directoratename) {
        this.directoratename = directoratename;
    }
}