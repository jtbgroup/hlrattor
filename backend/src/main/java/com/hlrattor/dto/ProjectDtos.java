package com.hlrattor.dto;

import com.hlrattor.entity.BudgetLineType;
import com.hlrattor.entity.ProjectStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public final class ProjectDtos {

    private ProjectDtos() {}

    // ─── Summary (list view) ──────────────────────────────────────────────────

    public record ProjectSummaryDto(
            UUID id,
            String reference,
            String name,
            ProjectStatus currentStatus,
            String currentProjectManager,
            LocalDate currentDueDate,
            Integer currentProgression,
            BigDecimal totalBudget
    ) {}

    // ─── Detail (full view) ───────────────────────────────────────────────────

    public record ProjectDetailDto(
            UUID id,
            String reference,
            String name,
            String imputationCode,
            String pordBia,
            String pordProject,
            String createdBy,
            Instant createdAt,
            ProjectStatus currentStatus,
            String currentProjectManager,
            LocalDate currentDueDate,
            Integer currentProgression,
            BigDecimal totalBudget,
            List<ProjectStatusHistoryDto> statusHistory,
            List<ProjectManagerHistoryDto> projectManagerHistory,
            List<DueDateHistoryDto> dueDateHistory,
            List<BudgetLineResponseDto> budgetLines,
            List<ProgressionResponseDto> progressionHistory
    ) {}

    // ─── Create / Update requests ─────────────────────────────────────────────

    public record CreateProjectDto(
            @NotBlank String name,
            @NotBlank String reference,
            @NotBlank String imputationCode,
            String pordBia,
            String pordProject,
            @NotNull UUID projectManagerId,
            @NotNull ProjectStatus initialStatus,
            @NotNull LocalDate statusDate
    ) {}

    public record UpdateProjectDto(
            String name,
            String reference,
            String imputationCode,
            String pordBia,
            String pordProject
    ) {}

    // ─── Status ───────────────────────────────────────────────────────────────

    public record StatusChangeDto(
            @NotNull ProjectStatus status,
            @NotNull LocalDate businessDate
    ) {}

    public record ProjectStatusHistoryDto(
            UUID id,
            ProjectStatus status,
            LocalDate businessDate,
            String changedBy,
            Instant changedAt
    ) {}

    // ─── Project manager ──────────────────────────────────────────────────────

    public record ProjectManagerChangeDto(
            @NotNull UUID projectManagerId
    ) {}

    public record ProjectManagerHistoryDto(
            UUID id,
            String projectManager,
            LocalDate startDate,
            LocalDate endDate,
            String assignedBy,
            Instant assignedAt
    ) {}

    // ─── Due date ─────────────────────────────────────────────────────────────

    public record DueDateChangeDto(
            @NotNull LocalDate dueDate
    ) {}

    public record DueDateHistoryDto(
            UUID id,
            LocalDate dueDate,
            String changedBy,
            Instant changedAt
    ) {}

    // ─── Budget lines ─────────────────────────────────────────────────────────

    public record BudgetLineDto(
            @NotNull BudgetLineType type,
            @NotNull @DecimalMin("0.01") BigDecimal amount,
            @NotNull LocalDate date
    ) {}

    public record BudgetLineResponseDto(
            UUID id,
            BudgetLineType type,
            BigDecimal amount,
            LocalDate date,
            String createdBy,
            Instant createdAt,
            String updatedBy,
            Instant updatedAt
    ) {}

    // ─── Progression ──────────────────────────────────────────────────────────

    public record ProgressionDto(
            @NotNull @Min(0) @Max(100) Integer progressionValue,
            @NotNull LocalDate progressionDate
    ) {}

    public record ProgressionResponseDto(
            UUID id,
            Integer value,
            LocalDate progressionDate,
            String recordedBy,
            Instant recordedAt
    ) {}
}
