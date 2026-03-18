package com.hlrattor.dto;

import com.hlrattor.entity.ProjectStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectStatusHistoryDto(
        UUID id,
        ProjectStatus status,
        LocalDate businessDate,
        String changedBy,
        Instant changedAt
) {}
