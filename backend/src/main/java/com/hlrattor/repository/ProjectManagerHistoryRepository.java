package com.hlrattor.repository;

import com.hlrattor.entity.ProjectManagerHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProjectManagerHistoryRepository extends JpaRepository<ProjectManagerHistory, UUID> {
    List<ProjectManagerHistory> findByProjectIdOrderByStartDateAsc(UUID projectId);
    Optional<ProjectManagerHistory> findByProjectIdAndEndDateIsNull(UUID projectId);
}
