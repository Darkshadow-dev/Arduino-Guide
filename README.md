# Arduino Guide — simulator, GSE and compiler API

This folder contains the Arduino Code editor page, Arduino Uno simulator, simulator/compiler API, and GSE regression tests.

## The two execution paths

- **Compile** (`POST /compile`) uses the real Arduino CLI toolchain. A successful build must produce an actual `.hex` file; library/compiler errors are returned to the editor.
- **Run Simulator** (`POST /create`) translates the supported Arduino sketch subset into GSE instructions. The simulator loads the returned token from `GET /gse/<token>` and executes those instructions against the browser components.

GSE is not a full C++ compiler. Arduino CLI remains the authority for whether a sketch is valid Arduino C++ and whether its libraries compile. The simulator can only execute syntax and APIs represented in GSE and the browser runtime.

## Local Windows testing

1. Install Python 3.10 or newer.
2. Install Arduino CLI and ensure `arduino-cli.exe` is on `PATH`, or set `ARDUINO_CLI` to its full path.
3. Open a terminal in this folder and run `python -m pip install -r requirements.txt`.
4. Start the API in one terminal: `python server.py` (API is `http://127.0.0.1:5000`).
5. In a second terminal, run `python -m http.server 8000`.
6. Open `http://127.0.0.1:8000/Arduino%20Code.html`.

The editor and simulator automatically use the local API when the page is opened on `localhost` or `127.0.0.1`. On the published GitHub Pages site they use `https://arduino-guide-6.onrender.com`.

Before the first real compile on a local machine, install the Uno AVR core and libraries in Arduino CLI:

```text
arduino-cli core update-index
arduino-cli core install arduino:avr
arduino-cli lib update-index
arduino-cli lib install "Adafruit BusIO"
arduino-cli lib install "Adafruit GFX Library"
arduino-cli lib install "Adafruit SSD1306"
```

## Render deployment

- Build command: `bash build.sh`
- Start command: `python server.py`
- Health check: `/health`

The build script installs Arduino CLI, the AVR core, and the Adafruit SSD1306 dependencies. If the API hostname changes, update the API constants in `Arduino Code.html` and `Arduino Uno.html`.

## Simulator component support

The current GSE/runtime supports common digital and PWM LED output, push/toggle input (including `INPUT_PULLUP`), serial output, delays, common control flow, Servo `attach`/`write`/`detach`/`read`, and common Adafruit SSD1306-style OLED operations: initialization, clear, text, pixels, lines, rectangles, circles and basic display settings. The two visual OLED panels mirror the same simulated framebuffer. Hardware scrolling is reported but not animated. Unsupported C++ constructs and APIs must use **Compile** for real compiler validation and may still need a dedicated GSE implementation before they can run in the simulator.

The simulator is an educational model, not cycle-accurate hardware emulation. Cloud-hosted `/ports` and `/upload` cannot access a USB Arduino plugged into a user's own computer; use a local API for physical USB upload.

## Regression tests

Run:

```text
python -m unittest -v test_gse.py
```

Tests cover LED output, button input, SSD1306 OLED setup/drawing, and Servo commands.
