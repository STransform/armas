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
public class BudgetYear {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fiscal_year;
//generate getter and setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFiscal_year() {
        return fiscal_year;
    }

    public void setFiscal_year(String fiscal_year) {
        this.fiscal_year = fiscal_year;
    }

    // @Override
    // public String toString() {
    //     return "BudgetYear [id=" + id + ", fiscal_year=" + fiscal_year + "]";
    // }


}