@echo off
setlocal
title MasApp Printer Bridge - Port Fixer

echo ======================================================
echo    MasApp Printer Bridge - Port Temizleyici
echo ======================================================
echo.

echo [1/2] Port 3005 kontrol ediliyor...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3005 ^| findstr LISTENING') do (
    echo.
    echo [BILGI] Port 3005 su an mesgul (PID: %%a). 
    echo Eski surec sonlandiriliyor...
    taskkill /f /pid %%a
    echo [OK] Eski surec kapatildi.
)

if %errorlevel% neq 0 (
    echo [OK] Port 3005 zaten temiz.
)

echo.
echo [2/2] Bridge yeniden baslatiliyor...
timeout /t 2 >nul

cd /d "%~dp0"
start node server.js

echo.
echo ======================================================
echo    BRIDGE BASLATILDI! 
echo    Lutfen bu pencereyi kapatin ama 
echo    acilan siyah "node" penceresini ACIK tutun.
echo ======================================================
echo.

pause
