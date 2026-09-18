#!/bin/bash

set -e

mkdir -p /opt/render/project/src/bin

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh -s 1.5.1

export PATH="/opt/render/project/src/bin:$PATH"

arduino-cli config init --overwrite

arduino-cli core update-index

arduino-cli core install arduino:avr

arduino-cli lib update-index

arduino-cli lib install "Adafruit BusIO"
arduino-cli lib install "Adafruit GFX Library"
arduino-cli lib install "Adafruit SSD1306"

echo "Installed libraries:"
arduino-cli lib list