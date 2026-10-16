# Arduino Guide — simulator and build server

## What each part does

- `server.py` is the Flask API used by **Compile**, **Run Simulator**, HEX downloads and serial board discovery/upload.
- `GSE.py` translates the supported subset of Arduino sketch syntax into the GSE JSON format consumed by `Arduino Uno.html`.
- `Arduino Uno.html` is the browser simulator and loads GSE through `GET /gse/<token>`.
- `build.sh` installs Arduino CLI, the AVR core, and the Adafruit libraries on a Render-style Linux deployment.

## Deploying the API

Use Python 3.10+ and set the build command to `bash build.sh`; use `pip install -r requirements.txt` for dependencies. Start command: `python server.py`. The service listens on `0.0.0.0:$PORT`. Set `ARDUINO_DATA_DIR` or `ARDUINO_CLI` only if you need custom locations.

The frontend currently points at `https://arduino-guide-6.onrender.com`. If you deploy the API under a different hostname, update the `API` constant in `Arduino Code.html` and `GSE_SERVER` in `Arduino Uno.html`.

Check `GET /health` after deployment. It reports API status and whether the Arduino CLI binary is available; it does not claim that a compile has been tested.

## Simulator scope

GSE is a lightweight simulator translator, **not a full Arduino C++ compiler**. It supports common sketch structure, variables, expressions, `setup()`/`loop()`, `if`/`else`, common pin I/O, delays, serial output, tone, EEPROM writes, Wire/SPI initialization, and several OLED calls. Use **Compile** for the actual Arduino compiler, installed libraries, and real `.hex` output. Unsupported C++ syntax is reported as a GSE error rather than silently accepted.

## Hardware upload note

The `/ports` and `/upload` endpoints run on the server machine. On a cloud host such as Render they cannot see USB devices plugged into your personal laptop. Use the local API on the computer connected to the Arduino for USB upload, or use the downloadable HEX file and a local uploader.
