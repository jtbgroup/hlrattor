package com.hlrattor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project")
public class Project {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "sciforma_code", nullable = false)
    private String sciformaCode;

    @Column(name = "pord_bia")
    private String pordBia;

    @Column(name = "pord_project")
    private String pordProject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by", nullable = false, updatable = false)
    private AppUser createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    void prePersist() {
        createdAt = Instant.now();
    }

    // Getters and setters

    public UUID getId() { return id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }

    public String getSciformaCode() { return sciformaCode; }
    public void setSciformaCode(String sciformaCode) { this.sciformaCode = sciformaCode; }

    public String getPordBia() { return pordBia; }
    public void setPordBia(String pordBia) { this.pordBia = pordBia; }

    public String getPordProject() { return pordProject; }
    public void setPordProject(String pordProject) { this.pordProject = pordProject; }

    public AppUser getCreatedBy() { return createdBy; }
    public void setCreatedBy(AppUser createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
}
