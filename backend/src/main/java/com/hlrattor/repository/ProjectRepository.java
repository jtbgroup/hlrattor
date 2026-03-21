package com.hlrattor.repository;

import com.hlrattor.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    boolean existsByReference(String reference);
    boolean existsByReferenceAndIdNot(String reference, UUID id);
    Optional<Project> findByReference(String reference);
}
