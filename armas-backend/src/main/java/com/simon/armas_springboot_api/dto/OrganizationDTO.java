package com.simon.armas_springboot_api.dto;

public class OrganizationDTO {
    private String id;
    private String orgname;

    public OrganizationDTO() {}

    public OrganizationDTO(String id, String orgname) {
        this.id = id;
        this.orgname = orgname;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getOrgname() {
        return orgname;
    }

    public void setOrgname(String orgname) {
        this.orgname = orgname;
    }
}