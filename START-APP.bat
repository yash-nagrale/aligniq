@echo off
title AlignIQ - Starting...
color 0B

echo.
echo  =====================================================
echo   AlignIQ - Starting Development Server
echo  =====================================================
echo.

REM Check Node is available
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo  [!] Node.js not found. Please run SETUP.bat first.
    pause
    exit /b 1
)

REM Check node_modules exist
IF NOT EXIST "node_modules" (
    echo  [!] Dependencies not installed. Running setup first...
    echo.
    call npm install
)

echo  [OK] Starting server on http://localhost:3000
echo.
echo  Press Ctrl+C to stop the server.
echo.

REM Open browser after 3 seconds in background
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:3000"

REM Start the dev server
npm run dev
