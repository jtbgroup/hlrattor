package com.hlrattor.dto;

import com.hlrattor.entity.ProjectStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record StatusChangeDto(
        @NotNull ProjectStatus status,
        @NotNull LocalDate businessDate
) {}
