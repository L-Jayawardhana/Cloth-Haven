#!/bin/bash

echo "🚀 Starting Cloth Haven Backend..."
echo "📁 Directory: $(pwd)/backend"
echo "🔧 Using Maven wrapper..."

cd backend

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "❌ Java is not installed or not in PATH"
    echo "Please install Java 17 or higher"
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "❌ Java version $JAVA_VERSION detected. Please install Java 17 or higher"
    exit 1
fi

echo "✅ Java version: $(java -version 2>&1 | head -n 1)"

# Check if MySQL is running (optional check)
if command -v mysql &> /dev/null; then
    echo "📊 MySQL check: Make sure MySQL is running and database 'clothheaven' exists"
    echo "💡 You can create it with: CREATE DATABASE clothheaven;"
fi

echo "🔨 Building and starting Spring Boot application..."
echo "🌐 Backend will be available at: http://localhost:8080"
echo "📚 API Documentation: http://localhost:8080/api"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the application
./mvnw spring-boot:run
