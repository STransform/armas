package com.simon.armas_springboot_api.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
public class Organization {

	@Id
	@Column(name = "org_id")
	private String id;
	private String orgname;
	private String email;
	private String telephone;
	private String organizationhead;
	private String orgtype;

	public Organization(String id2) {
		super();
		this.id = id2;
	}

	public Organization(String id, String orgname, String email, String telephone, String organizationhead,
			String orgtype) {
		super();
		this.id = id;
		this.orgname = orgname;
		this.email = email;
		this.telephone = telephone;
		this.organizationhead = organizationhead;
		this.orgtype = orgtype;
	}

	public Organization() {
		super();
	}

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getOrgname() {
		return orgname;
	}

	public void setOrgname(String orgname) {
		this.orgname = orgname;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public String getOrganizationhead() {
		return organizationhead;
	}

	public void setOrganizationhead(String organizationhead) {
		this.organizationhead = organizationhead;
	}

	public String getOrgtype() {
		return orgtype;
	}

	public void setOrgtype(String orgtype) {
		this.orgtype = orgtype;
	}

	@Override
	public String toString() {
		return "Organization [id=" + id + ", orgname=" + orgname + ", email=" + email + ", telephone=" + telephone
				+ ", organizationhead=" + organizationhead + ", orgtype=" + orgtype + "]";
	}

}
