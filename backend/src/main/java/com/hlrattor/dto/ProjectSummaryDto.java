package com.hlrattor.dto;

import com.hlrattor.entity.ProjectStatus;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record ProjectSummaryDto(
        UUID id,
        String reference,
        String name,
        ProjectStatus currentStatus,
        String currentProjectManager,
        LocalDate currentDueDate,
        BigDecimal totalBudget
) {}
