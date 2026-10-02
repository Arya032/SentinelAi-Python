# SentinelAI - Intelligent Endpoint Detection & Response (EDR)

[![Python Version](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

SentinelAI is an advanced, intent-based Endpoint Detection and Response (EDR) system designed to monitor, analyze, and neutralize cyber threats in real-time.

---

## 📁 Repository Structure

```
CyberProject/
├── config/                        # Service account & API configuration keys
│   └── firebase_key.json
├── specs/                         # PyInstaller build specifications (.spec files)
│   ├── agent.spec
│   ├── sentinel_edr.spec
│   └── dashboard.spec
├── src/                           # Primary Python Agent Source Package
│   ├── core/                      # Core runtime monitoring & protection
│   │   ├── app.py                 # Telemetry API server & command center
│   │   ├── eyes.py                # Real-time process scanner & intent watchdog
│   │   ├── behavior_watchdog.py   # Intent-based behavioral analysis
│   │   └── rollback.py            # VSS & System Protection snapshot engine
│   ├── ml/                        # Machine Learning AI Brain
│   │   ├── brain.py               # AI Model inference engine
│   │   ├── models/                # Pre-trained Random Forest / XGBoost models
│   │   │   └── brain_model.pkl
│   │   ├── training/              # AI training pipelines
│   │   └── datasets/              # Training sample sets (safe / malware)
│   ├── server/                    # Local IPC server
│   │   └── antigravity_server.py
│   └── utils/                     # Developer tools & threat simulation
│       └── generate_zeroday.py
├── data/                          # Runtime logs & system status json files
│   ├── cloud_threat_logs.json
│   └── system_status.json
├── docs/                          # Architecture & developer guides
└── website/                       # Standalone Web Portal (Separate Git Repo)
```

---

## 🚀 Quick Start

### 1. Requirements & Dependencies
Ensure Python 3.8+ is installed on your system.
```bash
pip install psutil requests flask flask-cors joblib scikit-learn pefile plyer pystray pillow
```

### 2. Running the Core Agent
To launch the real-time protection engine and system tray monitoring:
```bash
python -m src.core.eyes
```

### 3. Launching the Command Center Server
To start the local telemetry and status API server:
```bash
python -m src.core.app
```

---

## 🛡️ Core Capabilities

- **Intent-Based Execution Monitoring**: Identifies process injection, obfuscated shell execution, and unauthorized child processes.
- **Ransomware Rollback**: Uses Windows Volume Shadow Copy (VSS) to take system snapshots and restore state prior to threat execution.
- **Zero-Day AI Classifier**: Evaluates binary entropy and capability co-occurrence to catch unrecognized payloads.
- **Ultra-Low CPU Footprint**: Dynamic polling and efficient data structures maintain CPU usage below 2%.
