package com.simon.armas_springboot_api.security.models;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerator;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.simon.armas_springboot_api.models.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
@Table(name = "user_privilege_assignment",
    uniqueConstraints = {@UniqueConstraint(columnNames = {"userid", "privilegeid"})})
public class UserPrivilegeAssignment {
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Id
    private Long id;

    @ManyToOne
    @JoinColumn(name = "userid", insertable = false, updatable = false)
    private User user;

    private Long userid;

    @ManyToOne
    @JoinColumn(name = "privilegeid", insertable = false, updatable = false)
    private Privilege privilege;

    private Long privilegeid;

    public UserPrivilegeAssignment(Long userid, Long privilegeid) {
        this.userid = userid;
        this.privilegeid = privilegeid;
    }
    // Getter and Setter for id
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    // Getter and Setter for user
    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // Getter and Setter for userid
    public Long getUserid() {
        return userid;
    }

    public void setUserid(Long userid) {
        this.userid = userid;
    }

    // Getter and Setter for privilege
    public Privilege getPrivilege() {
        return privilege;
    }

    public void setPrivilege(Privilege privilege) {
        this.privilege = privilege;
    }

    // Getter and Setter for privilegeid
    public Long getPrivilegeid() {
        return privilegeid;
    }

    public void setPrivilegeid(Long privilegeid) {
        this.privilegeid = privilegeid;
    }

}
