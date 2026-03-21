package com.hlrattor.repository;

import com.hlrattor.entity.DueDateHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DueDateHistoryRepository extends JpaRepository<DueDateHistory, UUID> {
    List<DueDateHistory> findByProjectIdOrderByChangedAtAsc(UUID projectId);
    Optional<DueDateHistory> findTopByProjectIdOrderByChangedAtDesc(UUID projectId);
}
