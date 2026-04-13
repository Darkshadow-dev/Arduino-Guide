#!/usr/bin/env bash

echo "Installing Arduino CLI..."

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

chmod +x bin/arduino-cli

mv bin/arduino-cli /usr/local/bin/arduino-cli

arduino-cli version

echo "Installing Arduino AVR core..."

arduino-cli core update-index
arduino-cli core install arduino:avr