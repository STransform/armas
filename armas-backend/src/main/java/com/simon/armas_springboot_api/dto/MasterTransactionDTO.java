package com.simon.armas_springboot_api.dto;

import com.simon.armas_springboot_api.models.MasterTransaction;
import java.util.Date;

public class MasterTransactionDTO {
    private Integer id;
    private Date createdDate;
    private String orgname;
    private String fiscalYear;
    private String reportype;
    private String reportstatus;
    private String docname;
    private String supportingDocumentPath;
    private String supportingDocname;

    // Constructor to map from MasterTransaction
    public MasterTransactionDTO(MasterTransaction mt) {
        this.id = mt.getId();
        this.createdDate = mt.getCreatedDate();
        this.orgname = mt.getOrganization() != null ? mt.getOrganization().getOrgname() : null;
        this.fiscalYear = mt.getFiscal_year();
        this.reportype = mt.getTransactiondocument() != null ? mt.getTransactiondocument().getReportype() : mt.getReportcategory();
        this.reportstatus = mt.getReportstatus();
        this.docname = mt.getDocname();
        this.supportingDocumentPath = mt.getSupportingDocumentPath();
        this.supportingDocname = mt.getSupportingDocname();
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Date getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(Date createdDate) {
        this.createdDate = createdDate;
    }

    public String getOrgname() {
        return orgname;
    }

    public void setOrgname(String orgname) {
        this.orgname = orgname;
    }

    public String getFiscalYear() {
        return fiscalYear;
    }

    public void setFiscalYear(String fiscalYear) {
        this.fiscalYear = fiscalYear;
    }

    public String getReportype() {
        return reportype;
    }

    public void setReportype(String reportype) {
        this.reportype = reportype;
    }

    public String getReportstatus() {
        return reportstatus;
    }

    public void setReportstatus(String reportstatus) {
        this.reportstatus = reportstatus;
    }

    public String getDocname() {
        return docname;
    }

    public void setDocname(String docname) {
        this.docname = docname;
    }
     public String getSupportingDocumentPath() { return supportingDocumentPath; }
    public String getSupportingDocname() { return supportingDocname; }
}