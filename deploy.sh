#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Configuration ---
DOCKERHUB_USERNAME="satriadega"
IMAGE_NAME="arsipku-frontend"

# --- Get Version ---
# Extract the version from package.json
VERSION=$(node -p "require('./package.json').version")

# Check if the version was extracted
if [ -z "$VERSION" ]; then
  echo "Error: Could not extract version from package.json"
  exit 1
fi

echo "--- Building and Pushing Version: $VERSION ---"

# --- Docker Build ---
# The build no longer requires the API_URL argument.
echo "Building Docker image with tag $DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION..."
docker build -t "$DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION" .

# --- Docker Tag ---
echo "Tagging image as latest..."
docker tag "$DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION" "$DOCKERHUB_USERNAME/$IMAGE_NAME:latest"

# --- Docker Push ---
echo "Pushing version $VERSION to Docker Hub..."
docker push "$DOCKERHUB_USERNAME/$IMAGE_NAME:$VERSION"

echo "Pushing latest tag to Docker Hub..."
docker push "$DOCKERHUB_USERNAME/$IMAGE_NAME:latest"

echo "--- Deployment script finished successfully! ---"
