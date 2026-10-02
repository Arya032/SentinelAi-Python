import ctypes
import sys
import subprocess
import datetime
import time

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def run_powershell(cmd):
    try:
        # Run command and hide window
        subprocess.run(["powershell", "-Command", cmd], check=True, creationflags=subprocess.CREATE_NO_WINDOW)
        return True
    except:
        return False

def force_enable_services():
    print("🔧 DIAGNOSTIC: Attempting to wake up Windows Backup Services...")
    
    # 1. Enable Volume Shadow Copy Service (VSS)
    try:
        subprocess.run("sc config vss start= demand", shell=True, check=True)
        subprocess.run("net start vss", shell=True)
        print("   -> VSS Service Started.")
    except:
        print("   -> (VSS might already be running)")

    # 2. Enable System Restore on C: Drive
    print("🔧 CONFIGURING: Turning on System Protection for C:...")
    if run_powershell('Enable-ComputerRestore -Drive "C:\"'):
        print("   -> System Protection Enabled.")
        return True
    else:
        print("❌ ERROR: Failed to enable System Protection.")
        return False

def create_restore_point():
    # 0. Admin Check
    if not is_admin():
        print("⚠️  Requesting Admin Privileges...")
        ctypes.windll.shell32.ShellExecuteW(None, "runas", sys.executable, " ".join(sys.argv), None, 1)
        sys.exit()

    print("------------------------------------------------")
    print("   ARYA'S RANSOMWARE ROLLBACK ENGINE            ")
    print("------------------------------------------------")

    # 1. First Try
    print("⏳ Attempting to create 'AryaShield Safety Snapshot'...")
    cmd = 'Checkpoint-Computer -Description "AryaShield_PreGuard" -RestorePointType "MODIFY_SETTINGS"'
    
    if run_powershell(cmd):
        print(f"✅ SUCCESS: Snapshot Created! (Your system is rollback-ready)")
        return
    
    # 2. If Failed, run the FIX
    print("⚠️  Snapshot Failed. Analyzing...")
    force_enable_services()
    
    # 3. Retry after fix
    print("🔄 Retrying Snapshot in 3 seconds...")
    time.sleep(3)
    if run_powershell(cmd):
        print(f"✅ SUCCESS: Snapshot Created! (Auto-Fix Worked)")
    else:
        print("❌ CRITICAL FAILURE: Windows is blocking the snapshot.")
        print("   Manual Fix: Open 'Create a Restore Point' in Windows Start Menu -> Click Configure -> Turn on System Protection.")

if __name__ == "__main__":
    create_restore_point()
    input("\nPress Enter to exit...")