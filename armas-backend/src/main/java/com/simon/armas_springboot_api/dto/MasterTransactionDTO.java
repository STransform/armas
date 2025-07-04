package com.simon.armas_springboot_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.simon.armas_springboot_api.models.MasterTransaction;
import java.util.Date;

public class MasterTransactionDTO {
    private Integer id;
    private Date createdDate;
    private String orgname;
    @JsonProperty("fiscal_year") // Serialize as fiscal_year in JSON
    private String fiscalYear;
    private String reportype;
    private String reportstatus;
    private String docname;
    private String supportingDocumentPath;
    private String supportingDocname;
    private String submittedByAuditorUsername;
    private String user;
    private String assignedAuditorUsername;
    private String createdBy;
    private String assignedByUsername;
    private String lastModifiedBy;
    private String approverUsername;
    private String remarks;
    private String reason_of_rejection;
    private String responseNeeded;


    // Constructor to map from MasterTransaction
    public MasterTransactionDTO(MasterTransaction mt) {
        this.id = mt.getId();
        this.createdDate = mt.getCreatedDate();
        this.orgname = mt.getOrganization() != null ? mt.getOrganization().getOrgname() : null;
        this.fiscalYear = mt.getBudgetYear() != null ? mt.getBudgetYear().getFiscalYear() : null;
        System.out.println("Mapping MasterTransaction id=" + mt.getId() + ", budgetYear=" + (mt.getBudgetYear() != null ? mt.getBudgetYear().getFiscalYear() : "null")); // Debug log
        this.reportype = mt.getTransactiondocument() != null ? mt.getTransactiondocument().getReportype()
                : mt.getReportcategory();
        this.reportstatus = mt.getReportstatus();
        this.docname = mt.getDocname();
        this.user = mt.getUser() != null ? mt.getUser().getUsername() : null;
        this.supportingDocumentPath = mt.getSupportingDocumentPath();
        this.supportingDocname = mt.getSupportingDocname();
        this.submittedByAuditorUsername = mt.getSubmittedByAuditor() != null ? mt.getSubmittedByAuditor().getUsername()
                : null;
        this.assignedAuditorUsername = mt.getUser2() != null ? mt.getUser2().getUsername() : null;
        this.createdBy = mt.getCreatedBy();
        this.assignedByUsername = mt.getAssignedBy() != null ? mt.getAssignedBy().getUsername() : null;
        this.lastModifiedBy = mt.getLastModifiedBy();
        this.approverUsername = ("Approved".equals(mt.getReportstatus()) && mt.getUser2() != null)
                ? mt.getUser2().getUsername()
                : null;
        this.remarks = mt.getRemarks() != null ? mt.getRemarks() : null;
        this.reason_of_rejection = mt.getReason_of_rejection() != null ? mt.getReason_of_rejection() : null;
        this.responseNeeded = mt.getResponse_needed();
    }

    // Getters and setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public Date getCreatedDate() { return createdDate; }
    public void setCreatedDate(Date createdDate) { this.createdDate = createdDate; }
    public String getOrgname() { return orgname; }
    public void setOrgname(String orgname) { this.orgname = orgname; }
    public String getFiscalYear() { return fiscalYear; }
    public void setFiscalYear(String fiscalYear) { this.fiscalYear = fiscalYear; }
    public String getReportype() { return reportype; }
    public void setReportype(String reportype) { this.reportype = reportype; }
    public String getReportstatus() { return reportstatus; }
    public void setReportstatus(String reportstatus) { this.reportstatus = reportstatus; }
    public String getDocname() { return docname; }
    public void setDocname(String docname) { this.docname = docname; }
    public String getSupportingDocumentPath() { return supportingDocumentPath; }
    public void setSupportingDocumentPath(String supportingDocumentPath) { this.supportingDocumentPath = supportingDocumentPath; }
    public String getSupportingDocname() { return supportingDocname; }
    public void setSupportingDocname(String supportingDocname) { this.supportingDocname = supportingDocname; }
    public String getSubmittedByAuditorUsername() { return submittedByAuditorUsername; }
    public void setSubmittedByAuditorUsername(String submittedByAuditorUsername) { this.submittedByAuditorUsername = submittedByAuditorUsername; }
    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }
    public String getAssignedAuditorUsername() { return assignedAuditorUsername; }
    public void setAssignedAuditorUsername(String assignedAuditorUsername) { this.assignedAuditorUsername = assignedAuditorUsername; }
    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public String getAssignedByUsername() { return assignedByUsername; }
    public void setAssignedByUsername(String assignedByUsername) { this.assignedByUsername = assignedByUsername; }
    public String getLastModifiedBy() { return lastModifiedBy; }
    public void setLastModifiedBy(String lastModifiedBy) { this.lastModifiedBy = lastModifiedBy; }
    public String getApproverUsername() { return approverUsername; }
    public void setApproverUsername(String approverUsername) { this.approverUsername = approverUsername; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getReason_of_rejection() { return reason_of_rejection; }
    public void setReason_of_rejection(String reason_of_rejection) { this.reason_of_rejection = reason_of_rejection; }
    public String getResponseNeeded() { return responseNeeded; }
    public void setResponseNeeded(String responseNeeded) { this.responseNeeded = responseNeeded; }
}