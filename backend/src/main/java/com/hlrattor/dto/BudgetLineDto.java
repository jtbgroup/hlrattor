package com.hlrattor.dto;

import com.hlrattor.entity.BudgetLineType;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetLineDto(
        @NotNull BudgetLineType type,
        @NotNull BigDecimal amount,
        @NotNull LocalDate date,
        String pordReference
) {}
