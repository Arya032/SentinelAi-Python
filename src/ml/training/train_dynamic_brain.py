import os
import math
import numpy as np
import joblib
from sklearn.ensemble import RandomForestClassifier

# --- 1. FEATURE EXTRACTION ENGINE ---
def calculate_entropy(filepath):
    try:
        with open(filepath, 'rb') as f:
            data = f.read(10240)
        if not data: return 0.0
        entropy = 0
        for x in range(256):
            p_x = float(data.count(x)) / len(data)
            if p_x > 0:
                entropy += - p_x * math.log(p_x, 2)
        return entropy
    except:
        return 0.0

def get_features(filepath):
    try: size_kb = os.path.getsize(filepath) / 1024.0
    except: size_kb = 0.0
    entropy = calculate_entropy(filepath)
    is_disguised = 0
    try:
        with open(filepath, 'rb') as f:
            header = f.read(2)
            if header == b'MZ' and not filepath.lower().endswith(('.exe', '.dll')):
                is_disguised = 1
    except: pass
    
    # Simulate path risk for training variety
    path_risk = 1 if "malware" in filepath.lower() else 0
    return [size_kb, entropy, is_disguised, path_risk]

# --- 2. BATCH DATA COLLECTION ---
X_train = []
y_train = []
agent_folder = os.path.abspath(".")
safe_dir = os.path.join(agent_folder, "training_data", "safe")
malware_dir = os.path.join(agent_folder, "training_data", "malware")

print("=== EXTRACTING FEATURES FROM FILES ===")

# Process Safe Files (Label 0)
if os.path.exists(safe_dir):
    for filename in os.listdir(safe_dir):
        filepath = os.path.join(safe_dir, filename)
        if os.path.isfile(filepath):
            X_train.append(get_features(filepath))
            y_train.append(0)
            print(f"[SAFE] Extracted DNA: {filename}")

# Process Malware Files (Label 1)
if os.path.exists(malware_dir):
    for filename in os.listdir(malware_dir):
        filepath = os.path.join(malware_dir, filename)
        if os.path.isfile(filepath):
            X_train.append(get_features(filepath))
            y_train.append(1)
            print(f"[MALWARE] Extracted DNA: {filename}")

# --- 3. ALGORITHM TRAINING ---
if len(X_train) > 0:
    print(f"\n[+] Training Random Forest on {len(X_train)} files...")
    # Increased n_estimators to 50 for a smarter, more complex decision tree
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(np.array(X_train), np.array(y_train))

    joblib.dump(model, 'brain_model.pkl')
    print("[SUCCESS] Dynamic 'brain_model.pkl' created! The AI is updated.")
else:
    print("[!] Error: No files found in training_data folders.")