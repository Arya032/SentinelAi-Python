import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier

print("------------------------------------------------")
print("   THE BRAIN: Training Neural Network...        ")
print("------------------------------------------------")

# 1. CREATE TRAINING DATA (The "Textbook")
# In the real world, this would be thousands of files.
# For now, we teach it simple rules:
# Format: [File Size (KB), Internet Usage (0=No, 1=Yes), Weird Name (0=No, 1=Yes)]

# Features (The inputs)
X_train = [
    [200, 0, 0],   # Small file, No internet, Normal name -> SAFE
    [500, 0, 0],   # Medium file, No internet, Normal name -> SAFE
    [10000, 1, 1], # Huge file, Uses internet, Weird name -> VIRUS
    [250, 1, 1],   # Small file, Uses internet, Weird name -> VIRUS
    [300, 0, 0],   # Normal -> SAFE
    [12000, 1, 1]  # Suspicious -> VIRUS
]

# Labels (The answers): 0 = Safe, 1 = Virus
y_train = [0, 0, 1, 1, 0, 1]

# 2. BUILD THE MODEL
# We use a "Random Forest" (A robust AI algorithm)
clf = RandomForestClassifier(n_estimators=10)

# 3. TRAIN (Teach the Brain)
clf.fit(X_train, y_train)

# 4. SAVE THE INTELLIGENCE
# We save the trained model to src/ml/models/brain_model.pkl
models_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(models_dir, exist_ok=True)
model_path = os.path.join(models_dir, "brain_model.pkl")

joblib.dump(clf, model_path)

print(f"SUCCESS: Brain trained and saved to '{model_path}'")