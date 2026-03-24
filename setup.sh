#!/bin/bash

# Discipline Tracker - Setup Script for macOS/Linux

echo "================================"
echo "Discipline Tracker Setup"
echo "================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "⚠️  Backend .env file not found!"
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your MongoDB connection string"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up frontend..."
cd frontend
npm install

# Check if .env exists
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file from .env.example..."
    cp .env.example .env
fi

cd ..

echo ""
echo "================================"
echo "✅ Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Update backend/.env with MongoDB connection string"
echo "2. Terminal 1: cd backend && npm run dev"
echo "3. Terminal 2: cd frontend && npm run dev"
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "📖 For more info, see README.md or QUICKSTART.md"
