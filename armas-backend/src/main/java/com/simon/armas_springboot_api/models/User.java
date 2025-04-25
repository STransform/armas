package com.simon.armas_springboot_api.models;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.GenericGenerator;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.simon.armas_springboot_api.security.models.Role;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PostLoad;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;


@Entity
@Table(name = "user")
public class User implements Serializable {

    private static final long serialVersionUID = 1671417246199538663L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @GenericGenerator(name = "native", strategy = "native")
    private Long id;

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Transient
    private String confirmPassword;

    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "verification_code", length = 64, updatable = false)
    private String verificationCode;

    @Column(name = "enabled")
    private boolean enabled;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>(); 

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user", orphanRemoval = true)
    private List<MasterTransaction> transactions = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "organization_id")
     @JsonBackReference(value = "user-organization")
    private Organization organization;

    @Transient
    private String orgname;

    @ManyToOne
    @JoinColumn(name = "directorate")
    @JsonBackReference(value = "user-directorate")
    private Directorate directorate;

    @Transient
    private String directoratename;

    @PostLoad
    public void populateTransientFields() {
        if (organization != null) {
            this.orgname = organization.getOrgname();
        }
        if (directorate != null) {
            this.directoratename = directorate.getDirectoratename();
        }
    }

    // Constructors
    public User() {
        this.enabled = false;
    }

    public User(Long id) {
        this.id = id;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
    public String getResetPasswordToken() { return resetPasswordToken; }
    public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }
    public String getVerificationCode() { return verificationCode; }
    public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public List<MasterTransaction> getTransactions() { return transactions; }
    public void setTransactions(List<MasterTransaction> transactions) { this.transactions = transactions; }
    public Organization getOrganization() { return organization; }
    public void setOrganization(Organization organization) { this.organization = organization; }
    public Directorate getDirectorate() { return directorate; }
    public void setDirectorate(Directorate directorate) { this.directorate = directorate; }
    public String getOrgname() { return orgname; }
    public void setOrgname(String orgname) { this.orgname = orgname; }
    public String getDirectoratename() { return directoratename; }
    public void setDirectoratename(String directoratename) { this.directoratename = directoratename; }
    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }

    @Override
    public String toString() {
        return "User [id=" + id + ", firstName=" + firstName + ", lastName=" + lastName
                + ", username=" + username + ", password=" + password + ", roles=" + roles + "]";
    }


    
}