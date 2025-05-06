package com.simon.armas_springboot_api.models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.simon.armas_springboot_api.security.models.Auditable;
import com.simon.armas_springboot_api.models.User;
import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.simon.armas_springboot_api.models.MasterTransaction;
import java.util.Date;



@Entity
@Table(name = "attachment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class Attachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filePath;

    @Column(nullable = false)
    private String fileName;

    @ManyToOne
    @JoinColumn(name = "transaction_id", nullable = false)
    private MasterTransaction transaction;

    @ManyToOne
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(nullable = false)
    private Date uploadDate; // Changed from LocalDateTime to Date

    @Column(nullable = true)
    private String uploadContext; // "SUBMISSION" or "REJECTION"
}