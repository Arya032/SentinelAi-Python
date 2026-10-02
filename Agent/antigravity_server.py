from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# CORS allows your website to fetch data from this server without security errors
CORS(app) 

# This is our MVP database (stores alerts in RAM while the server runs)
alerts_db = []

@app.route('/api/alerts', methods=['POST', 'GET'])
def handle_alerts():
    if request.method == 'POST':
        # 1. The Agent sends data here when it kills a virus
        data = request.json
        alerts_db.append(data)
        print(f"\n[ANTIGRAVITY DB] 🚨 New Threat Logged: {data['threat']} on {data['endpoint']}", flush=True)
        return jsonify({"status": "SECURED"}), 201
    
    elif request.method == 'GET':
        # 2. The Website asks for data here to update the dashboard
        return jsonify(alerts_db), 200

if __name__ == '__main__':
    print("[ANTIGRAVITY] Engine Live. Listening on http://127.0.0.1:5000/api/alerts")
    app.run(port=5000)