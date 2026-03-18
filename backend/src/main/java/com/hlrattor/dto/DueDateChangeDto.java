package com.hlrattor.dto;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record DueDateChangeDto(@NotNull LocalDate dueDate) {}
