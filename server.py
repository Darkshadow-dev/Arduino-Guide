from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import subprocess
import os
import json
import re
import secrets
import GSE
app = Flask(__name__)
CORS(app)

# -------------------------
# Arduino setup
# -------------------------
os.environ["ARDUINO_DATA_DIR"] = "/opt/render/project/src/.arduino"

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


# ============================================================
# GSE
# ============================================================

GSE_VERSION = 1


def gse_error(message, line=None):
    error = {
        "message": message
    }

    if line is not None:
        error["line"] = line

    return error


def clean_cpp_line(line):
    line = line.strip()

    if not line:
        return ""

    if line.startswith("//"):
        return ""

    line = re.sub(r"//.*$", "", line).strip()

    return line


def split_arguments(text):
    args = []
    current = ""
    depth = 0
    quote = None

    for char in text:
        if quote:
            current += char

            if char == quote:
                quote = None

            continue

        if char in ('"', "'"):
            quote = char
            current += char
            continue

        if char == "(":
            depth += 1
            current += char
            continue

        if char == ")":
            depth -= 1
            current += char
            continue

        if char == "," and depth == 0:
            args.append(current.strip())
            current = ""
            continue

        current += char

    if current.strip():
        args.append(current.strip())

    return args


def parse_value(value):
    value = value.strip()

    if value == "HIGH":
        return 1

    if value == "LOW":
        return 0

    if value == "INPUT":
        return "INPUT"

    if value == "OUTPUT":
        return "OUTPUT"

    if value == "INPUT_PULLUP":
        return "INPUT_PULLUP"

    if value == "true":
        return True

    if value == "false":
        return False

    if re.fullmatch(r"-?\d+", value):
        return int(value)

    if re.fullmatch(r"-?\d+\.\d+", value):
        return float(value)

    if value.startswith('"') and value.endswith('"'):
        return value[1:-1]

    if value.startswith("'") and value.endswith("'"):
        return value[1:-1]

    return {
        "type": "expression",
        "value": value
    }


def parse_gse_instruction(line, line_number):
    line = clean_cpp_line(line)

    if not line:
        return None

    if line in ("{", "}"):
        return None

    # -------------------------
    # pinMode
    # -------------------------
    match = re.match(
        r"pinMode\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 2:
            raise ValueError(
                "pinMode() requires 2 arguments."
            )

        return {
            "op": "PIN_MODE",
            "pin": parse_value(args[0]),
            "mode": parse_value(args[1])
        }

    # -------------------------
    # digitalWrite
    # -------------------------
    match = re.match(
        r"digitalWrite\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 2:
            raise ValueError(
                "digitalWrite() requires 2 arguments."
            )

        return {
            "op": "DIGITAL_WRITE",
            "pin": parse_value(args[0]),
            "value": parse_value(args[1])
        }

    # -------------------------
    # digitalRead
    # -------------------------
    match = re.match(
        r"digitalRead\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "digitalRead() requires 1 argument."
            )

        return {
            "op": "DIGITAL_READ",
            "pin": parse_value(args[0]),
            "result": "stack"
        }

    # -------------------------
    # analogRead
    # -------------------------
    match = re.match(
        r"analogRead\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "analogRead() requires 1 argument."
            )

        return {
            "op": "ANALOG_READ",
            "pin": parse_value(args[0]),
            "result": "stack"
        }

    # -------------------------
    # analogWrite
    # -------------------------
    match = re.match(
        r"analogWrite\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 2:
            raise ValueError(
                "analogWrite() requires 2 arguments."
            )

        return {
            "op": "ANALOG_WRITE",
            "pin": parse_value(args[0]),
            "value": parse_value(args[1])
        }

    # -------------------------
    # delay
    # -------------------------
    match = re.match(
        r"delay\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "delay() requires 1 argument."
            )

        return {
            "op": "DELAY",
            "ms": parse_value(args[0])
        }

    # -------------------------
    # tone
    # -------------------------
    match = re.match(
        r"tone\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) not in (2, 3):
            raise ValueError(
                "tone() requires 2 or 3 arguments."
            )

        instruction = {
            "op": "TONE",
            "pin": parse_value(args[0]),
            "frequency": parse_value(args[1])
        }

        if len(args) == 3:
            instruction["duration"] = parse_value(args[2])

        return instruction

    # -------------------------
    # noTone
    # -------------------------
    match = re.match(
        r"noTone\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "noTone() requires 1 argument."
            )

        return {
            "op": "NO_TONE",
            "pin": parse_value(args[0])
        }

    # -------------------------
    # Serial.begin
    # -------------------------
    match = re.match(
        r"Serial\.begin\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "Serial.begin() requires 1 argument."
            )

        return {
            "op": "SERIAL_BEGIN",
            "baud": parse_value(args[0])
        }

    # -------------------------
    # Serial.print
    # -------------------------
    match = re.match(
        r"Serial\.print\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "Serial.print() requires 1 argument."
            )

        return {
            "op": "SERIAL_PRINT",
            "value": parse_value(args[0])
        }

    # -------------------------
    # Serial.println
    # -------------------------
    match = re.match(
        r"Serial\.println\s*\((.*)\)\s*;?",
        line
    )

    if match:
        args = split_arguments(match.group(1))

        if len(args) != 1:
            raise ValueError(
                "Serial.println() requires 1 argument."
            )

        return {
            "op": "SERIAL_PRINTLN",
            "value": parse_value(args[0])
        }

    # -------------------------
    # return
    # -------------------------
    if line == "return;" or line == "return":
        return {
            "op": "RETURN"
        }

    # -------------------------
    # unsupported Arduino code
    # -------------------------
    raise ValueError(
        f"Unsupported Arduino instruction: {line}"
    )


def extract_function(code, name):
    pattern = re.compile(
        r"\b" + re.escape(name) + r"\s*\(\s*\)\s*\{",
        re.MULTILINE
    )

    match = pattern.search(code)

    if not match:
        return None

    start = match.end()
    depth = 1
    position = start

    while position < len(code):
        char = code[position]

        if char == "{":
            depth += 1

        elif char == "}":
            depth -= 1

            if depth == 0:
                return code[start:position]

        position += 1

    raise ValueError(
        f"Function {name}() has an unmatched {{."
    )


def compile_gse(source):
    setup_code = extract_function(
        source,
        "setup"
    )

    loop_code = extract_function(
        source,
        "loop"
    )

    if setup_code is None:
        raise ValueError(
            "Arduino code does not contain setup()."
        )

    if loop_code is None:
        raise ValueError(
            "Arduino code does not contain loop()."
        )

    setup_program = []
    loop_program = []

    setup_lines = setup_code.splitlines()
    loop_lines = loop_code.splitlines()

    for index, line in enumerate(setup_lines, 1):
        try:
            instruction = parse_gse_instruction(
                line,
                index
            )

            if instruction:
                setup_program.append(instruction)

        except ValueError as error:
            raise ValueError(
                f"setup(), line {index}: {error}"
            )

    for index, line in enumerate(loop_lines, 1):
        try:
            instruction = parse_gse_instruction(
                line,
                index
            )

            if instruction:
                loop_program.append(instruction)

        except ValueError as error:
            raise ValueError(
                f"loop(), line {index}: {error}"
            )

    return {
        "format": "GSE",
        "version": GSE_VERSION,
        "board": "arduino:avr:uno",
        "program": {
            "setup": setup_program,
            "loop": loop_program
        }
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

    source = data.get("source", {})
    code = source.get("code", "")

    if not code:
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
        executable = compile_gse(
            code
        )

        return jsonify({
            "success": True,
            "executable": executable
        })

    except ValueError as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 400

    except Exception as error:
        return jsonify({
            "success": False,
            "error": str(error)
        }), 500


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


@app.route("/create", methods=["POST"])
def create_gse():

    data = request.json or {}

    code = data.get("code", "")
    board = data.get(
        "board",
        "arduino:avr:uno"
    )

    if not code.strip():
        return jsonify({
            "success": False,
            "error": "No Arduino code supplied."
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

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        }), 400


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
