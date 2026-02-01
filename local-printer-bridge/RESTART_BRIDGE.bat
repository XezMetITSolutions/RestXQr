@echo off
TITLE RestXQr Printer Bridge Restarter
SET PORT=3005

:: Calisma dizinini bu dosyanin oldugu yer yap
cd /d "%~dp0"

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

:: Node.js kontrolü
node -v >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ HATA: Node.js yuklu degil veya PATH'e eklenmemis!
    pause
    exit /b
)

echo 🚀 Bridge baslatiliyor (server.js)...
echo.

:: Bridge'i baslat
node server.js

if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Bridge calisirken bir hata olustu!
)

pause

