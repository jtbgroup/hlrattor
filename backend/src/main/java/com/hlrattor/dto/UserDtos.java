package com.hlrattor.dto;

import java.util.List;
import java.util.UUID;

public final class UserDtos {

    private UserDtos() { }

    public record UserResponse(UUID id, String username, List<String> roles, boolean enabled) { }

    public record CreateUserRequest(String username, String password, List<String> roles, Boolean enabled) { }

    public record UpdateUserRequest(List<String> roles, Boolean enabled) { }

    public record ChangePasswordRequest(String currentPassword, String newPassword, String confirmPassword) { }
}
