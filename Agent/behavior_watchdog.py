import psutil
import time
from plyer import notification
import datetime

# A list of normal programs that should NEVER be allowed to secretly 
# spawn command lines or hacking tools in a normal MSME business environment.
SUSPICIOUS_PARENTS = ['winword.exe', 'excel.exe', 'powerpnt.exe', 'acrobat.exe', 'chrome.exe']

# The tools hackers use to execute fileless malware or encrypt drives
DANGEROUS_CHILDREN = ['cmd.exe', 'powershell.exe', 'wscript.exe', 'cscript.exe', 'vssadmin.exe']

def kill_process_tree(pid, process_name):
    """Terminates a malicious process and alerts the system."""
    try:
        parent = psutil.Process(pid)
        for child in parent.children(recursive=True):
            child.kill()
        parent.kill()
        
        timestamp = datetime.datetime.now().strftime("%H:%M:%S")
        print(f"\n[{timestamp}] 🚨 [THREAT NEUTRALIZED] Killed malicious process: {process_name} (PID: {pid})", flush=True)
        
        # --- NEW: PUSH ALERT TO ANTIGRAVITY CLOUD ---
        try:
            import requests
            # Pointing directly to our local Antigravity Server
            url = "http://127.0.0.1:5000/api/alerts" 
            payload = {
                'endpoint': 'ARYA-DESKTOP',
                'threat': process_name,
                'type': 'Behavioral Block',
                'timestamp': timestamp,
                'status': 'SECURED'
            }
            # Remove the '#' so it actually sends the data!
            requests.post(url, json=payload, timeout=3)
            print("[CLOUD] Alert pushed to Antigravity telemetry.", flush=True)
        except Exception as e:
            print(f"[CLOUD] Failed to push alert: {e}", flush=True)
        # ------------------------------------------

        # Pop-up Windows Notification
        notification.notify(
            title="Sentinel-AI: Behavior Blocked",
            message=f"Terminated unauthorized process injection from {process_name}.",
            app_name="Sentinel EDR",
            timeout=5
        )
    except psutil.NoSuchProcess:
        pass
    except Exception as e:
        print(f"[ERROR] Could not terminate process: {e}")

def monitor_behavior():
    """Continuously scans running RAM processes for malicious behavior patterns."""
    # Keep track of processes we've already checked to save CPU
    scanned_pids = set()
    
    while True:
        try:
            # Iterate through all currently running processes
            for proc in psutil.process_iter(['pid', 'name']):
                pid = proc.info['pid']
                name = str(proc.info['name']).lower()
                
                # Skip if we already checked it and it's safe
                if pid in scanned_pids:
                    continue
                
                # Rule 1: Prevent Volume Shadow Copy Deletion (Ransomware behavior)
                if name == 'vssadmin.exe':
                    cmdline = proc.cmdline()
                    if cmdline and 'delete' in [arg.lower() for arg in cmdline] and 'shadows' in [arg.lower() for arg in cmdline]:
                        print("\n[!] RANSOMWARE BEHAVIOR DETECTED: Attempted backup deletion.")
                        kill_process_tree(pid, name)
                        continue

                # Rule 2: Prevent Fileless Malware (Office -> PowerShell injection)
                if name in DANGEROUS_CHILDREN:
                    try:
                        parent = proc.parent()
                        if parent:
                            parent_name = parent.name().lower()
                            if parent_name in SUSPICIOUS_PARENTS:
                                print(f"\n[!] INJECTION DETECTED: {parent_name} secretly spawned {name}!")
                                kill_process_tree(parent.pid, parent_name)
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
                
                # Add to cache so we don't scan it again
                scanned_pids.add(pid)
                
            # Rest for 2 seconds to keep CPU usage low
            time.sleep(2) 
            
        except Exception as e:
            time.sleep(2)

if __name__ == "__main__":
    monitor_behavior()