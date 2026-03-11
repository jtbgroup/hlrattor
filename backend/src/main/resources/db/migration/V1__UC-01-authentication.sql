-- Use case: UC-01

CREATE TABLE app_user (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username  VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(50)  NOT NULL,
    enabled   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Default ADMIN user: admin / admin123 (BCrypt strength 12)
INSERT INTO app_user (username, password, role, enabled)
VALUES (
    'admin',
    '$2b$12$Cjcy4.MrV8DCzBOQlLSdVuY5iKWeU7D1p7uGY0TqdK468LsB4v4vS',
    'ADMIN',
    TRUE
);
