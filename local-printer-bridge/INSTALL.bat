@echo off
cd /d "%~dp0"
echo Installing dependencies for Local Printer Bridge...
npm install
echo.
echo Installation complete! You can now run start_bridge.bat
pause
