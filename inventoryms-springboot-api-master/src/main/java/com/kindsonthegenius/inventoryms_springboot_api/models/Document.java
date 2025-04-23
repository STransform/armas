package com.kindsonthegenius.inventoryms_springboot_api.models;

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

    @ManyToOne(fetch = FetchType.LAZY) // Ensure directorate is always fetched
    @JoinColumn(name = "directoratename") // Foreign key column in document table
    @JsonBackReference // Prevents infinite recursion in JSON
    private Directorate directorate;
     @Transient
    private String directoratename;

     // Populate directoratename in getter
    public String getDirectoratename() {
        return directorate != null ? directorate.getDirectoratename() : directoratename;
    }

    // Set directoratename for deserialization
    public void setDirectoratename(String directoratename) {
        this.directoratename = directoratename;
    }

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getReportype() { return reportype; }
    public void setReportype(String reportype) { this.reportype = reportype; }
    public Directorate getDirectorate() { return directorate; }
    public void setDirectorate(Directorate directorate) { this.directorate = directorate; }
    //generate tostring
    @Override
    public String toString() {
        return "Document [id=" + id + ", reportype=" + reportype + ", directorate=" + directorate + "]";
    }
}