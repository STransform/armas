package com.simon.armas_springboot_api.dto;

public class DirectorateDTO {
    private String id;
    private String directoratename;
    private String telephone;
    private String email;

    // Getters and Setters
     public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }
    public String getDirectoratename() {
        return directoratename;
    }
    public void setDirectoratename(String directoratename) {
        this.directoratename = directoratename;
    }
    public String getTelephone() {
        return telephone;
    }
    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

}