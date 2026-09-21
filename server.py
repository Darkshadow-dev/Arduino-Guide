from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json
import secrets
import GSE
app = Flask(__name__)
CORS(app)

# -------------------------
# Arduino setup
# -------------------------
os.environ["ARDUINO_DIRECTORIES_DATA"] = "/opt/render/project/src/.arduino"

BASE = os.path.abspath("sketches")
os.makedirs(BASE, exist_ok=True)

GSE_BASE = os.path.abspath("gse")
os.makedirs(GSE_BASE, exist_ok=True)

SIMULATOR_URL = (
    "https://darkshadow-dev.github.io/"
    "Arduino-Guide/Arduino%20Uno.html"
)

CLI = "/opt/render/project/src/bin/arduino-cli"


# -------------------------
# helper
# -------------------------
def run_cmd(cmd):
    try:
        env = os.environ.copy()
        os.environ["ARDUINO_DIRECTORIES_DATA"] = "/opt/render/project/src/.arduino"

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

# ============================================================
# COMPILE
# ============================================================

@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.json or {}

    code = data.get("code", "")
    name = data.get("name", "project")
    board = data.get(
        "board",
        "arduino:avr:uno"
    )

    name = "".join(
        c for c in name
        if c.isalnum() or c in ("_", "-")
    ).strip()

    if not name:
        name = "project"

    project_path = os.path.join(
        BASE,
        name
    )

    os.makedirs(
        project_path,
        exist_ok=True
    )

    ino_path = os.path.join(
        project_path,
        f"{name}.ino"
    )

    with open(
        ino_path,
        "w",
        encoding="utf-8"
    ) as f:
        f.write(code)

    result = run_cmd([
        CLI,
        "compile",
        "--fqbn",
        board,
        project_path
    ])

    hex_path = None

    for root, _, files in os.walk(
        project_path
    ):
        for f in files:
            if f.endswith(".hex"):
                hex_path = os.path.join(
                    root,
                    f
                )
                break

    return jsonify({
        "success": result["success"],
        "output": result["output"],
        "hex_path": hex_path
    })

# ============================================================
# CREATE GSE
# ============================================================

@app.route("/create", methods=["POST"])
def create_gse():

    data = request.json or {}

    code = data.get("code", "")

    if not code.strip():
        return jsonify({
            "success": False,
            "error": "No Arduino source code provided."
        }), 400

    board = data.get(
        "board",
        "arduino:avr:uno"
    )

    if board != "arduino:avr:uno":
        return jsonify({
            "success": False,
            "error": f"Unsupported GSE board: {board}"
        }), 400

    try:

        executable = GSE.compile_gse(
            code,
            board
        )

        token = secrets.token_urlsafe(16)

        path = os.path.join(
            GSE_BASE,
            token + ".json"
        )

        with open(
            path,
            "w",
            encoding="utf-8"
        ) as f:
            json.dump(
                executable,
                f,
                indent=2
            )

        return jsonify({
            "success": True,
            "token": token,
            "url": (
                SIMULATOR_URL +
                "?gse=" +
                token
            )
        })

    except Exception as error:

        return jsonify({
            "success": False,
            "error": str(error)
        }), 400

# ============================================================
# PORTS
# ============================================================

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
            return jsonify({
                "success": True,
                "ports": []
            })

        data = json.loads(
            result["output"]
        )

        out = []

        for b in data:
            out.append({
                "port": b.get("address"),
                "board": (
                    b.get("boardName")
                    or b.get("name")
                ),
                "fqbn": (
                    b.get(
                        "matchingBoards",
                        [{}]
                    )[0].get("fqbn")
                    if b.get("matchingBoards")
                    else ""
                )
            })

        return jsonify({
            "success": True,
            "ports": out
        })

    except Exception:
        return jsonify({
            "success": True,
            "ports": []
        })


# ============================================================
# UPLOAD
# ============================================================

@app.route("/upload", methods=["POST"])
def upload():
    data = request.json or {}

    port = data.get("port")
    board = data.get(
        "board",
        "arduino:avr:uno"
    )
    name = data.get(
        "name",
        "project"
    )

    name = "".join(
        c for c in name
        if c.isalnum() or c in ("_", "-")
    ).strip()

    if not name:
        name = "project"

    project_path = os.path.join(
        BASE,
        name
    )

    if not port:
        return jsonify({
            "success": False,
            "output": "No port selected"
        })

    result = run_cmd([
        CLI,
        "upload",
        "-p",
        port,
        "--fqbn",
        board,
        project_path
    ])

    return jsonify(result)


# ============================================================
# DOWNLOAD HEX FILE
# ============================================================

@app.route("/download-hex")
def download_hex():
    path = request.args.get("path")

    if not path or not os.path.exists(path):
        return jsonify({
            "error": "file not found"
        })

    return send_file(
        path,
        as_attachment=True
    )


# ============================================================
# DOWNLOAD EXE
# ============================================================

@app.route("/download-exe")
def download_exe():
    return jsonify({
        "url": "https://github.com/Darkshadow-dev/Arduino-Guide/releases/download/Arduino/uploader.zip"
    })


# ============================================================
# SESSION CHECK
# ============================================================

@app.route("/session")
def session():
    return jsonify({
        "status": "ok"
    })


@app.route("/gse/<token>", methods=["GET"])
def get_gse(token):

    if not token or "/" in token or "\\" in token:
        return jsonify({
            "success": False,
            "error": "Invalid GSE token."
        }), 400

    path = os.path.join(
        GSE_BASE,
        token + ".json"
    )

    if not os.path.exists(path):
        return jsonify({
            "success": False,
            "error": "GSE not found."
        }), 404

    try:

        with open(
            path,
            "r",
            encoding="utf-8"
        ) as f:
            executable = json.load(f)

        return jsonify({
            "success": True,
            "executable": executable
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    port = int(
        os.environ.get(
            "PORT",
            5000
        )
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )

