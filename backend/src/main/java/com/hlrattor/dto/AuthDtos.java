package com.hlrattor.dto;

import java.util.List;

public final class AuthDtos {

    private AuthDtos() { }

    public record LoginRequest(String username, String password) { }

    public record UserResponse(String username, List<String> roles) { }
}
