package com.simon.armas_springboot_api.dto;

public class DocumentRequest {
    private String id;
    private String reportype;
    private String directoratename;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReportype() { return reportype; }
    public void setReportype(String reportype) { this.reportype = reportype; }
    public String getDirectoratename() { return directoratename; }
    public void setDirectoratename(String directoratename) { this.directoratename = directoratename; }

    @Override
    public String toString() {
        return "DocumentRequest{id='" + id + "', reportype='" + reportype + "', directoratename='" + directoratename + "'}";
    }
}