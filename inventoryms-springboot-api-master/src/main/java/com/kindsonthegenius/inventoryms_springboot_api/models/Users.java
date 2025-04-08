// package com.kindsonthegenius.inventoryms_springboot_api.models;

// import java.io.Serializable;
// import java.util.ArrayList;
// import java.util.List;
// import java.util.Set;

// import org.hibernate.annotations.GenericGenerator;

// import com.kindsonthegenius.inventoryms_springboot_api.security.models.Role;

// import jakarta.persistence.CascadeType;
// import jakarta.persistence.Column;
// import jakarta.persistence.Entity;
// import jakarta.persistence.FetchType;
// import jakarta.persistence.GeneratedValue;
// import jakarta.persistence.GenerationType;
// import jakarta.persistence.Id;
// import jakarta.persistence.JoinColumn;
// import jakarta.persistence.JoinTable;
// import jakarta.persistence.ManyToMany;
// import jakarta.persistence.ManyToOne;
// import jakarta.persistence.OneToMany;
// import jakarta.validation.constraints.Size;

// @Entity
// public class Users implements Serializable {

//     private static final long serialVersionUID = 1671417246199538663L;

//     @Id
//     @GeneratedValue(strategy = GenerationType.AUTO, generator = "native")
//     @GenericGenerator(name = "native", strategy = "native")
//     private Long id;

//     @Column
//     private String firstName;

//     @Column
//     private String lastName;

//     @Column
//     private String username;

//     @Column
//     private String password;

//     @Column(name = "reset_password_token")
//     private String resetPasswordToken;

//     @Column(name = "verification_code", length = 64, updatable = false)
//     private String verificationCode;

//     @Column(name = "enabled")
//     private boolean enabled;

//     private String confirmPassword;

//     @ManyToMany(fetch = FetchType.LAZY)
//     @JoinTable(name = "user_roles",
//             joinColumns = @JoinColumn(name = "user_id"),
//             inverseJoinColumns = @JoinColumn(name = "role_id"))
//     private Set<Role> roles;

//     @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "user", orphanRemoval = true)
//     private List<MasterTransaction> transactions = new ArrayList<>();
//     @ManyToOne
//     @JoinColumn(name = "org_id", insertable = false, updatable = false)
//     private Organization organization;
//     private String org_id;

//     @ManyToOne
//     @JoinColumn(name = "user_dir_name", insertable = false, updatable = false)
//     private Directorate directorate;
//     private String user_dir_name;

//     public Users() {
//         super();
//         this.enabled = false;
//     }

//     public Users(Long id) {
//         super();
//         this.id = id;
//     }

//     // Getters and Setters
//     public Long getId() { return id; }
//     public void setId(Long id) { this.id = id; }
//     public String getFirstName() { return firstName; }
//     public void setFirstName(String firstName) { this.firstName = firstName; }
//     public String getLastName() { return lastName; }
//     public void setLastName(String lastName) { this.lastName = lastName; }
//     public String getUsername() { return username; }
//     public void setUsername(String username) { this.username = username; }
//     public String getPassword() { return password; }
//     public void setPassword(String password) { this.password = password; }
//     public String getConfirmPassword() { return confirmPassword; }
//     public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
//     public String getResetPasswordToken() { return resetPasswordToken; }
//     public void setResetPasswordToken(String resetPasswordToken) { this.resetPasswordToken = resetPasswordToken; }
//     public String getVerificationCode() { return verificationCode; }
//     public void setVerificationCode(String verificationCode) { this.verificationCode = verificationCode; }
//     public boolean isEnabled() { return enabled; }
//     public void setEnabled(boolean enabled) { this.enabled = enabled; }
//     public List<MasterTransaction> getTransactions() { return transactions; }
//     public void setTransactions(List<MasterTransaction> transactions) { this.transactions = transactions; }
//     public Organization getOrganization() { return organization; }
//     public void setOrganization(Organization organization) { this.organization = organization; }
//     public String getOrg_id() { return org_id; }
//     public void setOrg_id(String org_id) { this.org_id = org_id; }
//     public Directorate getDirectorate() { return directorate; }
//     public void setDirectorate(Directorate directorate) { this.directorate = directorate; }
//     public String getUser_dir_name() { return user_dir_name; }
//     public void setUser_dir_name(String user_dir_name) { this.user_dir_name = user_dir_name; }
//     public Set<Role> getRoles() { return roles; }
//     public void setRoles(Set<Role> roles) { this.roles = roles; }

//     @Override
//     public String toString() {
//         return "Users [id=" + id + ", firstName=" + firstName + ", lastName=" + lastName 
//                 + ", username=" + username + ", password=" + password + ", confirmPassword=" + confirmPassword
//                 + ", roles=" + roles + "]";
//     }
// 	@Override
// 	public int hashCode() {
// 		final int prime = 31;
// 		int result = 1;
// 		result = prime * result + ((confirmPassword == null) ? 0 : confirmPassword.hashCode());
		
// 		result = prime * result + ((firstName == null) ? 0 : firstName.hashCode());
// 		result = prime * result + ((id == null) ? 0 : id.hashCode());
// 		result = prime * result + ((lastName == null) ? 0 : lastName.hashCode());
// 		result = prime * result + ((password == null) ? 0 : password.hashCode());
// 		result = prime * result + ((roles == null) ? 0 : roles.hashCode());
// 		result = prime * result + ((username == null) ? 0 : username.hashCode());
// 		return result;
// 	}

// 	@Override
// 	public boolean equals(Object obj) {
// 		if (this == obj)
// 			return true;
// 		if (obj == null)
// 			return false;
// 		if (getClass() != obj.getClass())
// 			return false;
// 		Users other = (Users) obj;
// 		if (confirmPassword == null) {
// 			if (other.confirmPassword != null)
// 				return false;
// 		} else if (!confirmPassword.equals(other.confirmPassword))
// 			return false;
		
// 		if (firstName == null) {
// 			if (other.firstName != null)
// 				return false;
// 		} else if (!firstName.equals(other.firstName))
// 			return false;
// 		if (id == null) {
// 			if (other.id != null)
// 				return false;
// 		} else if (!id.equals(other.id))
// 			return false;
// 		if (lastName == null) {
// 			if (other.lastName != null)
// 				return false;
// 		} else if (!lastName.equals(other.lastName))
// 			return false;
// 		if (password == null) {
// 			if (other.password != null)
// 				return false;
// 		} else if (!password.equals(other.password))
// 			return false;
// 		if (roles == null) {
// 			if (other.roles != null)
// 				return false;
// 		} else if (!roles.equals(other.roles))
// 			return false;
// 		if (username == null) {
// 			if (other.username != null)
// 				return false;
// 		} else if (!username.equals(other.username))
// 			return false;
// 		return true;
// 	}


	
	
// }
