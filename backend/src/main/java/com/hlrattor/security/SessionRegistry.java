package com.hlrattor.security;

import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionRegistry {

    private final Map<String, Set<String>> sessionsByUsername = new ConcurrentHashMap<>();
    private final Map<String, HttpSession> sessionsById = new ConcurrentHashMap<>();

    public void registerSession(String username, HttpSession session) {
        if (username == null || session == null) {
            return;
        }

        sessionsById.put(session.getId(), session);
        sessionsByUsername
                .computeIfAbsent(username, key -> ConcurrentHashMap.newKeySet())
                .add(session.getId());
    }

    public void unregisterSession(HttpSession session) {
        if (session == null) {
            return;
        }
        sessionsById.remove(session.getId());
        sessionsByUsername.values().forEach(set -> set.remove(session.getId()));
    }

    public void invalidateSessions(String username) {
        Set<String> sessionIds = sessionsByUsername.getOrDefault(username, Collections.emptySet());
        for (String sessionId : sessionIds) {
            HttpSession session = sessionsById.get(sessionId);
            if (session != null) {
                try {
                    session.invalidate();
                } catch (IllegalStateException ignored) {
                    // already invalidated
                }
            }
            sessionsById.remove(sessionId);
        }
        sessionsByUsername.remove(username);
    }
}
