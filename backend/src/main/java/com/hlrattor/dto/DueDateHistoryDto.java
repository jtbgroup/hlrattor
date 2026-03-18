package com.hlrattor.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record DueDateHistoryDto(
        UUID id,
        LocalDate dueDate,
        String changedBy,
        Instant changedAt
) {}
