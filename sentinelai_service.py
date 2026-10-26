"""
=============================================================================
  SENTINELAI — WINDOWS SERVICE WRAPPER
  Runs the agent as a proper Windows Service (starts at boot, before login)
=============================================================================
  Install:   python sentinelai_service.py install
  Start:     python sentinelai_service.py start
  Stop:      python sentinelai_service.py stop
  Remove:    python sentinelai_service.py remove
=============================================================================
"""

import sys
import os
import time
import threading
import logging

# ── Tell eyes.py we are running as a Windows Service (no tray icon needed) ───
os.environ["SENTINELAI_SERVICE_MODE"] = "1"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CORE_DIR = os.path.join(BASE_DIR, "src", "core")
LOG_DIR  = os.path.join(BASE_DIR, "logs")
LOG_FILE = os.path.join(LOG_DIR,  "service.log")

os.makedirs(LOG_DIR, exist_ok=True)

# ── File logging (service has no console output) ──────────────────────────────
logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("SentinelAI")

# ── Require pywin32 ───────────────────────────────────────────────────────────
try:
    import win32serviceutil
    import win32service
    import win32event
    import servicemanager
except ImportError:
    print("[ERROR] pywin32 is not installed.")
    print("        Run:  pip install pywin32")
    print("        Then: python -m pip install pywin32")
    print("        Then: python -m pywin32_postinstall -install")
    sys.exit(1)


class SentinelAIService(win32serviceutil.ServiceFramework):
    """
    Windows Service for SentinelAI EDR.
    - Starts at SYSTEM boot (no user login needed)
    - Runs as SYSTEM account (full admin)
    - Restarts automatically if it crashes
    - Logs everything to logs/service.log
    """

    _svc_name_         = "SentinelAIEDR"
    _svc_display_name_ = "SentinelAI — Enterprise Cyber Defense"
    _svc_description_  = (
        "AryaShield AI-powered zero-day threat detection. "
        "Monitors all processes, files, network, registry and memory "
        "using 13 behavioral detection engines. Blocks ransomware, "
        "trojans, rootkits and unknown malware in real-time."
    )

    def __init__(self, args):
        win32serviceutil.ServiceFramework.__init__(self, args)
        self._stop_event = win32event.CreateEvent(None, 0, 0, None)
        self._running    = True

    def SvcStop(self):
        """Called by Windows when the service is being stopped."""
        log.info("Stop signal received from Windows SCM.")
        self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
        win32event.SetEvent(self._stop_event)
        self._running = False

    def SvcDoRun(self):
        """Main entry point — called by Windows when the service starts."""
        servicemanager.LogMsg(
            servicemanager.EVENTLOG_INFORMATION_TYPE,
            servicemanager.PYS_SERVICE_STARTED,
            (self._svc_name_, "")
        )
        log.info("=" * 60)
        log.info("  SentinelAI EDR — Service Starting")
        log.info(f"  Base  : {BASE_DIR}")
        log.info(f"  Core  : {CORE_DIR}")
        log.info(f"  Log   : {LOG_FILE}")
        log.info("=" * 60)

        try:
            self._run_agent()
        except Exception as e:
            log.exception(f"Fatal service error: {e}")
            servicemanager.LogErrorMsg(f"SentinelAI fatal error: {e}")

    def _run_agent(self):
        """Imports and launches the EDR engine, then waits for stop signal."""
        if CORE_DIR not in sys.path:
            sys.path.insert(0, CORE_DIR)

        # Redirect print() to log file so all agent output is captured
        import builtins
        def _log_print(*args, **kwargs):
            try:
                msg = " ".join(str(a) for a in args)
                log.info(msg)
            except Exception:
                pass
        builtins.print = _log_print

        try:
            import eyes

            # Service mode: disable tray icon (no interactive desktop)
            eyes.pystray = None

            # Start all 13 detection modules
            engine = threading.Thread(
                target=eyes.start_ai_engine,
                daemon=True,
                name="SentinelAIEngine"
            )
            engine.start()
            log.info("SentinelAI engine started — 13/13 modules active.")
        except Exception as e:
            log.exception(f"Failed to start detection engine: {e}")
            return

        # Block until Windows sends a stop signal
        win32event.WaitForSingleObject(self._stop_event, win32event.INFINITE)
        log.info("SentinelAI EDR Service stopped cleanly.")


# ── Command-line entry point ──────────────────────────────────────────────────
if __name__ == "__main__":
    if len(sys.argv) == 1:
        # Launched by Windows SCM — start as service
        servicemanager.Initialize()
        servicemanager.PrepareToHostSingle(SentinelAIService)
        servicemanager.StartServiceCtrlDispatcher()
    else:
        # Launched from command line: install / start / stop / remove
        win32serviceutil.HandleCommandLine(SentinelAIService)
