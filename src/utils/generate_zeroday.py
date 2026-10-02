import os
import time

print("[RED TEAM] Spawning an unknown, high-entropy Zero-Day payload...")
time.sleep(1)

# This creates a 5MB file filled with pure, random bytes. 
# Traditional AV ignores this. Our ML model will flag the high entropy.
filepath = "stealth_payload.bin"
with open(filepath, "wb") as f:
    f.write(os.urandom(5 * 1024 * 1024)) 

print(f"[RED TEAM] Payload dropped: {filepath}")