from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

# -------------------------
# Arduino setup
# -------------------------
os.environ["ARDUINO_DATA_DIR"] = "/opt/render/project/src/.arduino"

BASE = os.path.abspath("sketches")
os.makedirs(BASE, exist_ok=True)

CLI = "/opt/render/project/src/bin/arduino-cli"


# -------------------------
# helper
# -------------------------
def run_cmd(cmd):
    try:
        env = os.environ.copy()
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
        return {"success": False, "output": str(e)}


# -------------------------
# COMPILE
# -------------------------
@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.json or {}

    code = data.get("code", "")
    name = data.get("name", "project")
    board = data.get("board", "arduino:avr:uno")

    # sanitize name
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
        board,
        project_path
    ])

    # -------------------------
    # find HEX
    # -------------------------
    hex_path = None

    for root, _, files in os.walk(project_path):
        for f in files:
            if f.endswith(".hex"):
                hex_path = os.path.join(root, f)
                break

    return jsonify({
        "success": result["success"],
        "output": result["output"],
        "hex_path": hex_path
    })


# -------------------------
# PORTS
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
# UPLOAD
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


# -------------------------
# DOWNLOAD HEX FILE
# -------------------------
@app.route("/download-hex")
def download_hex():
    path = request.args.get("path")

    if not path or not os.path.exists(path):
        return jsonify({"error": "file not found"})

    return send_file(path, as_attachment=True)


# -------------------------
# DOWNLOAD EXE (UPLOAD TOOL)
# -------------------------
@app.route("/download-exe")
def download_exe():
    return jsonify({
        "url": "https://github.com/Darkshadow-dev/Arduino-Guide/releases/download/Arduino/uploader.zip"
    })


# -------------------------
# SESSION CHECK
# -------------------------
@app.route("/session")
def session():
    return jsonify({"status": "ok"})


# -------------------------
# RUN
# -------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
