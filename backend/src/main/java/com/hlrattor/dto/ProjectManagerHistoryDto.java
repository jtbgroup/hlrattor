package com.hlrattor.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectManagerHistoryDto(
        UUID id,
        String projectManager,
        LocalDate startDate,
        LocalDate endDate,
        String assignedBy,
        Instant assignedAt
) {}
