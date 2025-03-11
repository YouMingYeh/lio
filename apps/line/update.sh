#!/bin/bash
set -e

echo "Building the Docker image..."
docker build -t lio-line:latest .

echo "Rolling out the new Docker image..."
docker tag lio-line:latest ghcr.io/youmingyeh/lio-line:latest
docker push ghcr.io/youmingyeh/lio-line:latest

docker service update --image ghcr.io/youmingyeh/lio-line:latest lio-line_line-app --with-registry-auth
