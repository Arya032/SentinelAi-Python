import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

print("========================================")
print("  SENTINEL-AI: NEURAL NETWORK TRAINING  ")
print("========================================")

# FEATURE COLUMNS: [size_kb, entropy, is_disguised, path_risk]
# TARGET: 0 = Safe, 1 = Malware

print("[1] Generating Training Data...")

# --- SAFE FILES (Normal Windows Apps & Documents) ---
# Usually lower entropy (4.0-6.0), never disguised (0), usually safe paths (0)
safe_data = [
    [1500.5, 5.2, 0, 0], # Normal Chrome.exe
    [200.0,  4.1, 0, 0], # Word Document
    [45.0,   3.5, 0, 1], # Text file in Downloads (Safe)
    [8000.0, 6.1, 0, 0], # Large video game file
    [12.5,   4.8, 0, 0], # Small config file
]
safe_labels = [0, 0, 0, 0, 0]

# --- MALICIOUS FILES (Ransomware, Trojans, Disguised Malware) ---
# Usually high entropy (7.0+ because they are encrypted), often disguised (1), often in risky paths (1)
malware_data = [
    [340.0,  7.8, 1, 1], # Encrypted ransomware disguised as PDF in Temp folder
    [15.0,   7.5, 0, 1], # Small packed trojan in Downloads
    [2048.0, 7.9, 1, 0], # Highly encrypted payload disguised as an image
    [55.0,   6.8, 1, 1], # Disguised executable hiding in AppData
    [1.5,    2.0, 0, 1], # Tiny downloader script in Temp
]
malware_labels = [1, 1, 1, 1, 1]

# Combine the data
X_train = np.array(safe_data + malware_data)
y_train = np.array(safe_labels + malware_labels)

print("[2] Initializing Random Forest Classifier...")
# We use Random Forest because it is highly accurate for heuristic data
brain = RandomForestClassifier(n_estimators=100, random_state=42)

print("[3] Training the AI Brain...")
brain.fit(X_train, y_train)

print("[4] Saving the Neural Network...")
joblib.dump(brain, "brain_model.pkl")

print("[SUCCESS] New 'brain_model.pkl' generated successfully!")
print("Your Agent is now armed with Heuristic Intelligence.")