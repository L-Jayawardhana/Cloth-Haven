#!/bin/bash

echo "🚀 Starting Cloth Haven Frontend..."
echo "📁 Directory: $(pwd)/frontend"
echo "🔧 Using npm..."

cd frontend

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "Please install Node.js 18 or higher"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Please install Node.js 18 or higher"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Starting React development server..."
echo "🌐 Frontend will be available at: http://localhost:5173"
echo "📚 Backend API should be running at: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev
