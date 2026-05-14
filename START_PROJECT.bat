@echo off
title Micro-Loan Worthiness System
color 0A

echo ========================================
echo   MICRO-LOAN WORTHINESS SYSTEM
echo   Starting Backend + Frontend
echo ========================================
echo.

:: Check if running as admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Please run this file as Administrator
    echo Right-click START_PROJECT.bat and select Run as administrator
    pause
    exit
)

echo [1/3] Activating Python environment...
cd /d "C:\Projects\Micro-Loan Worthiness System"
call venv\Scripts\activate.bat

echo [2/3] Starting FastAPI Backend...
start cmd /k "cd /d C:\Projects\Micro-Loan Worthiness System && call venv\Scripts\activate.bat && python -m uvicorn backend.app.main:app --reload"

echo [3/3] Starting React Frontend...
start cmd /k "cd /d C:\Projects\Micro-Loan Worthiness System\frontend && npm start"

echo.
echo ========================================
echo   Both servers starting...
echo   Backend:  http://127.0.0.1:8000
echo   Frontend: http://localhost:3000
echo ========================================
pause