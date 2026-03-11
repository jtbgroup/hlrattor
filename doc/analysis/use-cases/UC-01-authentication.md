# UC-01 - Authentication

## Summary

Allows a user to authenticate into the application using a username and password. On success, the user is redirected to the home page. On failure, an error message is displayed. The user can also log out, which invalidates the session.

## Actors

- ADMIN
- PROJECT_MANAGER

## Preconditions

- The user exists in the database with a username and a hashed password (BCrypt 12).

## Main Flow

1. The user accesses the application and is redirected to the login page.
2. The user enters their `username` and `password`.
3. The backend validates the credentials via Spring Security.
4. A session is created server-side.
5. The backend returns the authenticated user's information (username, role).
6. The user is redirected to the home page.

## Alternative Flow — Invalid Credentials

1. The user enters an invalid `username` or `password`.
2. The backend rejects the authentication attempt.
3. A generic error message is displayed: *"Invalid username or password"*.
4. No session is created.
5. The user remains on the login page.

## Alternative Flow — Logout

1. The user clicks the "Logout" button.
2. The backend invalidates the session.
3. The user is redirected to the login page.

## Postconditions

- **Main flow**: The user is authenticated, the session is active, and the user is on the home page.
- **Alternative flow — Invalid credentials**: No session is created; the user remains on the login page with an error message.
- **Alternative flow — Logout**: The session is invalidated; the user is redirected to the login page.

## Non-functional Requirements

- Passwords are hashed using BCrypt with a strength of 12.
- The Spring Security configuration must be structured so that switching to OAuth2/Keycloak only requires adding the resource server starter and swapping the `SecurityFilterChain` bean — no other changes.
- No "remember me" mechanism.
- Session management is server-side only.
