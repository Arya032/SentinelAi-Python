"""
=============================================================================
  SENTINELAI — MAIN ENTRY POINT
  This is what gets bundled into SentinelAI.exe by PyInstaller.

  Run modes:
    SentinelAI.exe                  → Normal mode (tray icon + protection)
    SentinelAI.exe --service        → Called by Windows Service Manager
    SentinelAI.exe --headless       → Protection only, no tray icon
=============================================================================
"""

import sys
import os
import time
import threading

# ── Fix path: find the bundled or source files ────────────────────────────────
if getattr(sys, 'frozen', False):
    # Running as PyInstaller .exe — files are extracted to _MEIPASS
    BASE_DIR = sys._MEIPASS
    INSTALL_DIR = os.path.dirname(sys.executable)
else:
    # Running as script
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    INSTALL_DIR = BASE_DIR

CORE_DIR = os.path.join(BASE_DIR, "src", "core")
if CORE_DIR not in sys.path:
    sys.path.insert(0, CORE_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# ── Logging for service/headless mode ─────────────────────────────────────────
import logging
LOG_DIR  = os.path.join(INSTALL_DIR, "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "sentinelai.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("SentinelAI")


def run_protection(headless=False):
    """Starts all 13 protection modules. Blocks until process exits."""
    log.info("Starting SentinelAI protection engine...")
    print("[SentinelAI] Starting protection engine...")

    if headless:
        os.environ["SENTINELAI_SERVICE_MODE"] = "1"

    try:
        import eyes
        if headless:
            eyes.pystray = None

        engine = threading.Thread(
            target=eyes.start_ai_engine,
            daemon=True,
            name="SentinelAIEngine"
        )
        engine.start()
        log.info("All 13 detection modules active.")
        print("[SentinelAI] All 13 modules active. System protected.")

        if headless:
            # Keep process alive until killed by SCM or system shutdown
            while True:
                time.sleep(60)
                log.info("SentinelAI heartbeat — system protected.")
        else:
            # Normal mode: tray icon keeps the process alive
            import eyes as e
            if e.pystray:
                pass  # pystray.icon.run() is blocking
            else:
                while True:
                    time.sleep(60)

    except Exception as ex:
        log.exception(f"Engine failed: {ex}")
        print(f"[ERROR] Engine failed: {ex}")


def install_service():
    """
    Registers SentinelAI.exe as a Windows Service.
    Called by the Inno Setup installer with admin rights.
    """
    exe_path = sys.executable
    log.info(f"Installing Windows Service. Exe: {exe_path}")

    import subprocess
    result = subprocess.run([
        "sc.exe", "create", "SentinelAIEDR",
        "binPath=", f'"{exe_path}" --service',
        "start=", "auto",
        "DisplayName=", "SentinelAI - Enterprise Cyber Defense"
    ], capture_output=True, text=True)

    subprocess.run([
        "sc.exe", "description", "SentinelAIEDR",
        "AryaShield AI-powered zero-day threat detection. 13 behavioral modules. Starts at boot."
    ], capture_output=True)

    subprocess.run([
        "sc.exe", "failure", "SentinelAIEDR",
        "reset=", "86400", "actions=", "restart/5000/restart/10000/restart/30000"
    ], capture_output=True)

    if result.returncode == 0:
        log.info("Service installed successfully.")
        print("[OK] SentinelAI Windows Service installed.")
    else:
        log.error(f"Service install failed: {result.stderr}")
        print(f"[ERROR] {result.stderr}")

    return result.returncode


def remove_service():
    """Removes the Windows Service. Called by uninstaller."""
    import subprocess
    subprocess.run(["sc.exe", "stop",   "SentinelAIEDR"], capture_output=True)
    subprocess.run(["sc.exe", "delete", "SentinelAIEDR"], capture_output=True)
    log.info("Service removed.")
    print("[OK] SentinelAI Windows Service removed.")


# ── Main dispatch ─────────────────────────────────────────────────────────────
if __name__ == "__main__":
    args = sys.argv[1:]

    if "--service" in args:
        # Called by Windows Service Control Manager — run headless forever
        log.info("Starting in Windows Service mode.")
        run_protection(headless=True)

    elif "--install-service" in args:
        # Called by installer with admin rights
        code = install_service()
        sys.exit(code)

    elif "--remove-service" in args:
        # Called by uninstaller
        remove_service()
        sys.exit(0)

    elif "--headless" in args:
        # Protection with no tray icon (for advanced users)
        run_protection(headless=True)

    else:
        # Normal user-facing mode with tray icon
        run_protection(headless=False)
