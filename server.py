from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json

os.environ["ARDUINO_DATA_DIR"] = "/opt/render/project/src/.arduino"

app = Flask(__name__)
CORS(app)

# -------------------------
# Project setup
# -------------------------
BASE = os.path.abspath("sketches")
os.makedirs(BASE, exist_ok=True)

PROJECT = os.path.join(BASE, "web_sketch")
os.makedirs(PROJECT, exist_ok=True)

INO = os.path.join(PROJECT, "web_sketch.ino")

CLI = "/opt/render/project/src/bin/arduino-cli"

# -------------------------
# Helper function
# -------------------------
def run_cmd(cmd):
    try:
        env = os.environ.copy()

        # 🔥 FORCE Arduino to use correct folder
        env["ARDUINO_DATA_DIR"] = "/opt/render/project/src/.arduino"

        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            env=env
        )

        return {
            "success": result.returncode == 0,
            "output": result.stdout + result.stderr
        }

    except Exception as e:
        return {
            "success": False,
            "output": str(e)
        }

# -------------------------
# Compile endpoint
# -------------------------
@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.json or {}
    code = data.get("code", "")

    with open(INO, "w", encoding="utf-8") as f:
        f.write(code)

    result = run_cmd([
        CLI,
        "compile",
        "--fqbn",
        "arduino:avr:uno",
        PROJECT
    ])

    return jsonify(result)


# -------------------------
# Port list (may not work on Render, but kept for local use)
# -------------------------
@app.route("/ports", methods=["GET"])
def ports():
    try:
        result = run_cmd([
            CLI,
            "board",
            "list",
            "--format",
            "json"
        ])

        if not result["success"]:
            return jsonify({"success": True, "ports": []})

        data = json.loads(result["output"])

        out = []
        for b in data:
            out.append({
                "port": b.get("address"),
                "board": b.get("boardName") or b.get("name"),
                "fqbn": (
                    b.get("matchingBoards", [{}])[0].get("fqbn")
                    if b.get("matchingBoards")
                    else ""
                )
            })

        return jsonify({"success": True, "ports": out})

    except Exception:
        return jsonify({"success": True, "ports": []})


# -------------------------
# Upload (NOTE: will NOT work on Render cloud)
# -------------------------
@app.route("/upload", methods=["POST"])
def upload():
    data = request.json or {}
    port = data.get("port")
    board = data.get("board", "arduino:avr:uno")

    if not port:
        return jsonify({"success": False, "output": "No port selected"})

    result = run_cmd([
        CLI,
        "upload",
        "-p",
        port,
        "--fqbn",
        board,
        PROJECT
    ])

    return jsonify(result)
@app.route("/session")
def session():
    return jsonify({"status": "ok"})

import os
import subprocess


# -------------------------
# Render-safe startup
# IMPORTANT FIX HERE
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
