package com.kindsonthegenius.inventoryms_springboot_api.models;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Directorate {

	@Id
	private String directoratename;
	private String telephone;
	private String email;

	@OneToMany(mappedBy = "directorate")
	private List<Document> documents;
     // Add getId() and setId() for JSON compatibility
	public String getId() { return directoratename; }
	public void setId(String id) { this.directoratename = id; }

	public String getDirectoratename() {
		return directoratename;
	}

	public void setDirectoratename(String directoratename) {
		this.directoratename = directoratename;
	}

	public String getTelephone() {
		return telephone;
	}

	public void setTelephone(String telephone) {
		this.telephone = telephone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public List<Document> getDocuments() {
		return documents;
	}

	public void setDocuments(List<Document> documents) {
		this.documents = documents;
	}

}
