from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import os
import json

app = Flask(__name__)
CORS(app)

BASE = os.path.abspath("sketches")
os.makedirs(BASE, exist_ok=True)

PROJECT = os.path.join(BASE, "web_sketch")
os.makedirs(PROJECT, exist_ok=True)

INO = os.path.join(PROJECT, "web_sketch.ino")


@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.json
    code = data.get("code", "")

    with open(INO, "w", encoding="utf-8") as f:
        f.write(code)

    result = subprocess.run(
        ["arduino-cli", "compile", "--fqbn", "arduino:avr:uno", PROJECT],
        capture_output=True,
        text=True
    )

    return jsonify({
        "success": result.returncode == 0,
        "output": result.stdout + result.stderr
    })


@app.route("/ports", methods=["GET"])
def ports():
    result = subprocess.run(
        ["arduino-cli", "board", "list", "--format", "json"],
        capture_output=True,
        text=True
    )

    try:
        data = json.loads(result.stdout)
    except:
        data = []

    out = []
    for b in data:
        out.append({
            "port": b.get("address"),
            "board": b.get("boardName") or b.get("name"),
            "fqbn": b.get("matchingBoards", [{}])[0].get("fqbn") if b.get("matchingBoards") else ""
        })

    return jsonify({"success": True, "ports": out})


@app.route("/upload", methods=["POST"])
def upload():
    data = request.json
    port = data.get("port")
    board = data.get("board", "arduino:avr:uno")

    if not port:
        return jsonify({"success": False, "output": "No port selected"})

    result = subprocess.run(
        ["arduino-cli", "upload", "-p", port, "--fqbn", board, PROJECT],
        capture_output=True,
        text=True
    )

    return jsonify({
        "success": result.returncode == 0,
        "output": result.stdout + result.stderr
    })


app.run(port=5000, debug=True)
