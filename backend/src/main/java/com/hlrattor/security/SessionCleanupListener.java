package com.hlrattor.security;

import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import org.springframework.stereotype.Component;

@Component
public class SessionCleanupListener implements HttpSessionListener {

    private final SessionRegistry sessionRegistry;

    public SessionCleanupListener(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        sessionRegistry.unregisterSession(se.getSession());
    }
}
