package com.simon.armas_springboot_api.dto;
import java.io.Serializable;
public class RolePrivilegeDTO implements Serializable{
    private Long privilegeId;
    private boolean enabled;

    // Getter for privilegeId
    public Long getPrivilegeId() {
        return privilegeId;
    }

    // Setter for privilegeId
    public void setPrivilegeId(Long privilegeId) {
        this.privilegeId = privilegeId;
    }

    // Getter for enabled
    public boolean isEnabled() {
        return enabled;
    }

    // Setter for enabled
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}