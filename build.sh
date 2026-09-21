#!/bin/bash

set -e

mkdir -p /opt/render/project/src/bin

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh -s 1.5.1

export PATH="/opt/render/project/src/bin:$PATH"
export ARDUINO_DIRECTORIES_DATA="/opt/render/project/src/.arduino"

echo "Arduino CLI:"
arduino-cli version

arduino-cli config init --overwrite

arduino-cli core update-index

echo "Installing AVR core..."
arduino-cli core install arduino:avr

echo "Checking AVR core..."
arduino-cli core list

arduino-cli lib update-index

echo "Installing libraries..."
arduino-cli lib install "Adafruit BusIO"
arduino-cli lib install "Adafruit GFX Library"
arduino-cli lib install "Adafruit SSD1306"

echo "Installed libraries:"
arduino-cli lib list

echo "Build environment ready."