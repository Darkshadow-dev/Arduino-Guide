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
from flask import send_file
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
    name = data.get("name", "project")

    # clean name
    name = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip()
    if not name:
        name = "project"

    project_path = os.path.join(BASE, name)
    os.makedirs(project_path, exist_ok=True)

    ino_path = os.path.join(project_path, f"{name}.ino")

    with open(ino_path, "w", encoding="utf-8") as f:
        f.write(code)

    result = run_cmd([
        CLI,
        "compile",
        "--fqbn",
        data.get("board", "arduino:avr:uno"),
        project_path
    ])

    # 🔥 FIND HEX FILE
    hex_file = None

    build_path = os.path.join(project_path, "build")

    for root, dirs, files in os.walk(project_path):
        for file in files:
            if file.endswith(".hex"):
                hex_file = os.path.join(root, file)
                break

    # 🔥 RETURN HEX (base64)
    hex_data = None
    if hex_file and os.path.exists(hex_file):
        import base64
        with open(hex_file, "rb") as f:
            hex_data = base64.b64encode(f.read()).decode("utf-8")

    return jsonify({
        "success": result["success"],
        "output": result["output"],
        "hex": hex_data
    })


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
    name = data.get("name", "project")

    name = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip()
    if not name:
        name = "project"

    project_path = os.path.join(BASE, name)

    if not port:
        return jsonify({"success": False, "output": "No port selected"})

    result = run_cmd([
        CLI,
        "upload",
        "-p", port,
        "--fqbn", board,
        project_path
    ])

    return jsonify(result)

    return jsonify(result)

# -------------------------
# Download EXE uploader
# -------------------------
@app.route("/download-exe")
def download_exe():
    exe_path = os.path.join(os.getcwd(), "uploader.exe")

    if not os.path.exists(exe_path):
        return jsonify({"success": False, "error": "EXE not found"})

    return send_file(
        exe_path,
        as_attachment=True
    )

# -------------------------
# Download HEX file
# -------------------------
@app.route("/download-hex", methods=["GET"])
def download_hex():

    name = request.args.get("name", "project")

    name = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip()
    if not name:
        name = "project"

    project_path = os.path.join(BASE, name)

    hex_file = None

    for root, dirs, files in os.walk(project_path):
        for file in files:
            if file.endswith(".hex"):
                hex_file = os.path.join(root, file)
                break

    if not hex_file or not os.path.exists(hex_file):
        return jsonify({"success": False, "error": "HEX not found"})

    return send_file(
        hex_file,
        as_attachment=True,
        download_name=f"{name}.hex"
    )
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

