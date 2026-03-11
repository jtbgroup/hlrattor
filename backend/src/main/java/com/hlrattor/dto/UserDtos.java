package com.hlrattor.dto;

import java.util.UUID;

public final class UserDtos {

    private UserDtos() { }

    public record UserResponse(UUID id, String username, String role, boolean enabled) { }

    public record CreateUserRequest(String username, String password, String role, Boolean enabled) { }

    public record UpdateUserRequest(String role, Boolean enabled) { }

    public record ChangePasswordRequest(String currentPassword, String newPassword, String confirmPassword) { }
}
