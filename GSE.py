import re


GSE_VERSION = 5


SUPPORTED_LIBRARIES = {
    "Wire.h",
    "Adafruit_GFX.h",
    "Adafruit_SSD1306.h",
    "LiquidCrystal.h"
}


VIRTUAL_LIBRARIES = {
    "Adafruit_GFX.h": "OLED4",
    "Adafruit_SSD1306.h": "OLED4"
}


BUILTIN_VALUES = {
    "HIGH": 1,
    "LOW": 0,
    "OUTPUT": "OUTPUT",
    "INPUT": "INPUT",
    "INPUT_PULLUP": "INPUT_PULLUP",
    "LED_BUILTIN": 13,

    "SSD1306_SWITCHCAPVCC": 2,
    "SSD1306_WHITE": 1,
    "SSD1306_BLACK": 0
}


def clean_line(line):
    line = line.strip()

    if not line:
        return ""

    if line.startswith("//"):
        return ""

    line = re.sub(
        r"//.*$",
        "",
        line
    ).strip()

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


def split_operator(text, operator):
    parts = []
    current = ""
    depth = 0
    string_char = None
    i = 0

    while i < len(text):
        char = text[i]

        if string_char:
            current += char

            if char == string_char:
                string_char = None

            i += 1
            continue

        if char in ('"', "'"):
            string_char = char
            current += char
            i += 1
            continue

        if char == "(":
            depth += 1
            current += char
            i += 1
            continue

        if char == ")":
            depth -= 1
            current += char
            i += 1
            continue

        if depth == 0 and text.startswith(
            operator,
            i
        ):
            parts.append(current.strip())
            current = ""
            i += len(operator)
            continue

        current += char
        i += 1

    parts.append(current.strip())

    return parts


def parse_include(line):
    line = line.strip()

    if not line.startswith("#include"):
        return None

    if "<" in line and ">" in line:
        library = line[
            line.find("<") + 1:
            line.rfind(">")
        ]

    elif '"' in line:
        library = line.split('"')[1]

    else:
        raise ValueError(
            "Invalid include statement: " + line
        )

    if library not in SUPPORTED_LIBRARIES:
        raise ValueError(
            "Unsupported library: " + library
        )

    return {
        "op": "INCLUDE",
        "library": library,
        "system": VIRTUAL_LIBRARIES.get(library)
    }


def parse_define(line):
    line = line.strip()

    match = re.match(
        r"^#define\s+(\w+)\s+(.+)$",
        line
    )

    if not match:
        return None

    name = match.group(1)
    value = match.group(2).strip()

    return {
        "op": "DEFINE",
        "name": name,
        "value": parse_value(value)
    }


def parse_library_declaration(
    line,
    constants=None
):
    line = line.strip().rstrip(";").strip()

    match = re.match(
        r"^Adafruit_SSD1306\s+(\w+)\s*\((.*)\)$",
        line,
        re.DOTALL
    )

    if match:
        return {
            "op": "LIBRARY_OBJECT",
            "library": "Adafruit_SSD1306",
            "system": "OLED4",
            "object": match.group(1),
            "args": [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    match.group(2)
                )
            ]
        }

    match = re.match(
        r"^LiquidCrystal\s+(\w+)\s*\((.*)\)$",
        line,
        re.DOTALL
    )

    if match:
        return {
            "op": "LIBRARY_OBJECT",
            "library": "LiquidCrystal",
            "system": None,
            "object": match.group(1),
            "args": [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    match.group(2)
                )
            ]
        }

    return None


def parse_value(
    value,
    constants=None
):
    value = value.strip()

    if constants is None:
        constants = {}

    if value in constants:
        return constants[value]

    if value in BUILTIN_VALUES:
        return BUILTIN_VALUES[value]

    if value == "true":
        return 1

    if value == "false":
        return 0

    if value == "&Wire":
        return "Wire"

    if value == "Wire":
        return "Wire"

    if len(value) >= 2:
        if (
            value[0] == '"'
            and value[-1] == '"'
        ):
            return value[1:-1]

        if (
            value[0] == "'"
            and value[-1] == "'"
        ):
            return value[1:-1]

    if re.fullmatch(
        r"-?\d+",
        value
    ):
        return int(value)

    if re.fullmatch(
        r"-?\d+\.\d+",
        value
    ):
        return float(value)

    if re.fullmatch(
        r"0[xX][0-9a-fA-F]+",
        value
    ):
        return int(value, 16)

    return value


def parse_expression(
    value,
    constants=None
):
    if constants is None:
        constants = {}

    value = value.strip()

    if not value:
        return {
            "type": "VALUE",
            "value": 0
        }

    while (
        value.startswith("(")
        and value.endswith(")")
    ):
        depth = 0
        valid = True

        for i, char in enumerate(value):
            if char == "(":
                depth += 1

            elif char == ")":
                depth -= 1

                if (
                    depth == 0
                    and i != len(value) - 1
                ):
                    valid = False
                    break

        if valid:
            value = value[1:-1].strip()

        else:
            break

    if value.startswith("!"):
        return {
            "type": "NOT",
            "value": parse_expression(
                value[1:],
                constants
            )
        }

    for operator in ["||"]:
        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            result = parse_expression(
                parts[0],
                constants
            )

            for part in parts[1:]:
                result = {
                    "type": "LOGICAL",
                    "operator": operator,
                    "left": result,
                    "right": parse_expression(
                        part,
                        constants
                    )
                }

            return result

    for operator in ["&&"]:
        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            result = parse_expression(
                parts[0],
                constants
            )

            for part in parts[1:]:
                result = {
                    "type": "LOGICAL",
                    "operator": operator,
                    "left": result,
                    "right": parse_expression(
                        part,
                        constants
                    )
                }

            return result

    for operator in [
        "==",
        "!=",
        ">=",
        "<=",
        ">",
        "<"
    ]:
        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            return {
                "type": "COMPARE",
                "operator": operator,
                "left": parse_expression(
                    parts[0],
                    constants
                ),
                "right": parse_expression(
                    operator.join(parts[1:]),
                    constants
                )
            }

    for operator in [
        "+",
        "-",
        "*",
        "/"
    ]:
        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            return {
                "type": "ARITHMETIC",
                "operator": operator,
                "left": parse_expression(
                    parts[0],
                    constants
                ),
                "right": parse_expression(
                    operator.join(parts[1:]),
                    constants
                )
            }

    call_match = re.fullmatch(
        r"(\w+(?:\.\w+)?)\s*\((.*)\)",
        value,
        re.DOTALL
    )

    if call_match:
        return {
            "type": "CALL",
            "function": call_match.group(1),
            "args": [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    call_match.group(2)
                )
            ]
        }

    return {
        "type": "VALUE",
        "value": parse_value(
            value,
            constants
        )
    }


def parse_variable(
    line,
    constants=None
):
    line = clean_line(line)
    line = line.rstrip(";").strip()

    match = re.match(
        r"^(int|long|float|double|bool|boolean|byte|String|unsigned(?:\s+long)?)\s+(\w+)(?:\s*=\s*(.*))?$",
        line
    )

    if match:
        variable_type = match.group(1)
        name = match.group(2)
        value = match.group(3)

        return {
            "op": "DECLARE",
            "type": variable_type,
            "name": name,
            "value": parse_expression(
                value,
                constants
            )
            if value is not None
            else {
                "type": "VALUE",
                "value": 0
            }
        }

    match = re.match(
        r"^(\w+)\s*(\+=|-=|\*=|/=|=|\+\+|--)\s*(.*)$",
        line
    )

    if match:
        return {
            "op": "ASSIGN",
            "name": match.group(1),
            "operator": match.group(2),
            "value": parse_expression(
                match.group(3),
                constants
            )
            if match.group(3)
            else None
        }

    return None


def parse_instruction(
    line,
    objects=None,
    constants=None
):
    line = clean_line(line)

    if not line:
        return None

    if line in ("{", "}"):
        return None

    if re.fullmatch(
        r"while\s*\(\s*true\s*\)",
        line
    ):
        return {
            "op": "SIMULATOR_HALT"
        }

    match = re.match(
        r"((?:\w+\.)?\w+)\s*\((.*)\)\s*;?$",
        line,
        re.DOTALL
    )

    if not match:
        raise ValueError(
            "Unsupported GSE instruction: " + line
        )

    function = match.group(1)
    args = split_arguments(
        match.group(2)
    )

    if function == "pinMode":
        if len(args) != 2:
            raise ValueError(
                "pinMode requires 2 arguments"
            )

        return {
            "op": "PIN_MODE",
            "pin": parse_expression(
                args[0],
                constants
            ),
            "mode": parse_expression(
                args[1],
                constants
            )
        }

    if function == "digitalWrite":
        if len(args) != 2:
            raise ValueError(
                "digitalWrite requires 2 arguments"
            )

        return {
            "op": "DIGITAL_WRITE",
            "pin": parse_expression(
                args[0],
                constants
            ),
            "value": parse_expression(
                args[1],
                constants
            )
        }

    if function == "digitalRead":
        if len(args) != 1:
            raise ValueError(
                "digitalRead requires 1 argument"
            )

        return {
            "op": "DIGITAL_READ",
            "pin": parse_expression(
                args[0],
                constants
            )
        }

    if function == "analogRead":
        if len(args) != 1:
            raise ValueError(
                "analogRead requires 1 argument"
            )

        return {
            "op": "ANALOG_READ",
            "pin": parse_expression(
                args[0],
                constants
            )
        }

    if function == "analogWrite":
        if len(args) != 2:
            raise ValueError(
                "analogWrite requires 2 arguments"
            )

        return {
            "op": "ANALOG_WRITE",
            "pin": parse_expression(
                args[0],
                constants
            ),
            "value": parse_expression(
                args[1],
                constants
            )
        }

    if function == "delay":
        if len(args) != 1:
            raise ValueError(
                "delay requires 1 argument"
            )

        return {
            "op": "DELAY",
            "ms": parse_expression(
                args[0],
                constants
            )
        }

    if function == "delayMicroseconds":
        if len(args) != 1:
            raise ValueError(
                "delayMicroseconds requires 1 argument"
            )

        return {
            "op": "DELAY_US",
            "us": parse_expression(
                args[0],
                constants
            )
        }

    if function == "tone":
        if len(args) < 2:
            raise ValueError(
                "tone requires at least 2 arguments"
            )

        instruction = {
            "op": "TONE",
            "pin": parse_expression(
                args[0],
                constants
            ),
            "frequency": parse_expression(
                args[1],
                constants
            )
        }

        if len(args) >= 3:
            instruction["duration"] = parse_expression(
                args[2],
                constants
            )

        return instruction

    if function == "noTone":
        if len(args) != 1:
            raise ValueError(
                "noTone requires 1 argument"
            )

        return {
            "op": "NO_TONE",
            "pin": parse_expression(
                args[0],
                constants
            )
        }

    if function == "Serial.begin":
        if len(args) != 1:
            raise ValueError(
                "Serial.begin requires 1 argument"
            )

        return {
            "op": "SERIAL_BEGIN",
            "baud": parse_expression(
                args[0],
                constants
            )
        }

    if function == "Serial.print":
        return {
            "op": "SERIAL_PRINT",
            "value": parse_expression(
                args[0],
                constants
            )
            if args
            else {
                "type": "VALUE",
                "value": ""
            }
        }

    if function == "Serial.println":
        return {
            "op": "SERIAL_PRINTLN",
            "value": parse_expression(
                args[0],
                constants
            )
            if args
            else {
                "type": "VALUE",
                "value": ""
            }
        }

    object_libraries = {}

    if objects:
        for obj in objects:
            object_libraries[
                obj["object"]
            ] = obj["library"]

    object_name = None
    method = function

    if "." in function:
        object_name, method = function.split(
            ".",
            1
        )

    library = object_libraries.get(
        object_name
    )

    if library == "Adafruit_SSD1306":

        if method == "begin":
            if len(args) < 1:
                raise ValueError(
                    "OLED4 begin requires arguments"
                )

            return {
                "op": "OLED_BEGIN",
                "args": [
                    parse_expression(
                        arg,
                        constants
                    )
                    for arg in args
                ]
            }

        if method == "clearDisplay":
            if args:
                raise ValueError(
                    "OLED4 clearDisplay requires no arguments"
                )

            return {
                "op": "OLED_CLEAR"
            }

        if method == "display":
            if args:
                raise ValueError(
                    "OLED4 display requires no arguments"
                )

            return {
                "op": "OLED_DISPLAY"
            }

        if method == "setTextSize":
            if len(args) != 1:
                raise ValueError(
                    "OLED4 setTextSize requires 1 argument"
                )

            return {
                "op": "OLED_TEXT_SIZE",
                "value": parse_expression(
                    args[0],
                    constants
                )
            }

        if method == "setTextColor":
            if len(args) != 1:
                raise ValueError(
                    "OLED4 setTextColor requires 1 argument"
                )

            return {
                "op": "OLED_TEXT_COLOR",
                "value": parse_expression(
                    args[0],
                    constants
                )
            }

        if method == "setCursor":
            if len(args) != 2:
                raise ValueError(
                    "OLED4 setCursor requires 2 arguments"
                )

            return {
                "op": "OLED_CURSOR",
                "x": parse_expression(
                    args[0],
                    constants
                ),
                "y": parse_expression(
                    args[1],
                    constants
                )
            }

        if method == "print":
            return {
                "op": "OLED_PRINT",
                "value": parse_expression(
                    args[0],
                    constants
                )
                if args
                else {
                    "type": "VALUE",
                    "value": ""
                }
            }

        if method == "println":
            return {
                "op": "OLED_PRINTLN",
                "value": parse_expression(
                    args[0],
                    constants
                )
                if args
                else {
                    "type": "VALUE",
                    "value": ""
                }
            }

        if method == "drawPixel":
            if len(args) != 3:
                raise ValueError(
                    "OLED4 drawPixel requires 3 arguments"
                )

            return {
                "op": "OLED_PIXEL",
                "x": parse_expression(
                    args[0],
                    constants
                ),
                "y": parse_expression(
                    args[1],
                    constants
                ),
                "color": parse_expression(
                    args[2],
                    constants
                )
            }

        if method == "drawLine":
            if len(args) != 5:
                raise ValueError(
                    "OLED4 drawLine requires 5 arguments"
                )

            return {
                "op": "OLED_LINE",
                "x1": parse_expression(
                    args[0],
                    constants
                ),
                "y1": parse_expression(
                    args[1],
                    constants
                ),
                "x2": parse_expression(
                    args[2],
                    constants
                ),
                "y2": parse_expression(
                    args[3],
                    constants
                ),
                "color": parse_expression(
                    args[4],
                    constants
                )
            }

        if method == "fillRect":
            if len(args) != 5:
                raise ValueError(
                    "OLED4 fillRect requires 5 arguments"
                )

            return {
                "op": "OLED_RECT",
                "x": parse_expression(
                    args[0],
                    constants
                ),
                "y": parse_expression(
                    args[1],
                    constants
                ),
                "width": parse_expression(
                    args[2],
                    constants
                ),
                "height": parse_expression(
                    args[3],
                    constants
                ),
                "color": parse_expression(
                    args[4],
                    constants
                )
            }

        raise ValueError(
            "Unsupported OLED4 function: "
            + function
        )

    if library == "LiquidCrystal":
        raise ValueError(
            "LiquidCrystal runtime support is not enabled yet: "
            + function
        )

    raise ValueError(
        "Unsupported Arduino function: "
        + function
    )


def tokenize_lines(code):
    code = re.sub(
        r"//.*$",
        "",
        code,
        flags=re.MULTILINE
    )

    code = code.replace(
        "{",
        "\n{\n"
    )

    code = code.replace(
        "}",
        "\n}\n"
    )

    return [
        line.strip()
        for line in code.splitlines()
        if line.strip()
    ]


def parse_if(
    lines,
    index,
    objects=None,
    constants=None
):
    line = lines[index].strip()

    condition_text = line[
        line.find("(") + 1:
        line.rfind(")")
    ]

    condition = parse_expression(
        condition_text,
        constants
    )

    index += 1

    if (
        index >= len(lines)
        or lines[index].strip() != "{"
    ):
        raise ValueError(
            "Expected { after if condition."
        )

    then_block, index = parse_block(
        lines,
        index + 1,
        objects,
        constants
    )

    else_block = []

    if index < len(lines):
        next_line = lines[index].strip()

        if next_line.startswith(
            "else if"
        ):
            else_block, index = parse_if(
                lines,
                index,
                objects,
                constants
            )

        elif next_line == "else":
            index += 1

            if (
                index >= len(lines)
                or lines[index].strip() != "{"
            ):
                raise ValueError(
                    "Expected { after else."
                )

            else_block, index = parse_block(
                lines,
                index + 1,
                objects,
                constants
            )

    return [{
        "op": "IF",
        "condition": condition,
        "then": then_block,
        "else": else_block
    }], index


def parse_block(
    lines,
    index=0,
    objects=None,
    constants=None
):
    instructions = []

    while index < len(lines):
        line = lines[index].strip()

        if line == "}":
            return instructions, index + 1

        if re.match(
            r"^if\s*\(",
            line
        ):
            parsed, index = parse_if(
                lines,
                index,
                objects,
                constants
            )

            instructions.extend(parsed)
            continue

        if re.fullmatch(
            r"while\s*\(\s*true\s*\)",
            line
        ):
            instructions.append({
                "op": "SIMULATOR_HALT"
            })

            index += 1

            if (
                index + 1 < len(lines)
                and lines[index].strip() == "{"
            ):
                _, index = parse_block(
                    lines,
                    index + 1,
                    objects,
                    constants
                )

            continue

        include = parse_include(line)

        if include is not None:
            instructions.append(include)
            index += 1
            continue

        define = parse_define(line)

        if define is not None:
            constants[
                define["name"]
            ] = define["value"]

            instructions.append(define)
            index += 1
            continue

        library_object = parse_library_declaration(
            line,
            constants
        )

        if library_object is not None:
            instructions.append(
                library_object
            )

            index += 1
            continue

        variable = parse_variable(
            line,
            constants
        )

        if variable is not None:
            instructions.append(variable)
            index += 1
            continue

        instruction = parse_instruction(
            line,
            objects,
            constants
        )

        if instruction is not None:
            instructions.append(
                instruction
            )

        index += 1

    return instructions, index


def extract_function(
    code,
    name
):
    pattern = re.compile(
        r"\b"
        + re.escape(name)
        + r"\s*\(\s*\)\s*\{",
        re.MULTILINE
    )

    match = pattern.search(code)

    if not match:
        raise ValueError(
            "Missing "
            + name
            + "()"
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
                return code[
                    start:position
                ]

        position += 1

    raise ValueError(
        "Unclosed "
        + name
        + "()"
    )


def compile_function(
    code,
    objects=None,
    constants=None
):
    lines = tokenize_lines(code)

    instructions, index = parse_block(
        lines,
        objects=objects,
        constants=constants
    )

    if index < len(lines):
        raise ValueError(
            "Unexpected code near: "
            + lines[index]
        )

    return instructions


def parse_global_code(source):
    source = re.sub(
        r"//.*$",
        "",
        source,
        flags=re.MULTILINE
    )

    libraries = []
    objects = []
    constants = {}

    for match in re.finditer(
        r"^\s*#define\s+(\w+)\s+(.+)$",
        source,
        re.MULTILINE
    ):
        name = match.group(1)
        value = match.group(2).strip()

        constants[name] = parse_value(
            value,
            constants
        )

    for match in re.finditer(
        r"#include\s*[<\"]([^>\"]+)[>\"]",
        source
    ):
        library = match.group(1)

        if library not in SUPPORTED_LIBRARIES:
            raise ValueError(
                "Unsupported library: "
                + library
            )

        if library not in libraries:
            libraries.append(library)

    for match in re.finditer(
        r"Adafruit_SSD1306\s+(\w+)\s*\((.*?)\)\s*;",
        source,
        re.DOTALL
    ):
        objects.append({
            "op": "LIBRARY_OBJECT",
            "library": "Adafruit_SSD1306",
            "system": "OLED4",
            "object": match.group(1),
            "args": [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    match.group(2)
                )
            ]
        })

    for match in re.finditer(
        r"LiquidCrystal\s+(\w+)\s*\((.*?)\)\s*;",
        source,
        re.DOTALL
    ):
        objects.append({
            "op": "LIBRARY_OBJECT",
            "library": "LiquidCrystal",
            "system": None,
            "object": match.group(1),
            "args": [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    match.group(2)
                )
            ]
        })

    return (
        libraries,
        objects,
        constants
    )


def compile_gse(
    source,
    board="arduino:avr:uno"
):
    if not source.strip():
        raise ValueError(
            "No Arduino source code provided."
        )

    (
        libraries,
        objects,
        constants
    ) = parse_global_code(
        source
    )

    setup_code = extract_function(
        source,
        "setup"
    )

    loop_code = extract_function(
        source,
        "loop"
    )

    setup = compile_function(
        setup_code,
        objects,
        constants.copy()
    )

    loop = compile_function(
        loop_code,
        objects,
        constants.copy()
    )

    return {
        "format": "GSE",
        "version": GSE_VERSION,
        "board": board,

        "libraries": libraries,

        "virtual_libraries": {
            library: VIRTUAL_LIBRARIES[library]
            for library in libraries
            if library in VIRTUAL_LIBRARIES
        },

        "constants": constants,

        "objects": objects,

        "program": {
            "setup": setup,
            "loop": loop
        }
    }
