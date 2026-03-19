# ============================================
# Build stage - compile backend + frontend
# ============================================
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# Build backend
WORKDIR /build/backend
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn clean package -DskipTests -q

# Build frontend
FROM node:22-alpine AS frontend-builder

WORKDIR /build/frontend
COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund

COPY frontend .
RUN npm run build

# ============================================
# Production stage - runtime with Nginx
# ============================================
FROM eclipse-temurin:21-jdk-alpine AS production

# Install Nginx
RUN apk add --no-cache nginx curl

# Create app user
RUN addgroup -g 1001 appuser && \
    adduser -D -u 1001 -G appuser appuser

WORKDIR /app

# Copy built backend JAR
COPY --from=builder /build/backend/target/*.jar app.jar

# Copy Nginx config
COPY docker/nginx.prod.conf /etc/nginx/nginx.conf

# Copy entrypoint script
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Copy frontend static assets
COPY --from=frontend-builder /build/frontend/dist/hlrattor /usr/share/nginx/html

# Fix all permissions needed by Nginx running as non-root
RUN mkdir -p \
        /var/run/nginx \
        /var/lib/nginx \
        /var/lib/nginx/tmp \
        /var/lib/nginx/tmp/client_body \
        /var/lib/nginx/tmp/proxy \
        /var/lib/nginx/tmp/fastcgi \
        /var/lib/nginx/tmp/uwsgi \
        /var/lib/nginx/tmp/scgi \
        /var/log/nginx && \
    chown -R appuser:appuser \
        /app \
        /usr/share/nginx/html \
        /var/log/nginx \
        /var/run/nginx \
        /var/lib/nginx \
        /entrypoint.sh && \
    chmod -R 755 /var/lib/nginx

USER appuser

EXPOSE 8090

ENV SPRING_PROFILES_ACTIVE=h2
ENV SERVER_PORT=8090
ENV JAVA_OPTS="-Xmx1024m -Xms512m"

ENTRYPOINT ["/entrypoint.sh"]