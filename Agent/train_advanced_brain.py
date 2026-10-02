import pickle
import joblib
from sklearn.ensemble import RandomForestClassifier
import numpy as np

print("=== INITIATING ADVANCED AI MODEL TRAINING ===")

# Features: [Size_KB, Entropy, Is_Disguised, Path_Risk]
X_train = np.array([
    # SAFE FILES
    [150, 0.22, 0, 0], 
    [2048, 0.35, 0, 0], 
    [55, 0.15, 0, 1],  # Let's show it a safe file in a risky folder
    
    # MALICIOUS / RANSOMWARE 
    [5120, 0.99, 0, 1], 
    [5120, 0.99, 0, 0], # <-- THE FIX: A zero-day in a safe folder
    [150, 0.98, 1, 1],  
    [2048, 0.99, 1, 0]  # Another zero-day in a safe folder 
])

# Labels (0 = Safe, 1 = Malicious)
y_train = np.array([0, 0, 0, 1, 1, 1, 1])

print("[+] Training 4-Dimensional Random Forest Classifier...")
model = RandomForestClassifier(n_estimators=10, random_state=42)
model.fit(X_train, y_train)

joblib.dump(model, 'brain_model.pkl')
print("[SUCCESS] Advanced 'brain_model.pkl' created! The agent is now much smarter.")