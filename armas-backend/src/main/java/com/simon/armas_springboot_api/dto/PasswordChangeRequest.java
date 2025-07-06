package com.simon.armas_springboot_api.dto;

public class PasswordChangeRequest {
    private String username; // Email or username
    private String previousPassword;
    private String newPassword;
    private String confirmPassword;

    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPreviousPassword() { return previousPassword; }
    public void setPreviousPassword(String previousPassword) { this.previousPassword = previousPassword; }
    public String getNewPassword() { return newPassword; }
    public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}