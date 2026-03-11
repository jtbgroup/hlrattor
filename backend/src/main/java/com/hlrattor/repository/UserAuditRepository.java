package com.hlrattor.repository;

import com.hlrattor.entity.UserAudit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface UserAuditRepository extends JpaRepository<UserAudit, UUID> {
}
