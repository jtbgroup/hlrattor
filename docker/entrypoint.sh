#!/bin/sh
set -e

# Start the backend in the background
java -jar /app/app.jar &
BACKEND_PID=$!

# Start nginx in the foreground
nginx -g "daemon off;" &
NGINX_PID=$!

# Forward signals to child processes
_term() {
  echo "Stopping..."
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  kill -TERM "$NGINX_PID" 2>/dev/null || true
}
trap _term TERM INT

# Wait for either process to exit
wait -n "$BACKEND_PID" "$NGINX_PID"

# Ensure all children are stopped
kill -TERM "$BACKEND_PID" "$NGINX_PID" 2>/dev/null || true
wait
