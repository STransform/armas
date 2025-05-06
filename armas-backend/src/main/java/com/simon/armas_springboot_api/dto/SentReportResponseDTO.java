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

    public SentReportResponseDTO(Integer id, String orgname, String reportype, String fiscal_year, Date createdDate,
                                 String docname, String reportstatus, String remarks) {
        this.id = id;
        this.orgname = orgname != null ? orgname : "Unknown";
        this.reportype = reportype != null ? reportype : "Unknown";
        this.fiscal_year = fiscal_year != null ? fiscal_year : "N/A";
        this.createdDate = createdDate;
        this.docname = docname != null ? docname : "N/A";
        this.reportstatus = reportstatus != null ? reportstatus : "N/A";
        this.remarks = remarks;
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
}