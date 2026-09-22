import re


GSE_VERSION = 7


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


BUILTIN_FUNCTIONS = {
    "pinMode",
    "digitalWrite",
    "digitalRead",
    "analogRead",
    "analogWrite",
    "delay",
    "delayMicroseconds",
    "tone",
    "noTone",
    "map"
}


CONTROL_FUNCTIONS = {
    "setup",
    "loop"
}


# ============================================================
# BASIC TEXT HELPERS
# ============================================================

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
    escaped = False

    for char in text:
        if string_char:
            current += char

            if escaped:
                escaped = False
                continue

            if char == "\\":
                escaped = True
                continue

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
    escaped = False
    i = 0

    while i < len(text):
        char = text[i]

        if string_char:
            current += char

            if escaped:
                escaped = False
                i += 1
                continue

            if char == "\\":
                escaped = True
                i += 1
                continue

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

        if (
            depth == 0
            and text.startswith(operator, i)
        ):
            parts.append(
                current.strip()
            )

            current = ""
            i += len(operator)
            continue

        current += char
        i += 1

    parts.append(
        current.strip()
    )

    return parts


# ============================================================
# LIBRARIES / DEFINES
# ============================================================

def parse_include(line):
    line = line.strip()

    if not line.startswith("#include"):
        return None

    library = None

    if "<" in line and ">" in line:
        library = line[
            line.find("<") + 1:
            line.rfind(">")
        ]

    elif '"' in line:
        library = line.split('"')[1]

    if not library:
        raise ValueError(
            "Invalid include statement: "
            + line
        )

    if library not in SUPPORTED_LIBRARIES:
        raise ValueError(
            "Unsupported library: "
            + library
        )

    return {
        "op": "INCLUDE",
        "library": library,
        "system": VIRTUAL_LIBRARIES.get(
            library
        )
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
        "value": parse_expression(
            value
        )
    }


# ============================================================
# VALUES / EXPRESSIONS
# ============================================================

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

    if value is None:
        return {
            "type": "VALUE",
            "value": 0
        }

    value = value.strip()

    if not value:
        return {
            "type": "VALUE",
            "value": 0
        }

    # Remove balanced outer parentheses.
    while (
        value.startswith("(")
        and value.endswith(")")
    ):
        depth = 0
        valid = True

        string_char = None
        escaped = False

        for i, char in enumerate(value):
            if string_char:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == string_char:
                    string_char = None

                continue

            if char in ('"', "'"):
                string_char = char

            elif char == "(":
                depth += 1

            elif char == ")":
                depth -= 1

                if (
                    depth == 0
                    and i != len(value) - 1
                ):
                    valid = False
                    break

        if valid and depth == 0:
            value = value[1:-1].strip()
        else:
            break

    # Logical NOT.
    if value.startswith("!"):
        return {
            "type": "NOT",
            "value": parse_expression(
                value[1:].strip(),
                constants
            )
        }

    # OR.
    parts = split_operator(
        value,
        "||"
    )

    if len(parts) > 1:
        result = parse_expression(
            parts[0],
            constants
        )

        for part in parts[1:]:
            result = {
                "type": "LOGICAL",
                "operator": "||",
                "left": result,
                "right": parse_expression(
                    part,
                    constants
                )
            }

        return result

    # AND.
    parts = split_operator(
        value,
        "&&"
    )

    if len(parts) > 1:
        result = parse_expression(
            parts[0],
            constants
        )

        for part in parts[1:]:
            result = {
                "type": "LOGICAL",
                "operator": "&&",
                "left": result,
                "right": parse_expression(
                    part,
                    constants
                )
            }

        return result

    # Comparisons.
    for operator in (
        "==",
        "!=",
        ">=",
        "<=",
        ">",
        "<"
    ):
        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            right_text = operator.join(
                parts[1:]
            )

            return {
                "type": "COMPARE",
                "operator": operator,
                "left": parse_expression(
                    parts[0],
                    constants
                ),
                "right": parse_expression(
                    right_text,
                    constants
                )
            }

    # Arithmetic.
    for operator in (
        "+",
        "-",
        "*",
        "/"
    ):
        if (
            operator == "-"
            and value.startswith("-")
        ):
            continue

        parts = split_operator(
            value,
            operator
        )

        if len(parts) > 1:
            right_text = operator.join(
                parts[1:]
            )

            return {
                "type": "ARITHMETIC",
                "operator": operator,
                "left": parse_expression(
                    parts[0],
                    constants
                ),
                "right": parse_expression(
                    right_text,
                    constants
                )
            }

    # Function call.
    call_match = re.fullmatch(
        r"([A-Za-z_]\w*(?:\.[A-Za-z_]\w*)?)"
        r"\s*\((.*)\)",
        value,
        re.DOTALL
    )

    if call_match:
        function_name = call_match.group(1)
        argument_text = call_match.group(2).strip()

        if argument_text:
            arguments = [
                parse_expression(
                    arg,
                    constants
                )
                for arg in split_arguments(
                    argument_text
                )
            ]
        else:
            arguments = []

        return {
            "type": "CALL",
            "function": function_name,
            "args": arguments
        }

    return {
        "type": "VALUE",
        "value": parse_value(
            value,
            constants
        )
    }


# ============================================================
# VARIABLES
# ============================================================

VARIABLE_TYPES = (
    r"int|long|float|double|bool|boolean|byte|String|"
    r"unsigned\s+long"
)


def parse_variable(
    line,
    constants=None
):
    line = clean_line(line)
    line = line.rstrip(";").strip()

    match = re.match(
        r"^(?:const\s+)?("
        + VARIABLE_TYPES +
        r")\s+"
        r"([A-Za-z_]\w*)"
        r"(?:\s*=\s*(.*))?$",
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
        r"^([A-Za-z_]\w*)"
        r"\s*"
        r"(\+=|-=|\*=|/=|=|\+\+|--)"
        r"(?:\s*(.*))?$",
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


# ============================================================
# LIBRARY OBJECTS
# ============================================================

def parse_library_declaration(
    line,
    constants=None
):
    line = line.strip()
    line = line.rstrip(";").strip()

    match = re.match(
        r"^Adafruit_SSD1306\s+"
        r"([A-Za-z_]\w*)\s*\((.*)\)$",
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
        r"^LiquidCrystal\s+"
        r"([A-Za-z_]\w*)\s*\((.*)\)$",
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


# ============================================================
# INSTRUCTIONS
# ============================================================

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

    # The simulator treats an infinite Arduino loop as
    # the end of one execution cycle.
    if re.fullmatch(
        r"while\s*\(\s*true\s*\)",
        line
    ):
        return {
            "op": "SIMULATOR_HALT"
        }

    # Return.
    if re.match(
        r"^return(?:\s|;|$)",
        line
    ):
        value = line[
            len("return"):
        ].strip()

        value = value.rstrip(";").strip()

        return {
            "op": "RETURN",
            "value": parse_expression(
                value,
                constants
            )
        }

    # Generic function/method call.
    match = re.fullmatch(
        r"((?:[A-Za-z_]\w*\.)?[A-Za-z_]\w*)"
        r"\s*\((.*)\)\s*;?",
        line,
        re.DOTALL
    )

    if not match:
        raise ValueError(
            "Unsupported GSE instruction: "
            + line
        )

    function = match.group(1)

    args = split_arguments(
        match.group(2)
    )

    # --------------------------------------------------------
    # Arduino GPIO
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Timing
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Tone
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Serial
    # --------------------------------------------------------

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
            "value": (
                parse_expression(
                    args[0],
                    constants
                )
                if args
                else {
                    "type": "VALUE",
                    "value": ""
                }
            )
        }

    if function == "Serial.println":
        return {
            "op": "SERIAL_PRINTLN",
            "value": (
                parse_expression(
                    args[0],
                    constants
                )
                if args
                else {
                    "type": "VALUE",
                    "value": ""
                }
            )
        }

    # --------------------------------------------------------
    # Library object lookup
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # OLED
    # --------------------------------------------------------

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
                "value": (
                    parse_expression(
                        args[0],
                        constants
                    )
                    if args
                    else {
                        "type": "VALUE",
                        "value": ""
                    }
                )
            }

        if method == "println":
            return {
                "op": "OLED_PRINTLN",
                "value": (
                    parse_expression(
                        args[0],
                        constants
                    )
                    if args
                    else {
                        "type": "VALUE",
                        "value": ""
                    }
                )
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

    # --------------------------------------------------------
    # LiquidCrystal
    # --------------------------------------------------------

    if library == "LiquidCrystal":
        raise ValueError(
            "LiquidCrystal runtime support is not enabled yet: "
            + function
        )

    # --------------------------------------------------------
    # USER FUNCTION
    # --------------------------------------------------------

    return {
        "op": "FUNCTION_CALL",
        "function": function,
        "args": [
            parse_expression(
                arg,
                constants
            )
            for arg in args
        ]
    }


# ============================================================
# TOKENIZER
# ============================================================

def tokenize_lines(code):
    raw_lines = code.splitlines()

    cleaned = []

    for raw_line in raw_lines:
        line = raw_line.strip()

        if not line:
            continue

        if line.startswith("//"):
            continue

        line = re.sub(
            r"//.*$",
            "",
            line
        ).strip()

        if line:
            cleaned.append(line)

    # Join lines belonging to a parenthesized expression/call.
    lines = []
    current = ""
    paren_depth = 0
    string_char = None
    escaped = False

    for line in cleaned:
        current += (
            (" " if current else "")
            + line
        )

        for char in line:
            if string_char:
                if escaped:
                    escaped = False
                elif char == "\\":
                    escaped = True
                elif char == string_char:
                    string_char = None
            else:
                if char in ('"', "'"):
                    string_char = char
                elif char == "(":
                    paren_depth += 1
                elif char == ")":
                    paren_depth -= 1

        if paren_depth == 0:
            lines.append(
                current.strip()
            )
            current = ""

    if current.strip():
        lines.append(
            current.strip()
        )

    # Separate braces.
    result = []

    for line in lines:
        line = line.replace(
            "{",
            "\n{\n"
        )

        line = line.replace(
            "}",
            "\n}\n"
        )

        for part in line.splitlines():
            part = part.strip()

            if part:
                result.append(part)

    return result


# ============================================================
# IF / BLOCKS
# ============================================================

def parse_if(
    lines,
    index,
    objects=None,
    constants=None
):
    line = lines[index].strip()

    condition_start = line.find("(")
    condition_end = line.rfind(")")

    if (
        condition_start == -1
        or condition_end == -1
    ):
        raise ValueError(
            "Invalid if condition: "
            + line
        )

    condition_text = line[
        condition_start + 1:
        condition_end
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

        if next_line.startswith("else if"):
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

    return [
        {
            "op": "IF",
            "condition": condition,
            "then": then_block,
            "else": else_block
        }
    ], index


def parse_block(
    lines,
    index=0,
    objects=None,
    constants=None
):
    if constants is None:
        constants = {}

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
                index < len(lines)
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
            instructions.append(
                include
            )
            index += 1
            continue

        define = parse_define(line)

        if define is not None:
            constants[
                define["name"]
            ] = define["value"]

            instructions.append(
                define
            )

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
            instructions.append(
                variable
            )

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


# ============================================================
# FUNCTION EXTRACTION
# ============================================================

FUNCTION_RETURN_TYPES = (
    r"void|int|long|float|double|"
    r"bool|boolean|byte|"
    r"unsigned\s+long"
)


def find_matching_brace(
    source,
    opening_position
):
    depth = 1
    position = opening_position

    string_char = None
    escaped = False

    while position < len(source):
        char = source[position]

        if string_char:
            if escaped:
                escaped = False

            elif char == "\\":
                escaped = True

            elif char == string_char:
                string_char = None

        else:
            if char in ('"', "'"):
                string_char = char

            elif char == "{":
                depth += 1

            elif char == "}":
                depth -= 1

                if depth == 0:
                    return position

        position += 1

    return -1


def parse_function_parameters(
    parameters,
    function_name
):
    parameter_list = []

    if not parameters.strip():
        return parameter_list

    for parameter in split_arguments(
        parameters
    ):
        parameter = parameter.strip()

        # Remove default value.
        parameter = re.sub(
            r"\s*=\s*.*$",
            "",
            parameter
        ).strip()

        # Remove const/reference/pointer markers.
        parameter = parameter.replace(
            "const ",
            ""
        )

        parameter = parameter.replace(
            "&",
            " "
        )

        parameter = parameter.replace(
            "*",
            " "
        )

        parameter = re.sub(
            r"\s+",
            " ",
            parameter
        ).strip()

        match = re.match(
            r"^(.+?)\s+"
            r"([A-Za-z_]\w*)$",
            parameter
        )

        if not match:
            raise ValueError(
                "Invalid parameter in "
                + function_name
                + ": "
                + parameter
            )

        parameter_list.append({
            "type": match.group(1).strip(),
            "name": match.group(2)
        })

    return parameter_list


def find_functions(source):
    pattern = re.compile(
        r"\b("
        + FUNCTION_RETURN_TYPES +
        r")\s+"
        r"([A-Za-z_]\w*)"
        r"\s*\((.*?)\)\s*\{",
        re.DOTALL
    )

    functions = {}

    for match in pattern.finditer(source):
        return_type = match.group(1)
        name = match.group(2)
        parameters = match.group(3)

        body_start = match.end()

        body_end = find_matching_brace(
            source,
            body_start
        )

        if body_end == -1:
            raise ValueError(
                "Unclosed function: "
                + name
            )

        if name in functions:
            raise ValueError(
                "Duplicate function: "
                + name
            )

        parameter_list = parse_function_parameters(
            parameters,
            name
        )

        functions[name] = {
            "name": name,
            "return_type": return_type,
            "parameters": parameter_list,
            "code": source[
                body_start:
                body_end
            ],
            "start": match.start(),
            "end": body_end + 1
        }

    return functions


# ============================================================
# GLOBAL CODE
# ============================================================

def remove_function_bodies(
    source,
    functions
):
    if not functions:
        return source

    ranges = sorted(
        (
            function["start"],
            function["end"]
        )
        for function in functions.values()
    )

    result = []
    position = 0

    for start, end in ranges:
        result.append(
            source[position:start]
        )

        result.append("\n")

        position = end

    result.append(
        source[position:]
    )

    return "".join(result)


def parse_global_code(
    source,
    functions
):
    source_without_functions = remove_function_bodies(
        source,
        functions
    )

    libraries = []
    objects = []
    constants = {}
    global_variables = []

    # --------------------------------------------------------
    # Includes
    # --------------------------------------------------------

    for match in re.finditer(
        r"#include\s*[<\"]([^>\"]+)[>\"]",
        source_without_functions
    ):
        library = match.group(1)

        if library not in SUPPORTED_LIBRARIES:
            raise ValueError(
                "Unsupported library: "
                + library
            )

        if library not in libraries:
            libraries.append(library)

    # --------------------------------------------------------
    # Defines
    # --------------------------------------------------------

    for match in re.finditer(
        r"^\s*#define\s+(\w+)\s+(.+)$",
        source_without_functions,
        re.MULTILINE
    ):
        name = match.group(1)
        value = match.group(2).strip()

        constants[name] = parse_value(
            value,
            constants
        )

    # --------------------------------------------------------
    # Tokenize remaining global code.
    # --------------------------------------------------------

    lines = tokenize_lines(
        source_without_functions
    )

    for line in lines:
        line = line.strip()

        if not line:
            continue

        if line in ("{", "}"):
            continue

        if line.startswith("#include"):
            continue

        if line.startswith("#define"):
            continue

        library_object = parse_library_declaration(
            line,
            constants
        )

        if library_object is not None:
            objects.append(
                library_object
            )
            continue

        variable = parse_variable(
            line,
            constants
        )

        if variable is not None:
            global_variables.append(
                variable
            )
            continue

        # Ignore anything that is not a supported
        # global declaration.
        #
        # This prevents function declarations or random
        # unsupported global syntax from accidentally
        # entering setup.

    return (
        libraries,
        objects,
        constants,
        global_variables
    )


# ============================================================
# FUNCTION COMPILATION
# ============================================================

def compile_function(
    code,
    objects=None,
    constants=None
):
    if constants is None:
        constants = {}

    lines = tokenize_lines(
        code
    )

    instructions, index = parse_block(
        lines,
        0,
        objects,
        constants
    )

    if index < len(lines):
        raise ValueError(
            "Unexpected code near: "
            + lines[index]
        )

    return instructions


# ============================================================
# MAIN COMPILER
# ============================================================

def compile_gse(
    source,
    board="arduino:avr:uno"
):
    if not source or not source.strip():
        raise ValueError(
            "No Arduino source code provided."
        )

    # --------------------------------------------------------
    # Find every user function first.
    # --------------------------------------------------------

    functions = find_functions(
        source
    )

    if "setup" not in functions:
        raise ValueError(
            "Missing setup()"
        )

    if "loop" not in functions:
        raise ValueError(
            "Missing loop()"
        )

    # --------------------------------------------------------
    # Global declarations / libraries / constants.
    # --------------------------------------------------------

    (
        libraries,
        objects,
        constants,
        global_variables
    ) = parse_global_code(
        source,
        functions
    )

    # --------------------------------------------------------
    # Compile setup.
    #
    # Global declarations are placed before setup so the
    # existing JavaScript runtime can initialize them through
    # normal DECLARE instructions before setup starts.
    # --------------------------------------------------------

    setup_body = compile_function(
        functions["setup"]["code"],
        objects,
        constants.copy()
    )

    setup = []

    for variable in global_variables:
        setup.append(
            variable
        )

    setup.extend(
        setup_body
    )

    # --------------------------------------------------------
    # Compile loop.
    # --------------------------------------------------------

    loop = compile_function(
        functions["loop"]["code"],
        objects,
        constants.copy()
    )

    # --------------------------------------------------------
    # Compile user functions.
    # --------------------------------------------------------

    compiled_functions = {}

    for name, function in functions.items():
        if name in CONTROL_FUNCTIONS:
            continue

        compiled_functions[name] = {
            "name": name,
            "return_type": function[
                "return_type"
            ],
            "parameters": function[
                "parameters"
            ],
            "program": compile_function(
                function["code"],
                objects,
                constants.copy()
            )
        }

    # --------------------------------------------------------
    # Final GSE.
    # --------------------------------------------------------

    return {
        "format": "GSE",
        "version": GSE_VERSION,
        "board": board,

        "libraries": libraries,

        "virtual_libraries": {
            library:
                VIRTUAL_LIBRARIES[library]
            for library in libraries
            if library in VIRTUAL_LIBRARIES
        },

        "constants": constants,

        "objects": objects,

        "globals": [
            {
                "name": variable["name"],
                "type": variable["type"],
                "value": variable["value"]
            }
            for variable in global_variables
        ],

        "functions": compiled_functions,

        "program": {
            "setup": setup,
            "loop": loop
        }
    }
