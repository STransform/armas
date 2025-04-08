package com.kindsonthegenius.inventoryms_springboot_api.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Document {

    @Id
    private String id;

    private String reportype;

    @ManyToOne
    @JoinColumn(name = "directoratename") // This maps to the foreign key column
    private Directorate directorate;

    @Transient // Not persisted in the database, derived from directorate
    private String directoratename;

    @PostLoad // Populate directorname after loading from DB
    public void populateDirectorname() {
        if (directorate != null) {
            this.directoratename = directorate.getDirectoratename();
        }
    }

    // Getters and setters
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

    public Directorate getDirectorate() {
        return directorate;
    }

    public void setDirectorate(Directorate directorate) {
        this.directorate = directorate;
        if (directorate != null) {
            this.directoratename = directorate.getDirectoratename();
        }
    }

    public String getdirectoratename() {
        return directoratename;
    }

    public void setdirectoratename(String directoratename) {
        this.directoratename = directoratename;
    }
}