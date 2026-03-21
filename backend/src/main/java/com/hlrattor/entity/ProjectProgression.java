package com.hlrattor.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "project_progression")
public class ProjectProgression {

    @Id
    @UuidGenerator
    @Column(nullable = false, updatable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false, updatable = false)
    private Project project;

    @Column(name = "progression_value", nullable = false)
    private Integer progressionValue;

    @Column(name = "progression_date", nullable = false)
    private LocalDate progressionDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recorded_by", nullable = false, updatable = false)
    private AppUser recordedBy;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private Instant recordedAt;

    @PrePersist
    void prePersist() {
        recordedAt = Instant.now();
    }

    // Getters and setters

    public UUID getId() { return id; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Integer getProgressionValue() { return progressionValue; }
    public void setProgressionValue(Integer progressionValue) { this.progressionValue = progressionValue; }

    public LocalDate getProgressionDate() { return progressionDate; }
    public void setProgressionDate(LocalDate progressionDate) { this.progressionDate = progressionDate; }

    public AppUser getRecordedBy() { return recordedBy; }
    public void setRecordedBy(AppUser recordedBy) { this.recordedBy = recordedBy; }

    public Instant getRecordedAt() { return recordedAt; }
}
