@echo off
cd /d "%~dp0"
echo Uninstalling RestXQR Printer Bridge Service...
echo IMPORTANT: This requires Administrator privileges.
echo If it fails, right-click this file and select "Run as Administrator".
echo.
node service_uninstall.js
pause
