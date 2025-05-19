package com.simon.armas_springboot_api.dto;

import java.util.Date;

public class SentReportResponseDTO {
    private Integer id;
    private String orgname;
    private String reportype;
    private String fiscal_year;
    private Date createdDate;
    private String docname;
    private String reportstatus;
    private String remarks;
    private String user; // Add uploader's username
    private String submittedByAuditorUsername; // Add auditor's username

    public SentReportResponseDTO(Integer id, String orgname, String reportype, String fiscal_year, Date createdDate,
                                 String docname, String reportstatus, String remarks , String user, String submittedByAuditorUsername) {
        this.id = id;
        this.orgname = orgname != null ? orgname : "Unknown";
        this.reportype = reportype != null ? reportype : "Unknown";
        this.fiscal_year = fiscal_year != null ? fiscal_year : "N/A";
        this.createdDate = createdDate;
        this.docname = docname != null ? docname : "N/A";
        this.reportstatus = reportstatus != null ? reportstatus : "N/A";
        this.remarks = remarks;
        this.user = user;
        this.submittedByAuditorUsername = submittedByAuditorUsername;
    }

    // Getters
    public Integer getId() { return id; }
    public String getOrgname() { return orgname; }
    public String getReportype() { return reportype; }
    public String getFiscal_year() { return fiscal_year; }
    public Date getCreatedDate() { return createdDate; }
    public String getDocname() { return docname; }
    public String getReportstatus() { return reportstatus; }
    public String getRemarks() { return remarks; }
    public String getUser() { return user; }
    public String getSubmittedByAuditorUsername() { return submittedByAuditorUsername; }
}