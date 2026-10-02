import ctypes
import sys
import subprocess
import datetime

def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def create_restore_point():
    if not is_admin():
        print("❌ ERROR: Access Denied. You must run this as Administrator.")
        return False

    print("⏳ Creating 'AryaShield Safety Snapshot'... (This may take 10-20 seconds)")
    
    # We use PowerShell to trigger a Windows System Restore Point
    cmd = 'Checkpoint-Computer -Description "AryaShield_PreGuard" -RestorePointType "MODIFY_SETTINGS"'
    
    try:
        # Run PowerShell command
        subprocess.run(["powershell", "-Command", cmd], check=True)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"✅ SUCCESS: Safety Snapshot created at {timestamp}")
        return True
    except subprocess.CalledProcessError:
        print("⚠️ FAILED: Could not create restore point.")
        print("Make sure 'System Protection' is turned ON for your C: Drive.")
        return False

if __name__ == "__main__":
    create_restore_point()
    input("Press Enter to exit...")