package com.hlrattor.dto;

import com.hlrattor.entity.ProjectStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ProjectDetailDto(
                UUID id,
                String reference,
                String name,
                String sciformaCode,
                String pordBia,
                String pordProject,
                String createdBy,
                Instant createdAt,
                ProjectStatus currentStatus,
                String currentProjectManager,
                LocalDate currentDueDate,
                BigDecimal totalBudget,
                List<ProjectStatusHistoryDto> statusHistory,
                List<ProjectManagerHistoryDto> managerHistory,
                List<DueDateHistoryDto> dueDateHistory,
                List<BudgetLineResponseDto> budgetLines) {
}
