@echo off
:: =============================================================================
::  SENTINELAI — UNINSTALLER
::  Run as Administrator
:: =============================================================================

title SentinelAI Uninstaller
color 0C
cls

echo.
echo ============================================================
echo   SENTINELAI -- UNINSTALLING
echo ============================================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] Please run as Administrator.
    pause
    exit /b 1
)

echo [1/4] Stopping SentinelAI service...
sc stop SentinelAIEDR >nul 2>&1
timeout /t 3 /nobreak >nul
echo [OK] Service stopped.

echo [2/4] Removing Windows Service...
set "INSTALL_DIR=%ProgramFiles%\SentinelAI"
if exist "%INSTALL_DIR%\sentinelai_service.py" (
    cd /d "%INSTALL_DIR%"
    python sentinelai_service.py remove >nul 2>&1
)
sc delete SentinelAIEDR >nul 2>&1
echo [OK] Service removed.

echo [3/4] Removing scheduled tasks...
schtasks /delete /tn "AryaShieldEDR" /f >nul 2>&1
echo [OK] Scheduled tasks cleared.

echo [4/4] Removing files...
if exist "%INSTALL_DIR%" (
    rmdir /S /Q "%INSTALL_DIR%"
    echo [OK] Files removed from %INSTALL_DIR%
)

echo.
echo ============================================================
echo   SENTINELAI UNINSTALLED SUCCESSFULLY
echo   Your system is no longer being monitored by SentinelAI.
echo ============================================================
echo.
pause
