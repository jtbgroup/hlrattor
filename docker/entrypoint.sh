#!/bin/sh
set -e

echo "🚀 Starting hlrattor application..."

# Validate environment variables
if [ -z "$SPRING_PROFILES_ACTIVE" ]; then
    echo "⚠️  SPRING_PROFILES_ACTIVE not set. Defaulting to 'h2'"
    SPRING_PROFILES_ACTIVE="h2"
fi

# Spring Boot always runs on internal port 8081 (Nginx proxies 8090 → 8081)
SPRING_PORT=8081

echo "📋 Configuration:"
echo "   Profile:    $SPRING_PROFILES_ACTIVE"
echo "   Public port: ${SERVER_PORT:-8090} (Nginx)"
echo "   Backend port: $SPRING_PORT (Spring Boot)"
echo "   JAVA_OPTS:  $JAVA_OPTS"

# Start Nginx in background
echo "📡 Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Trap must be set before exec — clean up Nginx if Spring Boot exits
cleanup() {
    echo "🛑 Shutting down Nginx (PID $NGINX_PID)..."
    kill "$NGINX_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Wait briefly for Nginx to be ready
sleep 1

# Start Spring Boot on internal port 8081
echo "🔧 Starting Spring Boot on port $SPRING_PORT..."
exec java $JAVA_OPTS -jar /app/app.jar \
    --spring.profiles.active="$SPRING_PROFILES_ACTIVE" \
    --server.port="$SPRING_PORT"