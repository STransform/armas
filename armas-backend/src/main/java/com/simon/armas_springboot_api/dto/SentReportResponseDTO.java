package com.simon.armas_springboot_api.dto;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

public class SentReportResponseDTO {
    private Integer id;
    private String orgname;
    private String reportype;
    private String fiscal_year;
    private LocalDateTime createdDate;
    private String docname;
    private String reportstatus;
    private String remarks;

    public SentReportResponseDTO(Integer id, String orgname, String reportype, String fiscal_year, Date createdDate, String docname, String reportstatus , String remarks) {
        this.id = id;
        this.orgname = orgname;
        this.reportype = reportype;
        this.fiscal_year = fiscal_year;
        this.createdDate = createdDate != null ? createdDate.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime() : null;
        this.docname = docname;
        this.reportstatus = reportstatus;
        this.remarks = remarks;
    }

    // Getters
    public Integer getId() { return id; }
    public String getOrgname() { return orgname; }
    public String getReportype() { return reportype; }
    public String getFiscal_year() { return fiscal_year; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public String getDocname() { return docname; }
    public String getReportstatus() { return reportstatus; }
    public String getRemarks() { return remarks; }
}