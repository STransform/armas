package com.simon.armas_springboot_api.models;

import java.util.List;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonManagedReference;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Directorate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Use UUID for string-based ID
    private String id;
    private String directoratename;
    private String telephone;
    private String email;

    @OneToMany(mappedBy = "directorate")
    @JsonManagedReference // Prevents infinite recursion in JSON
    private List<Document> documents;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getDirectoratename() { return directoratename; }
    public void setDirectoratename(String directoratename) { this.directoratename = directoratename; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public List<Document> getDocuments() { return documents; }
    public void setDocuments(List<Document> documents) { this.documents = documents; }

	//generate toString
	@Override
	public String toString() {
		return "Directorate [directorateId=" + directoratename + ", telephone=" + telephone + ", email=" + email + "]";
	}
}
