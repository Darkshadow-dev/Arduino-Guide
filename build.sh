#!/usr/bin/env bash

echo "Installing Arduino CLI..."

curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh

mv bin/arduino-cli /usr/local/bin/arduino-cli

arduino-cli version
