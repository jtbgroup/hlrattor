package com.hlrattor.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ProjectManagerChangeDto(@NotNull UUID projectManagerId) {
}
