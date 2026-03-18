package com.hlrattor.dto;

import com.hlrattor.entity.BudgetLineType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record BudgetLineResponseDto(
        UUID id,
        BudgetLineType type,
        BigDecimal amount,
        LocalDate date,
        String pordReference,
        String createdBy,
        Instant createdAt,
        String updatedBy,
        Instant updatedAt
) {}
