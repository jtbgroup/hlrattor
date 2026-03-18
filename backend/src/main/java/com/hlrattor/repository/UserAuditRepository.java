package com.hlrattor.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hlrattor.entity.UserAudit;

import java.util.UUID;

public interface UserAuditRepository extends JpaRepository<UserAudit, UUID> {
}
