#!/bin/bash

echo "🚀 Setting up LM Studio React Chat..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
    echo ""
    echo "🎯 Starting development server..."
    echo "The app will be available at http://localhost:3000"
    echo ""
    echo "📋 Quick setup:"
    echo "1. Make sure LM Studio is running on port 1234"
    echo "2. Load your model in LM Studio"
    echo "3. Copy the exact model name"
    echo "4. Paste it in the chat app's model field"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    
    npm run dev
else
    echo "❌ Failed to install dependencies"
    echo "Try running: npm install"
    exit 1
fi
