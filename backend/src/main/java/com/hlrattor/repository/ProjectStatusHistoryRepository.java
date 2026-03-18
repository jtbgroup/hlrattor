package com.hlrattor.repository;

import com.hlrattor.entity.ProjectStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ProjectStatusHistoryRepository extends JpaRepository<ProjectStatusHistory, UUID> {
    List<ProjectStatusHistory> findByProjectIdOrderByChangedAtAsc(UUID projectId);
}
