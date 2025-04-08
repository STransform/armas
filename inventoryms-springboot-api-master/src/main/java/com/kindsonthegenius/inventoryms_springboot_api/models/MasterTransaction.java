package com.kindsonthegenius.inventoryms_springboot_api.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.kindsonthegenius.inventoryms_springboot_api.security.models.Auditable;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "master_transaction") // Added explicit table name
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class MasterTransaction extends Auditable<String> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String docname;
    private String reportstatus;

    @Column(length = 5000)
    private String remarks;

    private String response_needed;
    private String fiscal_year;
    private String reportcategory;
    private String filepath;

    @Transient
    private String current_orgname;

    @Transient
    private String current_user_director;

    @Transient
    private String current_user_orgtype;

    @ManyToOne
    @JoinColumn(name = "user_id") // Matches mappedBy="user" in Users
    private User user;

    @ManyToOne
    @JoinColumn(name = "theOrg_id", insertable = false, updatable = false)
    private Organization organization;
    private String theOrg_id;

    @ManyToOne
    @JoinColumn(name = "assigned_expert_user_id", insertable = false, updatable = false, nullable = true)
    private User user2;
    private long assigned_expert_user_id;

    @ManyToOne
    @JoinColumn(name = "transactiondocumentid", insertable = false, updatable = false)
    private Document transactiondocument;
    private String transactiondocumentid;

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getDocname() { return docname; }
    public void setDocname(String docname) { this.docname = docname; }
    public String getReportstatus() { return reportstatus; }
    public void setReportstatus(String reportstatus) { this.reportstatus = reportstatus; }
    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
    public String getResponse_needed() { return response_needed; }
    public void setResponse_needed(String response_needed) { this.response_needed = response_needed; }
    public String getFiscal_year() { return fiscal_year; }
    public void setFiscal_year(String fiscal_year) { this.fiscal_year = fiscal_year; }
    public String getReportcategory() { return reportcategory; }
    public void setReportcategory(String reportcategory) { this.reportcategory = reportcategory; }
    public String getFilepath() { return filepath; }
    public void setFilepath(String filepath) { this.filepath = filepath; }
    public String getCurrent_orgname() { return current_orgname; }
    public void setCurrent_orgname(String current_orgname) { this.current_orgname = current_orgname; }
    public String getCurrent_user_director() { return current_user_director; }
    public void setCurrent_user_director(String current_user_director) { this.current_user_director = current_user_director; }
    public String getCurrent_user_orgtype() { return current_user_orgtype; }
    public void setCurrent_user_orgtype(String current_user_orgtype) { this.current_user_orgtype = current_user_orgtype; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public String getTheOrg_id() { return theOrg_id; }
    public void setTheOrg_id(String theOrg_id) { this.theOrg_id = theOrg_id; }
    public User getUser2() { return user2; }
    public void setUser2(User user2) { this.user2 = user2; }
    public long getAssigned_expert_user_id() { return assigned_expert_user_id; }
    public void setAssigned_expert_user_id(long assigned_expert_user_id) { this.assigned_expert_user_id = assigned_expert_user_id; }
    public Document getTransactiondocument() { return transactiondocument; }
    public void setTransactiondocument(Document transactiondocument) { this.transactiondocument = transactiondocument; }
    public String getTransactiondocumentid() { return transactiondocumentid; }
    public void setTransactiondocumentid(String transactiondocumentid) { this.transactiondocumentid = transactiondocumentid; }

    @Override
    public String toString() {
        return "MasterTransaction [id=" + id + ", docname=" + docname + ", reportstatus=" + reportstatus
                + ", remarks=" + remarks + ", response_needed=" + response_needed
                + ", fiscal_year=" + fiscal_year + ", current_orgname=" + current_orgname
                + ", current_user_director=" + current_user_director + ", current_user_orgtype="
                + current_user_orgtype + ", user=" + user + ", organization=" + organization + ", theOrg_id="
                + theOrg_id + ", user2=" + user2 + ", assigned_expert_user_id=" + assigned_expert_user_id
                + ", transactiondocument=" + transactiondocument + ", transactiondocumentid="
                + transactiondocumentid + "]";
    }


}
