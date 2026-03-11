package com.hlrattor.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SessionRegistrationFilter extends OncePerRequestFilter {

    private final SessionRegistry sessionRegistry;

    public SessionRegistrationFilter(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated() && request.getSession(false) != null) {
                String username = authentication.getName();
                HttpSession session = request.getSession(false);
                sessionRegistry.registerSession(username, session);
            }
            filterChain.doFilter(request, response);
        } finally {
            // no-op
        }
    }
}
