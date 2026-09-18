#!/usr/bin/env bash

echo "Installing Arduino CLI..."

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

CLI="/opt/render/project/src/bin/arduino-cli"

echo "Setting Arduino data dir..."

export ARDUINO_DATA_DIR=/opt/render/project/src/.arduino
mkdir -p $ARDUINO_DATA_DIR

echo "Updating index..."
$CLI core update-index

echo "Installing AVR..."
$CLI core install arduino:avr

echo "Installing Adafruit GFX..."
$CLI lib install "Adafruit GFX Library"

echo "Installing Adafruit SSD1306..."
$CLI lib install "Adafruit SSD1306"

echo "Installed cores:"
$CLI core list

echo "Installed libraries:"
$CLI lib list