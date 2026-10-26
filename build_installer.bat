@echo off
:: =============================================================================
::  SENTINELAI — BUILD SCRIPT
::  Builds SentinelAI-Setup.exe — the installer you upload to your website
::
::  Requirements (install once):
::    1. Python from python.org (NOT Microsoft Store)
::    2. Inno Setup 6 from https://jrsoftware.org/isdl.php
::
::  Run this script from the project root.
::  Output: dist\installer\SentinelAI-Setup.exe
:: =============================================================================

title Building SentinelAI Installer
color 0B
cls
echo.
echo  ============================================================
echo    SENTINELAI — BUILD SYSTEM
echo    Building professional installer...
echo  ============================================================
echo.

:: ── Step 1: Install Python packages ──────────────────────────────────────────
echo  [1/4] Installing build dependencies...
pip install pyinstaller psutil pefile requests plyer pystray pillow joblib scikit-learn pywin32 --quiet
echo  [OK] Dependencies ready.

:: ── Step 2: Build standalone exe with PyInstaller ────────────────────────────
echo.
echo  [2/4] Building SentinelAI.exe (this takes 2-3 minutes)...
python -m PyInstaller sentinelai_build.spec --clean --noconfirm
if %errorLevel% neq 0 (
    echo  [ERROR] PyInstaller build failed. Check the output above.
    pause
    exit /b 1
)
echo  [OK] SentinelAI.exe built successfully.

:: ── Step 3: Build installer with Inno Setup ───────────────────────────────────
echo.
echo  [3/4] Building SentinelAI-Setup.exe installer...
mkdir dist\installer 2>nul

:: Find Inno Setup
set "ISCC="
for %%P in (
    "C:\Program Files (x86)\Inno Setup 6\ISCC.exe"
    "C:\Program Files\Inno Setup 6\ISCC.exe"
    "C:\Program Files (x86)\Inno Setup 5\ISCC.exe"
) do (
    if exist %%P (
        set "ISCC=%%~P"
        goto :found_iscc
    )
)

echo  [WARN] Inno Setup not found.
echo  Download from: https://jrsoftware.org/isdl.php
echo  Then run this script again.
echo.
echo  For now, your PyInstaller exe is ready at: dist\SentinelAI\SentinelAI.exe
echo  You can distribute that folder directly too.
goto :done

:found_iscc
"%ISCC%" installer.iss
if %errorLevel% neq 0 (
    echo  [ERROR] Inno Setup build failed.
    pause
    exit /b 1
)

:done
:: ── Step 4: Done ──────────────────────────────────────────────────────────────
echo.
echo  [4/4] Build complete!
echo.
echo  ============================================================
echo    OUTPUT FILES
echo  ============================================================
echo.
if exist "dist\installer\SentinelAI-Setup.exe" (
    echo  [*] INSTALLER:  dist\installer\SentinelAI-Setup.exe
    echo      ^> Upload this to your website for users to download
    echo.
)
echo  [*] RAW BUILD:  dist\SentinelAI\SentinelAI.exe
echo      ^> Standalone exe (needs dist\SentinelAI\ folder alongside it)
echo.
echo  ============================================================
pause
