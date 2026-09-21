from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json
import secrets
import GSE

app = Flask(__name__)
CORS(app)

# ============================================================
# ARDUINO CLI CONFIG
# ============================================================

ARDUINO_DATA_DIR = "/opt/render/project/src/.arduino"
CLI = "/opt/render/project/src/bin/arduino-cli"

os.environ["ARDUINO_DATA_DIR"] = ARDUINO_DATA_DIR

# Make sure Arduino CLI can be found and uses the correct data dir.
os.environ["PATH"] = (
    "/opt/render/project/src/bin:"
    + os.environ.get("PATH", "")
)

# ============================================================
# DIRECTORIES
# ============================================================

BASE = os.path.abspath("sketches")
os.makedirs(BASE, exist_ok=True)

GSE_BASE = os.path.abspath("gse")
os.makedirs(GSE_BASE, exist_ok=True)

HEX_BASE = os.path.abspath("hex")
os.makedirs(HEX_BASE, exist_ok=True)

# ============================================================
# SIMULATOR
# ============================================================

SIMULATOR_URL = (
    "https://darkshadow-dev.github.io/"
    "Arduino-Guide/Arduino%20Uno.html"
)

# ============================================================
# COMMAND RUNNER
# ============================================================
def run_cmd(cmd):
    try:
        env = os.environ.copy()

        env["ARDUINO_DATA_DIR"] = ARDUINO_DATA_DIR

        env["PATH"] = (
            "/opt/render/project/src/bin:"
            + env.get("PATH", "")
        )

        library_path = os.path.join(
            ARDUINO_DATA_DIR,
            "libraries"
        )

        env["ARDUINO_LIBRARY_ENABLE_UNSAFE_INSTALL"] = "true"

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
# NAME SANITIZER
# ============================================================

def clean_name(name):
    name = "".join(
        c for c in name
        if c.isalnum() or c in ("_", "-")
    ).strip()

    if not name:
        name = "project"

    return name

# ============================================================
# COMPILE
# ============================================================

@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.json or {}

    code = data.get("code", "")
    name = clean_name(data.get("name", "project"))
    board = data.get("board", "arduino:avr:uno")

    if not code.strip():
        return jsonify({
            "success": False,
            "output": "No Arduino source code provided.",
            "hex_url": None
        }), 400

    # --------------------------------------------------------
    # Show installed libraries for debugging.
    # --------------------------------------------------------

    library_check = run_cmd([
        CLI,
        "lib",
        "list"
    ])

    # --------------------------------------------------------
    # Create project directory.
    # --------------------------------------------------------

    project_path = os.path.join(BASE, name)
    os.makedirs(project_path, exist_ok=True)

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

    # --------------------------------------------------------
    # Create unique build directory.
    # --------------------------------------------------------

    build_id = secrets.token_urlsafe(12)

    build_path = os.path.join(
        project_path,
        "build",
        build_id
    )

    os.makedirs(build_path, exist_ok=True)

    # --------------------------------------------------------
    # Compile with explicit Arduino data/library directory.
    # --------------------------------------------------------

    result = run_cmd([
library_directory = os.path.join(
    ARDUINO_DATA_DIR,
    "libraries"
)

print("=== ARDUINO LIBRARY DIRECTORY ===")
print(library_directory)

if os.path.isdir(library_directory):
    for item in os.listdir(library_directory):
        print("LIBRARY:", item)
else:
    print("LIBRARY DIRECTORY DOES NOT EXIST")

print("=== END LIBRARY DIRECTORY ===")
        CLI,
        "compile",
        "--fqbn",
        board,
        "--libraries",
        os.path.join(
            ARDUINO_DATA_DIR,
            "libraries"
        ),
        "--output-dir",
        build_path,
        project_path
    ])

    # --------------------------------------------------------
    # If compilation failed, return immediately.
    # --------------------------------------------------------

    if not result["success"]:
        return jsonify({
            "success": False,
            "output": result["output"],
            "libraries": library_check["output"],
            "hex_url": None
        })

    # --------------------------------------------------------
    # Find generated HEX file.
    # --------------------------------------------------------

    hex_path = None

    for root, _, files in os.walk(build_path):
        for filename in files:
            if filename.lower().endswith(".hex"):
                hex_path = os.path.join(
                    root,
                    filename
                )
                break

        if hex_path:
            break

    # --------------------------------------------------------
    # No HEX found.
    # --------------------------------------------------------

    if not hex_path:
        return jsonify({
            "success": False,
            "output": (
                result["output"]
                + "\n\nCompilation succeeded, "
                "but no HEX file was found."
            ),
            "libraries": library_check["output"],
            "hex_url": None
        })

    # --------------------------------------------------------
    # Move/copy HEX into a public-token directory.
    # --------------------------------------------------------

    hex_token = secrets.token_urlsafe(24)

    public_hex_path = os.path.join(
        HEX_BASE,
        hex_token + ".hex"
    )

    with open(hex_path, "rb") as source:
        with open(public_hex_path, "wb") as destination:
            destination.write(source.read())

    # --------------------------------------------------------
    # Public download URL.
    # --------------------------------------------------------

    hex_url = (
        "https://arduino-guide-6.onrender.com/"
        "download-hex/"
        + hex_token
    )

    return jsonify({
        "success": True,
        "output": result["output"],
        "libraries": library_check["output"],
        "hex_path": public_hex_path,
        "hex_url": hex_url
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

    # GSE currently supports Arduino Uno only.
    if board != "arduino:avr:uno":
        return jsonify({
            "success": False,
            "error": (
                f"Unsupported GSE board: {board}"
            )
        }), 400

    try:
        # IMPORTANT:
        # GSE is independent of Arduino CLI/libraries.
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
                SIMULATOR_URL
                + "?gse="
                + token
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
            matching = b.get(
                "matchingBoards",
                []
            )

            fqbn = ""

            if matching:
                fqbn = matching[0].get(
                    "fqbn",
                    ""
                )

            out.append({
                "port": b.get(
                    "address"
                ),
                "board": (
                    b.get("boardName")
                    or b.get("name")
                ),
                "fqbn": fqbn
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

    name = clean_name(
        data.get(
            "name",
            "project"
        )
    )

    project_path = os.path.join(
        BASE,
        name
    )

    if not port:
        return jsonify({
            "success": False,
            "output": "No port selected"
        }), 400

    if not os.path.exists(project_path):
        return jsonify({
            "success": False,
            "output": (
                "Project does not exist. "
                "Compile it first."
            )
        }), 404

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
# DOWNLOAD HEX
# ============================================================

@app.route(
    "/download-hex/<token>",
    methods=["GET"]
)
def download_hex(token):
    # Only allow URL-safe token characters.
    if (
        not token
        or "/" in token
        or "\\" in token
        or ".." in token
    ):
        return jsonify({
            "error": "Invalid HEX token."
        }), 400

    filename = token + ".hex"

    path = os.path.join(
        HEX_BASE,
        filename
    )

    if not os.path.isfile(path):
        return jsonify({
            "error": "HEX file not found."
        }), 404

    return send_file(
        path,
        as_attachment=True,
        download_name="Arduino.hex",
        mimetype="application/octet-stream"
    )

# ============================================================
# DOWNLOAD EXE
# ============================================================

@app.route("/download-exe")
def download_exe():
    return jsonify({
        "url": (
            "https://github.com/"
            "Darkshadow-dev/"
            "Arduino-Guide/"
            "releases/download/"
            "Arduino/"
            "uploader.zip"
        )
    })

# ============================================================
# SESSION
# ============================================================

@app.route("/session")
def session():
    return jsonify({
        "status": "ok"
    })

# ============================================================
# GET GSE
# ============================================================

@app.route(
    "/gse/<token>",
    methods=["GET"]
)
def get_gse(token):
    if (
        not token
        or "/" in token
        or "\\" in token
        or ".." in token
    ):
        return jsonify({
            "success": False,
            "error": "Invalid GSE token."
        }), 400

    path = os.path.join(
        GSE_BASE,
        token + ".json"
    )

    if not os.path.isfile(path):
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
# START SERVER
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

