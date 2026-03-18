package com.hlrattor.dto;

import com.hlrattor.entity.ProjectStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.UUID;

public record CreateProjectDto(
        @NotBlank String name,
        @NotBlank String reference,
        @NotBlank String sciformaCode,
        String pordBia,
        String pordProject,
        @NotNull UUID projectManagerId,
        @NotNull ProjectStatus initialStatus,
        @NotNull LocalDate statusDate
) {}
