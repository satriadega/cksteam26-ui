#!/bin/bash
set -e

DOCKERHUB_USERNAME="satriadega"
IMAGE_NAME="arsipku-frontend"

read -p "Masukkan API URL (default: http://localhost:8084): " API_URL
API_URL=${API_URL:-"http://localhost:8084"}

echo "--- Pulling latest image from Docker Hub ---"
docker pull "$DOCKERHUB_USERNAME/$IMAGE_NAME:latest"

echo "--- Running container with API URL: $API_URL ---"

if docker ps -a --format '{{.Names}}' | grep -Eq "^${IMAGE_NAME}\$"; then
    docker rm -f "$IMAGE_NAME"
fi

docker run -d \
  --name "$IMAGE_NAME" \
  -p 8080:80 \
  -e VITE_API_URL="$API_URL" \
  "$DOCKERHUB_USERNAME/$IMAGE_NAME:latest"

echo "--- Deployment finished ---"
