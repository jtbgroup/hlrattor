#!/bin/sh
set -e

echo "🚀 Starting hlrattor application..."

# Validate environment variables
if [ -z "$SPRING_PROFILES_ACTIVE" ]; then
    echo "❌ SPRING_PROFILES_ACTIVE not set. Defaulting to 'postgres'"
    SPRING_PROFILES_ACTIVE="postgres"
fi

if [ -z "$SERVER_PORT" ]; then
    SERVER_PORT="8090"
fi

echo "📋 Configuration:"
echo "   Profile: $SPRING_PROFILES_ACTIVE"
echo "   Port: $SERVER_PORT"
echo "   JAVA_OPTS: $JAVA_OPTS"

# Start Nginx in background
echo "📡 Starting Nginx..."
nginx -g "daemon off;" &
NGINX_PID=$!

# Wait for Nginx to start
sleep 2

# Start Spring Boot
echo "🔧 Starting Spring Boot..."
exec java $JAVA_OPTS -jar /app/app.jar \
    --spring.profiles.active=$SPRING_PROFILES_ACTIVE \
    --server.port=$SERVER_PORT

# Cleanup on exit
trap "kill $NGINX_PID 2>/dev/null" EXIT
