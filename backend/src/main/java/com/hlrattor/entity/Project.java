package com.hlrattor.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "project")
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
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
    @JoinColumn(name = "created_by_id", nullable = false)
    private AppUser createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    private List<ProjectStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("assignedAt ASC")
    private List<ProjectManagerHistory> managerHistory = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt ASC")
    private List<DueDateHistory> dueDateHistory = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("date ASC")
    private List<BudgetLine> budgetLines = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
    }

    // Derived helpers

    public ProjectStatus currentStatus() {
        if (statusHistory.isEmpty()) return null;
        return statusHistory.get(statusHistory.size() - 1).getStatus();
    }

    public boolean isReadOnly() {
        ProjectStatus status = currentStatus();
        return status != null && status.isReadOnly();
    }

    public AppUser currentProjectManager() {
        return managerHistory.stream()
                .filter(h -> h.getEndDate() == null)
                .map(ProjectManagerHistory::getProjectManager)
                .findFirst()
                .orElse(null);
    }

    // Getters & Setters

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

    public List<ProjectStatusHistory> getStatusHistory() { return statusHistory; }
    public List<ProjectManagerHistory> getManagerHistory() { return managerHistory; }
    public List<DueDateHistory> getDueDateHistory() { return dueDateHistory; }
    public List<BudgetLine> getBudgetLines() { return budgetLines; }
}
