import os
import sys
import subprocess
import urllib.request
import zipfile
import shutil
import platform
import struct

CORE = "arduino:avr"
BOARD = "arduino:avr:uno"

BASE = os.path.join(os.getcwd(), "arduino_cli_test")
CLI_DIR = os.path.join(BASE, "cli")
SKETCH = os.path.join(BASE, "blink")

os.makedirs(CLI_DIR, exist_ok=True)
os.makedirs(SKETCH, exist_ok=True)

# =========================
# ERROR SYSTEM
# =========================
def fail(msg):
    print("\n❌ ERROR:", msg)
    sys.exit()

def run(cmd):
    try:
        return subprocess.check_output(cmd, stderr=subprocess.STDOUT, text=True)
    except subprocess.CalledProcessError as e:
        print("\n❌ COMMAND FAILED:")
        print(" ".join(cmd))
        print(e.output)
        fail("Operation failed")

def wait(msg):
    try:
        input("\n" + msg)
    except KeyboardInterrupt:
        fail("Cancelled by user")

# =========================
# SYSTEM DETECT
# =========================
OS = platform.system().lower()
ARCH = struct.calcsize("P") * 8

print("OS:", OS)
print("ARCH:", ARCH, "bit")

# =========================
# CLI FILE
# =========================
if "windows" in OS:
    CLI_NAME = "arduino-cli.exe"
    FILE = "arduino-cli_latest_Windows_64bit.zip"

elif "linux" in OS:
    CLI_NAME = "arduino-cli"
    FILE = "arduino-cli_latest_Linux_64bit.tar.gz"

elif "darwin" in OS:
    CLI_NAME = "arduino-cli"
    FILE = "arduino-cli_latest_macOS_64bit.tar.gz"

else:
    fail("Unsupported OS")

URL = f"https://downloads.arduino.cc/arduino-cli/{FILE}"
ARCHIVE = os.path.join(CLI_DIR, FILE)

# =========================
# FIND CLI
# =========================
def find_cli():
    for p in os.environ.get("PATH", "").split(os.pathsep):
        path = os.path.join(p, CLI_NAME)
        if os.path.exists(path):
            return path

    for root, _, files in os.walk(CLI_DIR):
        if CLI_NAME in files:
            return os.path.join(root, CLI_NAME)

    return None

cli = find_cli()

# =========================
# DOWNLOAD IF MISSING
# =========================
if not cli:

    print("\nCLI not found → downloading...")

    urllib.request.urlretrieve(URL, ARCHIVE)

    if not os.path.exists(ARCHIVE):
        fail("Download failed")

    print("Extracting...")

    if FILE.endswith(".zip"):
        with zipfile.ZipFile(ARCHIVE, "r") as z:
            z.extractall(CLI_DIR)
    else:
        shutil.unpack_archive(ARCHIVE, CLI_DIR)

    cli = find_cli()

if not cli:
    fail("CLI not found after install")

# =========================
# SHOW CLI LOCATION (IMPORTANT)
# =========================
print("\n✔ Arduino CLI LOCATION:")
print("→", cli)

# =========================
# VERIFY CLI
# =========================
print("\nVerifying CLI...")

version = run([cli, "version"])
print("✔ CLI OK:", version.splitlines()[0])

# =========================
# CORE CHECK
# =========================
print("\nChecking Arduino cores...")

cores = run([cli, "core", "list"])

if CORE not in cores:

    wait("Core missing → press ENTER to install")

    run([cli, "core", "update-index"])
    run([cli, "core", "install", CORE])

    cores = run([cli, "core", "list"])

    if CORE not in cores:
        fail("Core install failed")

print("✔ Core OK")

# =========================
# SHOW SYSTEM INFO
# =========================
print("\n📦 SYSTEM SUMMARY")
print("OS:", OS)
print("ARCH:", ARCH, "bit")
print("CLI PATH:", cli)
print("CORE:", CORE)
print("BOARD:", BOARD)

# =========================
# TEST SKETCH
# =========================
sketch_code = """
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
"""

with open(os.path.join(SKETCH, "blink.ino"), "w") as f:
    f.write(sketch_code)

# =========================
# BOARD DETECTION
# =========================
print("\nDetecting boards...")

board_list = run([cli, "board", "list"])
print(board_list)

port = None

for line in board_list.splitlines():
    parts = line.split()
    if parts and ("COM" in parts[0] or "/dev/" in parts[0]):
        port = parts[0]
        break

# =========================
# COMPILE
# =========================
wait("\nPress ENTER to COMPILE...")

print("\nCompiling...")

compile_out = run([
    cli,
    "compile",
    "--fqbn",
    BOARD,
    SKETCH
])

print(compile_out)

if "error" in compile_out.lower():
    fail("Compile failed")

print("✔ Compile OK")

# =========================
# UPLOAD
# =========================
if port:

    wait(f"\nBoard found at {port}. Press ENTER to UPLOAD...")

    print("\nUploading...")

    upload_out = run([
        cli,
        "upload",
        "-p",
        port,
        "--fqbn",
        BOARD,
        SKETCH
    ])

    print(upload_out)

    if "error" in upload_out.lower():
        fail("Upload failed")

    print("✔ Upload OK")

else:
    print("\n⚠ No board detected (upload skipped)")

# =========================
# FINAL
# =========================
print("\n✔ SYSTEM READY")
print("Everything OK")
print("CLI location:", cli)
wait("Press ENTER to exit...")
