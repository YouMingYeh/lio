#!/bin/bash
set -e

# Lock file path
LOCK_FILE="/tmp/lio_deployment.lock"

# Check if the lock file exists
if [ -e "$LOCK_FILE" ]; then
    # Check if the process holding the lock is still running
    LOCK_PID=$(cat "$LOCK_FILE")
    if ps -p "$LOCK_PID" >/dev/null; then
        echo "Another deployment is in progress (PID: $LOCK_PID). Exiting."
        exit 1
    else
        echo "Found stale lock file. Removing it."
        rm -f "$LOCK_FILE"
    fi
fi

# Create lock file
echo $$ >"$LOCK_FILE"

# Cleanup function to remove the lock file on exit
cleanup() {
    echo "Removing lock file."
    rm -f "$LOCK_FILE"
}

# Register cleanup function to execute on script exit
trap cleanup EXIT

echo "Pulling the latest code..."
git pull origin main

echo "Building the line..."
(cd apps/line && ./update.sh)

echo "Updating the Docker image..."
docker service update --image ghcr.io/youmingyeh/lio-line:latest lio-line_line-app --with-registry-auth

echo "Cleaning up unused Docker resources..."
docker system prune -f

echo "Building and deploying the web..."
DOCKER_BUILDKIT=1 COMPOSE_DOCKER_CLI_BUILD=1 docker compose up -d --build

echo "Removing unused Docker images and containers..."
docker image prune -f
docker container prune -f

echo "Deployment complete!"
