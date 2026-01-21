@echo off
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_BATCH=%~dp0START_BRIDGE.bat"
echo Installing RestXQR Printer Bridge to Startup Folder (Silent Mode)...
echo.
echo Target: %TARGET_BATCH%
echo Startup Script: %VBS_SCRIPT%
echo.

(
echo Set WshShell = CreateObject^("WScript.Shell"^) 
echo WshShell.Run chr^(34^) ^& "%TARGET_BATCH%" ^& chr^(34^), 0
echo Set WshShell = Nothing
) > "%VBS_SCRIPT%"

echo ✅ Installation Complete!
echo The printer bridge will now start SILENTLY (invisible) when you log in.
echo.
echo You can see the launcher here:
echo %STARTUP_FOLDER%
echo.
pause
