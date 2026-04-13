#!/usr/bin/env bash

echo "Installing Arduino CLI..."

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

# FIX: use full path instead of moving
CLI="/opt/render/project/src/bin/arduino-cli"

echo "Testing CLI..."
$CLI version

echo "Installing Arduino AVR core..."
$CLI core update-index
$CLI core install arduino:avr