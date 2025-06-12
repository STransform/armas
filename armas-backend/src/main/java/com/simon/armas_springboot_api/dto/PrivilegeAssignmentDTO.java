package com.simon.armas_springboot_api.dto;
import jakarta.persistence.*;
import lombok.Data;

@Data
public class PrivilegeAssignmentDTO {
    private Long privilegeId;
    private boolean isActive;
}