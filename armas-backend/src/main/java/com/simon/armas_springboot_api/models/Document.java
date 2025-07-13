package com.simon.armas_springboot_api.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonBackReference;
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Document {

    @Id
    private String id;

    private String reportype;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "directorate_id", nullable = false)
    @JsonBackReference
    private Directorate directorate;

    @Transient
    public String getDirectoratename() {
        return directorate != null ? directorate.getDirectoratename() : null;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReportype() { return reportype; }
    public void setReportype(String reportype) { this.reportype = reportype; }
    public Directorate getDirectorate() { return directorate; }
    public void setDirectorate(Directorate directorate) { this.directorate = directorate; }

    @Override
    public String toString() {
        return "Document [id=" + id + ", reportype=" + reportype + ", directorate=" + directorate + "]";
    }}