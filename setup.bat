@echo off
echo ================================
echo Frontend Setup Script
echo ================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [2/3] Creating environment file...
if not exist .env.local (
    copy .env.local.example .env.local
    echo .env.local file created
) else (
    echo .env.local already exists
)

echo [3/3] Setup complete!
echo.
echo ================================
echo Next Steps:
echo ================================
echo 1. Make sure backend is running at http://localhost:8000
echo 2. Start the development server: npm run dev
echo 3. Visit: http://localhost:3000
echo ================================
pause
