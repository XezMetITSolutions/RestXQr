@echo off
echo Installing Windows Service dependencies...
call npm install
echo.
echo Installing RestXQR Printer Bridge as a Service...
echo IMPORTANT: This requires Administrator privileges.
echo If it fails, right-click this file and select "Run as Administrator".
echo.
node service_install.js
pause
