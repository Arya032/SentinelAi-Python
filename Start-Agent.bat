@echo off
title SentinelAI - Starting...
color 0A

echo.
echo   ============================================================
echo    SENTINELAI -- ENTERPRISE CYBER DEFENSE
echo   ============================================================
echo.

REM Add SentinelAI to Windows Startup (no admin needed)
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup
set AGENT_EXE=%~dp0SentinelAI.exe

if not exist "%STARTUP%\SentinelAI_autostart.bat" (
    echo @echo off > "%STARTUP%\SentinelAI_autostart.bat"
    echo start /B "" "%AGENT_EXE%" >> "%STARTUP%\SentinelAI_autostart.bat"
    echo   [+] Added to Windows startup - SentinelAI will start automatically at every boot.
) else (
    echo   [+] Already set to start automatically at boot.
)

echo   [+] Starting SentinelAI protection...
echo.
start "" "%AGENT_EXE%"

timeout /t 2 /noisy >nul
echo   [+] SentinelAI is now running in the background.
echo.
echo   View your live dashboard at:
echo   https://arya032.github.io/SentinelAi-Website/dashboard.html
echo.
echo   (You can close this window - SentinelAI keeps running)
echo.
pause
