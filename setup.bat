@echo off
REM Discipline Tracker - Setup Script for Windows

echo.
echo ================================
echo Discipline Tracker Setup for Windows
echo ================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%
echo.

REM Backend setup
echo 📦 Setting up backend...
cd backend
call npm install

REM Check if .env exists
if not exist .env (
    echo.
    echo ⚠️  Backend .env file not found!
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
    echo ⚠️  Please update backend\.env with your MongoDB connection string
)

cd ..

REM Frontend setup
echo.
echo 🎨 Setting up frontend...
cd frontend
call npm install

REM Check if .env exists
if not exist .env (
    echo.
    echo 📝 Creating .env file from .env.example...
    copy .env.example .env
)

cd ..

echo.
echo ================================
echo ✅ Setup Complete!
echo ================================
echo.
echo Next steps:
echo 1. Update backend\.env with MongoDB connection string
echo 2. Terminal 1: cd backend ^&^& npm run dev
echo 3. Terminal 2: cd frontend ^&^& npm run dev
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📖 For more info, see README.md or QUICKSTART.md
echo.
pause
