// package com.kindsonthegenius.inventoryms_springboot_api.dto;

// import com.kindsonthegenius.inventoryms_springboot_api.models.User;

// public class UserDTO {
//     private Long id;
//     private String firstName;
//     private String lastName;
//     private String username;
//     private String organizationName;
//     private String directorateName;

    
//     // Constructors, getters, setters
//     public static UserDTO fromEntity(User user) {
//         UserDTO dto = new UserDTO();
//         dto.setId(user.getId());
//         dto.setFirstName(user.getFirstName());
//         dto.setLastName(user.getLastName());
//         dto.setUsername(user.getUsername());
//         dto.setOrganizationName(user.getOrganization() != null ? user.getOrganization().getName() : null);
//         dto.setDirectorateName(user.getDirectorate() != null ? user.getDirectorate().getName() : null);
//         return dto;
//     }
// }