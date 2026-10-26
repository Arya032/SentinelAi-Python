@echo off
:: =============================================================================
::  SENTINELAI — ONE-CLICK INSTALLER FOR ANY WINDOWS PC
::  Right-click this file and choose "Run as administrator"
:: =============================================================================

title SentinelAI Installer
color 0A
cls

echo.
echo  ============================================================
echo    SENTINELAI -- ENTERPRISE CYBER DEFENSE
echo    Version 1.0  ^|  AryaShield Technologies
echo  ============================================================
echo.

:: ── Step 0: Require Admin ────────────────────────────────────────────────────
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo  [ERROR] Administrator rights required.
    echo  Please right-click this file and choose "Run as administrator"
    echo.
    pause
    exit /b 1
)
echo  [OK] Running as Administrator.

:: ── Step 1: Check/Install Python ─────────────────────────────────────────────
echo.
echo  [1/6] Checking Python installation...

:: Prefer system Python over Store Python (Store Python can't register services)
set "PYTHON_EXE="
for %%P in (
    "C:\Python313\python.exe"
    "C:\Python312\python.exe"
    "C:\Python311\python.exe"
    "C:\Python310\python.exe"
    "C:\Program Files\Python313\python.exe"
    "C:\Program Files\Python312\python.exe"
    "C:\Program Files\Python311\python.exe"
    "C:\Program Files\Python310\python.exe"
) do (
    if exist %%P (
        set "PYTHON_EXE=%%~P"
        goto :found_python
    )
)

:install_python
echo  [INFO] System Python not found. Downloading Python 3.11 (system-wide install)...
powershell -Command "Invoke-WebRequest -Uri 'https://www.python.org/ftp/python/3.11.9/python-3.11.9-amd64.exe' -OutFile '%TEMP%\python_setup.exe' -UseBasicParsing"
if not exist "%TEMP%\python_setup.exe" (
    echo  [ERROR] Download failed. Check internet connection and try again.
    pause
    exit /b 1
)
"%TEMP%\python_setup.exe" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0 Include_pip=1
del "%TEMP%\python_setup.exe"
set "PYTHON_EXE=C:\Program Files\Python311\python.exe"
if not exist "%PYTHON_EXE%" set "PYTHON_EXE=C:\Python311\python.exe"
echo  [OK] Python 3.11 installed.

:found_python
echo  [OK] Using Python: %PYTHON_EXE%

:: ── Step 2: Install Python packages ──────────────────────────────────────────
echo.
echo  [2/6] Installing required packages (this may take a minute)...
"%PYTHON_EXE%" -m pip install --quiet --upgrade pip
"%PYTHON_EXE%" -m pip install --quiet psutil requests pefile joblib scikit-learn plyer pystray pillow pywin32
echo  [OK] All packages installed.

:: ── Step 3: Copy files to Program Files ───────────────────────────────────────
echo.
echo  [3/6] Installing SentinelAI to Program Files...
set "INSTALL_DIR=%ProgramFiles%\SentinelAI"
mkdir "%INSTALL_DIR%" 2>nul
xcopy /E /I /Y /Q "%~dp0src"                 "%INSTALL_DIR%\src"         >nul
copy  /Y          "%~dp0sentinelai_service.py" "%INSTALL_DIR%\"           >nul
copy  /Y          "%~dp0run_safe_mode.py"       "%INSTALL_DIR%\"          >nul
copy  /Y          "%~dp0recover_quarantine.py"  "%INSTALL_DIR%\"          >nul
if exist "%~dp0config" xcopy /E /I /Y /Q "%~dp0config" "%INSTALL_DIR%\config" >nul
mkdir "%INSTALL_DIR%\logs"       2>nul
mkdir "%INSTALL_DIR%\quarantine" 2>nul
mkdir "%INSTALL_DIR%\data"       2>nul
echo  [OK] Files installed to: %INSTALL_DIR%

:: ── Step 4: Register Windows Service ─────────────────────────────────────────
echo.
echo  [4/6] Registering Windows Service (runs at boot, no login needed)...

:: Remove old service if it exists
sc stop  SentinelAIEDR >nul 2>&1
sc delete SentinelAIEDR >nul 2>&1
timeout /t 2 /nobreak >nul

:: Register service using sc.exe directly with system Python
set "SERVICE_CMD="%PYTHON_EXE%" "%INSTALL_DIR%\sentinelai_service.py""
sc create SentinelAIEDR binPath= %SERVICE_CMD% start= auto DisplayName= "SentinelAI - Enterprise Cyber Defense"
if %errorLevel% neq 0 (
    echo  [ERROR] Service registration failed.
    echo  Make sure you are running as Administrator.
    pause
    exit /b 1
)
echo  [OK] Windows Service registered.

:: ── Step 5: Configure service reliability ────────────────────────────────────
echo.
echo  [5/6] Configuring auto-start and fault recovery...
sc description SentinelAIEDR "AryaShield AI-powered zero-day threat detection. 13 behavioral detection modules. Starts at boot without login."
sc failure     SentinelAIEDR reset= 86400 actions= restart/5000/restart/10000/restart/30000
echo  [OK] Service will restart automatically if it ever crashes.

:: ── Step 6: Start the service now ────────────────────────────────────────────
echo.
echo  [6/6] Starting SentinelAI protection now...
sc start SentinelAIEDR
timeout /t 4 /nobreak >nul
sc query SentinelAIEDR | findstr "RUNNING" >nul
if %errorLevel% equ 0 (
    echo  [OK] SentinelAI is RUNNING and protecting this PC.
) else (
    echo  [WARN] Service is starting up. May take a few seconds.
    echo  Check status with: sc query SentinelAIEDR
)

:: ── Done ──────────────────────────────────────────────────────────────────────
echo.
echo  ============================================================
echo    INSTALLATION COMPLETE
echo  ============================================================
echo.
echo    SentinelAI is now active on this PC:
echo.
echo    [*] Protecting your PC RIGHT NOW
echo    [*] Auto-starts at every Windows BOOT (no login needed)
echo    [*] 13 detection modules: files, processes, network,
echo        memory, registry, ransomware canaries, and more
echo    [*] Restarts automatically if it ever crashes
echo    [*] Logs saved to: %INSTALL_DIR%\logs\service.log
echo.
echo    To check status:  sc query SentinelAIEDR
echo    To stop:          sc stop SentinelAIEDR
echo    To view logs:     notepad "%INSTALL_DIR%\logs\service.log"
echo    To uninstall:     run uninstall.bat as Administrator
echo.
pause
