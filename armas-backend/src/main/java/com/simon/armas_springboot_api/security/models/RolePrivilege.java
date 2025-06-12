
package com.simon.armas_springboot_api.security.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
//import privelege here
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;

import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
public class RolePrivilege {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @ManyToOne
    @JoinColumn(name = "privilege_id")
    private Privilege privilege;

    private boolean enabled;
    //generate getter and setter please
     public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Privilege getPrivilege() {
        return privilege;
    }

    public void setPrivilege(Privilege privilege) {
        this.privilege = privilege;
    }

    public boolean isEnabled() {  // Note: boolean uses 'is' instead of 'get'
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}