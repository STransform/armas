package com.simon.armas_springboot_api.dto;

import java.io.Serializable;

public class PasswordResetRequest implements Serializable {
    private String newPassword;
    private String confirmPassword;

    // Getters and Setters
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}