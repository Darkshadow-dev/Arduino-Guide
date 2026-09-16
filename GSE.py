
import re


GSE_VERSION = 1


def clean_line(line):
    line = line.strip()

    if not line:
        return ""

    if line.startswith("//"):
        return ""

    line = re.sub(r"//.*$", "", line).strip()

    return line


def split_arguments(text):
    args = []
    current = ""
    depth = 0
    string_char = None

    for char in text:
        if string_char:
            current += char

            if char == string_char:
                string_char = None

            continue

        if char in ('"', "'"):
            string_char = char
            current += char

        elif char == "(":
            depth += 1
            current += char

        elif char == ")":
            depth -= 1
            current += char

        elif char == "," and depth == 0:
            args.append(current.strip())
            current = ""

        else:
            current += char

    if current.strip():
        args.append(current.strip())

    return args


def parse_value(value):
    value = value.strip()

    if value == "HIGH":
        return 1

    if value == "LOW":
        return 0

    if value == "OUTPUT":
        return "OUTPUT"

    if value == "INPUT":
        return "INPUT"

    if value == "INPUT_PULLUP":
        return "INPUT_PULLUP"

    if value == "LED_BUILTIN":
        return 13

    if re.fullmatch(r"-?\d+", value):
        return int(value)

    if re.fullmatch(r"-?\d+\.\d+", value):
        return float(value)

    return value


def parse_instruction(line):
    line = clean_line(line)

    if not line:
        return None

    if line in ("{", "}"):
        return None

    match = re.match(
        r"((?:\w+\.)?\w+)\s*\((.*)\)\s*;?$",
        line
    )

    if not match:
        raise ValueError(
            "Unsupported GSE instruction: " + line
        )

    function = match.group(1)
    args = split_arguments(match.group(2))

    if function == "pinMode":
        if len(args) != 2:
            raise ValueError("pinMode requires 2 arguments")

        return {
            "op": "PIN_MODE",
            "pin": parse_value(args[0]),
            "mode": parse_value(args[1])
        }

    if function == "digitalWrite":
        if len(args) != 2:
            raise ValueError("digitalWrite requires 2 arguments")

        return {
            "op": "DIGITAL_WRITE",
            "pin": parse_value(args[0]),
            "value": parse_value(args[1])
        }

    if function == "digitalRead":
        if len(args) != 1:
            raise ValueError("digitalRead requires 1 argument")

        return {
            "op": "DIGITAL_READ",
            "pin": parse_value(args[0])
        }

    if function == "analogRead":
        if len(args) != 1:
            raise ValueError("analogRead requires 1 argument")

        return {
            "op": "ANALOG_READ",
            "pin": parse_value(args[0])
        }

    if function == "analogWrite":
        if len(args) != 2:
            raise ValueError("analogWrite requires 2 arguments")

        return {
            "op": "ANALOG_WRITE",
            "pin": parse_value(args[0]),
            "value": parse_value(args[1])
        }

    if function == "delay":
        if len(args) != 1:
            raise ValueError("delay requires 1 argument")

        return {
            "op": "DELAY",
            "ms": parse_value(args[0])
        }

    if function == "delayMicroseconds":
        if len(args) != 1:
            raise ValueError(
                "delayMicroseconds requires 1 argument"
            )

        return {
            "op": "DELAY_US",
            "us": parse_value(args[0])
        }

    if function == "tone":
        if len(args) < 2:
            raise ValueError("tone requires at least 2 arguments")

        instruction = {
            "op": "TONE",
            "pin": parse_value(args[0]),
            "frequency": parse_value(args[1])
        }

        if len(args) >= 3:
            instruction["duration"] = parse_value(args[2])

        return instruction

    if function == "noTone":
        if len(args) != 1:
            raise ValueError("noTone requires 1 argument")

        return {
            "op": "NO_TONE",
            "pin": parse_value(args[0])
        }

    if function == "Serial.begin":
        return {
            "op": "SERIAL_BEGIN",
            "baud": parse_value(args[0])
        }

    if function in ("print", "println"):
        return {
            "op": "SERIAL_PRINT" if function == "print"
                    else "SERIAL_PRINTLN",
            "value": args[0] if args else ""
        }

    return None


def extract_function(code, name):
    pattern = re.compile(
        r"\b" + re.escape(name) +
        r"\s*\(\s*\)\s*\{",
        re.MULTILINE
    )

    match = pattern.search(code)

    if not match:
        raise ValueError(
            "Missing " + name + "()"
        )

    start = match.end()

    depth = 1
    position = start

    while position < len(code):

        if code[position] == "{":
            depth += 1

        elif code[position] == "}":
            depth -= 1

            if depth == 0:
                return code[start:position]

        position += 1

    raise ValueError(
        "Unclosed " + name + "()"
    )


def compile_function(code):
    instructions = []

    lines = code.splitlines()

    for line in lines:

        line = clean_line(line)

        if not line:
            continue

        if line in ("{", "}"):
            continue

        # Variable declarations are not supported yet.
        if re.match(
            r"^(int|long|float|double|bool|boolean|byte|String|unsigned)\b",
            line
        ):
            raise ValueError(
                "Variables are not supported by GSE yet: " +
                line
            )

        # if / loops are not supported yet.
        if re.match(
            r"^(if|else|for|while|do|switch)\b",
            line
        ):
            raise ValueError(
                "Control structures are not supported by GSE yet: " +
                line
            )

        instruction = parse_instruction(line)

        if instruction:
            instructions.append(instruction)

    return instructions


def compile_gse(source, board="arduino:avr:uno"):
    setup_code = extract_function(source, "setup")
    loop_code = extract_function(source, "loop")

    setup = compile_function(setup_code)
    loop = compile_function(loop_code)

    return {
        "format": "GSE",
        "version": GSE_VERSION,
        "board": board,
        "program": {
            "setup": setup,
            "loop": loop
        }
    }
