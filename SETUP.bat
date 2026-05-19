@echo off
title AlignIQ Setup
color 0A

echo.
echo  =====================================================
echo   AlignIQ - Automated Setup for Windows
echo  =====================================================
echo.

REM ── Check if Node.js is installed ─────────────────────
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo  [!] Node.js is NOT installed.
    echo.
    echo  Please install it first:
    echo  1. Open your browser
    echo  2. Go to: https://nodejs.org
    echo  3. Click the big green "LTS" button to download
    echo  4. Run the installer ^(keep all defaults, click Next^)
    echo  5. Come back and double-click this file again
    echo.
    pause
    exit /b 1
)

echo  [OK] Node.js found: 
node --version

REM ── Install dependencies ───────────────────────────────
echo.
echo  [1/2] Installing packages... ^(this takes 1-2 minutes^)
echo.
call npm install

IF ERRORLEVEL 1 (
    echo.
    echo  [ERROR] npm install failed. 
    echo  Try running as Administrator ^(right-click → Run as administrator^)
    pause
    exit /b 1
)

echo.
echo  [OK] Packages installed!

REM ── Create .env.local if it doesn't exist ─────────────
IF NOT EXIST ".env.local" (
    echo  [2/2] Creating .env.local...
    copy .env.example .env.local >nul
    echo  [OK] .env.local created ^(demo mode - no keys needed^)
) ELSE (
    echo  [2/2] .env.local already exists - skipping
)

echo.
echo  =====================================================
echo   SETUP COMPLETE!
echo  =====================================================
echo.
echo  To start the app, run:  npm run dev
echo  Then open:              http://localhost:3000
echo.
echo  OR just double-click:   START-APP.bat
echo.
pause
