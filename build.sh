#!/usr/bin/env bash

echo "Installing Arduino CLI..."

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

CLI="/opt/render/project/src/bin/arduino-cli"

echo "Setting Arduino config directory..."

export ARDUINO_DATA_DIR=/opt/render/project/src/.arduino

mkdir -p $ARDUINO_DATA_DIR

echo "Updating index..."
$CLI core update-index

echo "Installing AVR core..."
$CLI core install arduino:avr

echo "Verifying install..."
$CLI core list