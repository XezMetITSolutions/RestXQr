@echo off
title MasApp Local Printer Bridge - ULTIMATE SETUP (Stable Mode)

:: Start Setup
:START
cls
echo ======================================================
echo    MasApp Local Printer Bridge - Professional Setup
echo ======================================================
echo.

:: STEP 0: PORT CHECK
echo [STATUS] Checking Port 3005 usage...
set "port_found="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3005 ^| findstr LISTENING') do (
    set "port_found=1"
    set "pid=%%a"
)

if not defined port_found goto :PORT_FREE
echo [!] Port 3005 is currently occupied by PID: %pid%
echo     An older instance of the Bridge might be running.
goto :STEP1

:PORT_FREE
echo [OK] Port 3005 is FREE.

:STEP1
echo.
echo [STEP 1] Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is NOT installed!
    echo.
    echo 1. Opening https://nodejs.org/ for you...
    start https://nodejs.org/
    echo 2. Please install the LTS version.
    echo 3. Restart your PC after installation.
    echo.
    pause
    goto :START
)
echo [OK] Node.js is installed. Version: 
node -v

:STEP2
echo.
set "do_install="
set /p "do_install=Do you want to (RE)INSTALL dependencies? (Y/N): "
if /i "%do_install%" neq "Y" goto :STEP3
echo.
echo [STEP 2] Installing/Updating modules (npm install)...
echo Please wait, this may take a few minutes...
call npm install
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed. Please check internet connection!
    pause
) else (
    echo [OK] Modules installed successfully.
)

:STEP3
echo.
if not defined port_found goto :STEP4
set "kill_port="
set /p "kill_port=Port 3005 is busy. Kill existing process (PID %pid%)? (Y/N): "
if /i "%kill_port%" neq "Y" goto :STEP4
taskkill /f /pid %pid%
if %errorlevel% eq 0 (
    echo [OK] Process terminated.
) else (
    echo [ERROR] Failed to kill process. You might need to run as Admin.
)

:STEP4
echo.
set "do_startup="
set /p "do_startup=Add to Windows Startup (Auto-run on PC start)? (Y/N): "
if /i "%do_startup%" neq "Y" goto :STEP5
echo.
echo [STEP 4] Configuring Startup...
set "STARTUP_FOLDER=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
set "TARGET_BATCH=%~dp0START_BRIDGE.bat"
set "VBS_SCRIPT=%STARTUP_FOLDER%\Launcher_RestXQR.vbs"

echo Creating startup script at: "%VBS_SCRIPT%"
echo Set WshShell = CreateObject("WScript.Shell") > "%VBS_SCRIPT%"
echo WshShell.Run chr(34) ^& "%TARGET_BATCH%" ^& chr(34), 0 >> "%VBS_SCRIPT%"
echo Set WshShell = Nothing >> "%VBS_SCRIPT%"

if exist "%VBS_SCRIPT%" (
    echo [OK] Startup launcher created successfully.
) else (
    echo [ERROR] Failed to create startup script. Access denied?
)

:STEP5
echo.
set "do_start="
set /p "do_start=Do you want to START the Bridge now? (Y/N): "
if /i "%do_start%" neq "Y" goto :FINISH
echo.
echo Launching Bridge in background...
start "" "%~dp0START_BRIDGE.bat"
echo [OK] Bridge has been started.

:FINISH
echo.
echo ======================================================
echo    Setup process finished.
echo ======================================================
echo.
echo Press any key to go back to main menu or close this window.
pause
goto :START
