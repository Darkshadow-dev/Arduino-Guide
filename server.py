from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json

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


# -------------------------
# Helper function
# -------------------------
def run_cmd(cmd):
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True
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
        "arduino-cli",
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
    result = run_cmd([
        "arduino-cli",
        "board",
        "list",
        "--format",
        "json"
    ])

    try:
        data = json.loads(result["output"]) if result["success"] else []
    except:
        data = []

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
        "arduino-cli",
        "upload",
        "-p",
        port,
        "--fqbn",
        board,
        PROJECT
    ])

    return jsonify(result)


# -------------------------
# Render-safe startup
# IMPORTANT FIX HERE
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
