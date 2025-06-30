#!/bin/bash

echo "🚀 Starting GST Invoice Generator Application..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Please ensure MongoDB is installed and running."
    echo "   You can use MongoDB Atlas as an alternative."
fi

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd client
npm install
cd ..

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp config.env .env
    echo "✅ .env file created. Please update it with your configuration."
fi

# Start the application
echo "🎯 Starting the application..."
echo "   Backend will run on: http://localhost:5000"
echo "   Frontend will run on: http://localhost:3000"
echo ""
echo "📋 Available commands:"
echo "   npm run dev     - Start both frontend and backend"
echo "   npm run server  - Start only backend"
echo "   npm run client  - Start only frontend"
echo ""

npm run dev 