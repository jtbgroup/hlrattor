-- Use case: UC-01

CREATE TABLE app_user (
    id        UUID         PRIMARY KEY,
    username  VARCHAR(100) NOT NULL UNIQUE,
    password  VARCHAR(255) NOT NULL,
    role      VARCHAR(50)  NOT NULL,
    enabled   BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO app_user (id, username, password, role, enabled)
VALUES (
    RANDOM_UUID(),
    'admin',
    '$2b$12$Cjcy4.MrV8DCzBOQlLSdVuY5iKWeU7D1p7uGY0TqdK468LsB4v4vS',
    'ADMIN',
    TRUE
);
