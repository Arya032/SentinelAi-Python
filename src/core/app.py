import os
import json
import requests
import platform
import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

FIREBASE_DB_URL = "https://studio-167261963-da656-default-rtdb.firebaseio.com"

def push_threat_to_cloud(threat_type, details, target_filepath=""):
    payload = {
        "hostname": platform.node(),
        "timestamp": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "threat_type": threat_type,
        "details": details,
        "file_name": os.path.basename(target_filepath) if target_filepath else "In-Memory / Script",
        "action_taken": "Terminated & Quarantined",
        "status": "Blocked"
    }

    # 1. Primary: Push directly to Firebase Realtime Database (for external pilot test)
    try:
        requests.post(f"{FIREBASE_DB_URL}/threats.json", json=payload, timeout=3)
    except Exception:
        pass

    # 2. Secondary: Fallback to local dev server if running on your machine
    try:
        requests.post("http://127.0.0.1:5000/api/threats", json=payload, timeout=1)
    except Exception:
        pass

app = Flask(__name__)
CORS(app) 

DB_FILE = os.path.join(DATA_DIR, "cloud_threat_logs.json")
STATUS_FILE = os.path.join(DATA_DIR, "system_status.json")

if not os.path.exists(DB_FILE):
    with open(DB_FILE, "w") as f:
        json.dump([], f)

@app.route('/api/threat-log', methods=['POST'])
def receive_telemetry():
    data = request.json
    if not data:
        return jsonify({"error": "No payload received"}), 400
    
    try:
        with open(DB_FILE, "r") as f:
            threats = json.load(f)
        
        threats.insert(0, data)
        
        with open(DB_FILE, "w") as f:
            json.dump(threats, f)
            
        print(f"[☁️ CLOUD] Logged new threat from {data.get('computer_name')}")
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/threats', methods=['GET'])
def get_threats():
    try:
        with open(DB_FILE, "r") as f:
            threats = json.load(f)
        return jsonify(threats), 200
    except Exception as e:
        return jsonify([]), 500

@app.route('/api/system-status', methods=['POST'])
def receive_status():
    data = request.json
    if not data:
        return jsonify({"error": "No payload received"}), 400
    try:
        with open(STATUS_FILE, "w") as f:
            json.dump(data, f)
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/system-status', methods=['GET'])
def get_status():
    try:
        if os.path.exists(STATUS_FILE):
            with open(STATUS_FILE, "r") as f:
                data = json.load(f)
            return jsonify(data), 200
        return jsonify({"safety_score": 100, "status": "SECURED"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("------------------------------------------------")
    print(" ☁️ SENTINEL-AI COMMAND CENTER ONLINE ☁️ ")
    print(" Listening for attacks & status on Port 5000...")
    print("------------------------------------------------")
    app.run(host='127.0.0.1', port=5000, debug=True)