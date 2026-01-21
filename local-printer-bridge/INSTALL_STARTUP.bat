@echo off
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_BATCH=%~dp0START_BRIDGE.bat"
set "SHORTCUT_BATCH=%STARTUP_FOLDER%\RestXQR_Printer_Bridge.bat"

echo Installing RestXQR Printer Bridge to Startup Folder...
echo.
echo Target: %TARGET_BATCH%
echo Startup: %SHORTCUT_BATCH%
echo.

(
echo @echo off
echo cd /d "%~dp0"
echo start "" "node" "server.js"
) > "%SHORTCUT_BATCH%"

echo ✅ Installation Complete!
echo The printer bridge will now start automatically when you log in.
echo.
echo You can see it in your Startup folder here:
echo %STARTUP_FOLDER%
echo.
pause
