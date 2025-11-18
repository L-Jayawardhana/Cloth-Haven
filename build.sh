#!/bin/bash

# Stop on error
set -e

echo "--- 1. Building Spring Boot Backend ---"
cd backend
# Use the wrapper to build. Skip tests to save time.
./mvnw clean package -DskipTests
cd ..

echo "--- 2. Building Docker Image ---"
# Build the image with the tag 'cloth-haven-all-in-one'
docker build --platform linux/amd64 -t cloth-haven-all-in-one .

echo "--- Build Complete! ---"
echo "To run it locally:"
echo "docker run -p 8080:8080 cloth-haven-all-in-one"