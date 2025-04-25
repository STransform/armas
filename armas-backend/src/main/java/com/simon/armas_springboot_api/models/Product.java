package com.simon.armas_springboot_api.models;

import com.simon.armas_springboot_api.security.models.Auditable;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "product")
@Data
@EqualsAndHashCode(callSuper = false) 
public class Product extends Auditable<String> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 75)
    private String title;

    @Column(columnDefinition = "TINYTEXT")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @ManyToOne()
    @JoinColumn(name = "subcategoryid", insertable = false, updatable = false)
    private SubCategory subCategory;
    private Long subcategoryid;

    @ManyToOne()
    @JoinColumn(name = "categoryid", insertable = false, updatable = false)
    private Category category;
    private Long categoryid;
}

