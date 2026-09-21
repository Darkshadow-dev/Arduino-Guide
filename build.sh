#!/bin/bash

set -e

mkdir -p /opt/render/project/src/bin
mkdir -p /opt/render/project/src/.arduino

export PATH="/opt/render/project/src/bin:$PATH"
export ARDUINO_DATA_DIR="/opt/render/project/src/.arduino"

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh -s 1.5.1

echo "Arduino CLI:"
arduino-cli version

arduino-cli config init --overwrite

arduino-cli config set directories.data "$ARDUINO_DATA_DIR"
arduino-cli config set directories.user "$ARDUINO_DATA_DIR"

echo "Updating core index..."
arduino-cli core update-index

echo "Installing AVR core..."
arduino-cli core install arduino:avr

echo "Installing libraries..."
arduino-cli lib update-index
arduino-cli lib install "Adafruit BusIO"
arduino-cli lib install "Adafruit GFX Library"
arduino-cli lib install "Adafruit SSD1306"

echo "=== CORE ==="
arduino-cli core list

echo "=== LIBRARIES ==="
arduino-cli lib list

echo "=== LIBRARY DIRECTORY ==="
ls -la "$ARDUINO_DATA_DIR/libraries"

echo "=== GFX HEADER ==="
find "$ARDUINO_DATA_DIR/libraries" -name "Adafruit_GFX.h" -print

echo "=== SSD1306 HEADER ==="
find "$ARDUINO_DATA_DIR/libraries" -name "Adafruit_SSD1306.h" -print

echo "=== DATA DIRECTORY ==="
echo "$ARDUINO_DATA_DIR"

echo "Build environment ready."