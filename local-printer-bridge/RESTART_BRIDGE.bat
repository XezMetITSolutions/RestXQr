@echo off
TITLE RestXQr Printer Bridge Restarter
SET PORT=3005

echo --------------------------------------------------
echo 🔄 RestXQr Printer Bridge Yeniden Baslatiliyor...
echo --------------------------------------------------

:: Portu kullanan islemi bul ve sonlandir
echo 🔍 Port %PORT% kontrol ediliyor...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%PORT% ^| findstr LISTENING') do (
    echo 🔪 Port %PORT% kullanan islem bulundu (PID: %%a). Kapatiliyor...
    taskkill /F /PID %%a >nul 2>&1
)

echo ✅ Eski islemler temizlendi.
echo 🚀 Bridge baslatiliyor...
echo.

:: Bridge'i baslat
node server.js

pause
