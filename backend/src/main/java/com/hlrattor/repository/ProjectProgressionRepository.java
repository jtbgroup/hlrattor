package com.hlrattor.repository;

import com.hlrattor.entity.ProjectProgression;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectProgressionRepository extends JpaRepository<ProjectProgression, UUID> {
    List<ProjectProgression> findByProjectIdOrderByProgressionDateAsc(UUID projectId);
    Optional<ProjectProgression> findTopByProjectIdOrderByProgressionDateDescRecordedAtDesc(UUID projectId);
}
