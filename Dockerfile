# ─── Stage 1: Build Frontend ───────────────────────────────────────────────
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build -- --configuration production

# ─── Stage 2: Build Backend ────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS backend-build
WORKDIR /app/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -q
COPY backend/src ./src
RUN mvn package -DskipTests -q

# ─── Stage 3: Production image (nginx + backend) ───────────────────────────
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache nginx

WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Ensure nginx directories are writable by the app user
RUN mkdir -p /var/log/nginx /var/run /etc/nginx/http.d && \
    chown -R appuser:appgroup /var/log/nginx /var/run /etc/nginx/http.d /var/lib/nginx /run

# Copy built artifacts
COPY --from=backend-build /app/backend/target/*.jar app.jar
COPY --from=frontend-build /app/frontend/dist/hlrattor/browser /app/static

# nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf
RUN rm -f /etc/nginx/http.d/default.conf
COPY docker/nginx.prod.conf /etc/nginx/http.d/default.conf

# Entrypoint that runs nginx + backend together
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER appuser
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
