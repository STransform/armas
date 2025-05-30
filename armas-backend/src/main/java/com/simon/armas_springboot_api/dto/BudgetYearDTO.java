package com.simon.armas_springboot_api.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BudgetYearDTO {

    private Long id;

    @JsonProperty("fiscal_year") 
    private String fiscalYear;

    // Constructors
    public BudgetYearDTO() {}

    public BudgetYearDTO(Long id, String fiscalYear) {
        this.id = id;
        this.fiscalYear = fiscalYear;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFiscalYear() {
        return fiscalYear;
    }

    public void setFiscalYear(String fiscalYear) {
        this.fiscalYear = fiscalYear;
    }
}