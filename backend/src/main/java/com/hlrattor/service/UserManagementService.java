package com.hlrattor.service;

import com.hlrattor.dto.UserDtos;
import com.hlrattor.entity.AppUser;
import com.hlrattor.entity.UserAudit;
import com.hlrattor.repository.AppUserRepository;
import com.hlrattor.repository.UserAuditRepository;
import com.hlrattor.security.SessionRegistry;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class UserManagementService {

    private final AppUserRepository userRepository;
    private final UserAuditRepository auditRepository;
    private final PasswordEncoder passwordEncoder;
    private final SessionRegistry sessionRegistry;

    public UserManagementService(AppUserRepository userRepository,
                                 UserAuditRepository auditRepository,
                                 PasswordEncoder passwordEncoder,
                                 SessionRegistry sessionRegistry) {
        this.userRepository = userRepository;
        this.auditRepository = auditRepository;
        this.passwordEncoder = passwordEncoder;
        this.sessionRegistry = sessionRegistry;
    }

    public List<UserDtos.UserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public String getUsernameById(UUID userId) {
        return userRepository.findById(userId)
                .map(AppUser::getUsername)
                .orElse(null);
    }

    @Transactional
    public UserDtos.UserResponse createUser(UserDtos.CreateUserRequest request, String performedBy) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }

        AppUser user = new AppUser();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(AppUser.Role.valueOf(request.role()));
        user.setEnabled(Boolean.TRUE.equals(request.enabled()));

        AppUser saved = userRepository.save(user);
        recordAudit("CREATE", performedBy, saved.getUsername(), null);
        return toResponse(saved);
    }

    @Transactional
    public UserDtos.UserResponse updateUser(UUID userId, UserDtos.UpdateUserRequest request, String performedBy) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean updated = false;

        if (request.role() != null) {
            user.setRole(AppUser.Role.valueOf(request.role()));
            updated = true;
        }
        if (request.enabled() != null) {
            user.setEnabled(request.enabled());
            updated = true;
        }

        if (updated) {
            AppUser saved = userRepository.save(user);
            recordAudit("UPDATE", performedBy, saved.getUsername(), null);
            return toResponse(saved);
        }

        return toResponse(user);
    }

    @Transactional
    public void disableUser(UUID userId, String performedBy) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setEnabled(false);
        userRepository.save(user);
        sessionRegistry.invalidateSessions(user.getUsername());
        recordAudit("DISABLE", performedBy, user.getUsername(), null);
    }

    @Transactional
    public void changePassword(String username, UserDtos.ChangePasswordRequest request) {
        AppUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        recordAudit("CHANGE_PASSWORD", username, username, null);
    }

    private UserDtos.UserResponse toResponse(AppUser user) {
        return new UserDtos.UserResponse(user.getId(), user.getUsername(), user.getRole().name(), user.isEnabled());
    }

    private void recordAudit(String action, String performedBy, String targetUser, String details) {
        UserAudit audit = new UserAudit();
        audit.setAction(action);
        audit.setPerformedBy(performedBy);
        audit.setTargetUser(targetUser);
        audit.setDetails(details);
        auditRepository.save(audit);
    }
}
