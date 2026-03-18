package com.hlrattor.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.hlrattor.dto.UserDtos;
import com.hlrattor.service.UserManagementService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserDtos.UserResponse> listUsers() {
        return userManagementService.listUsers();
    }

    @PostMapping
    public ResponseEntity<UserDtos.UserResponse> createUser(
            @RequestBody UserDtos.CreateUserRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            UserDtos.UserResponse created = userManagementService.createUser(request, currentUser.getUsername());
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDtos.UserResponse> updateUser(
            @PathVariable UUID id,
            @RequestBody UserDtos.UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            String targetUsername = userManagementService.getUsernameById(id);
            if (currentUser.getUsername().equalsIgnoreCase(targetUsername)) {
                // Prevent self-disable if request would disable current user
                if (Boolean.FALSE.equals(request.enabled())) {
                    return ResponseEntity.badRequest().build();
                }
            }
            UserDtos.UserResponse updated = userManagementService.updateUser(id, request, currentUser.getUsername());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/disable")
    public ResponseEntity<Void> disableUser(
            @PathVariable UUID id,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            String targetUsername = userManagementService.getUsernameById(id);
            if (currentUser.getUsername().equalsIgnoreCase(targetUsername)) {
                return ResponseEntity.badRequest().build();
            }
            userManagementService.disableUser(id, currentUser.getUsername());
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @RequestBody UserDtos.ChangePasswordRequest request,
            @AuthenticationPrincipal UserDetails currentUser) {
        try {
            userManagementService.changePassword(currentUser.getUsername(), request);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

}
