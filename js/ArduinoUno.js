/*
============================================================
GUIDELINES ARDUINO UNO SIMULATOR
============================================================
*/

const simulator =
    document.getElementById("simulator");

const statusBox =
    document.getElementById("simulatorStatus");

const consoleBox =
    document.getElementById("simulatorConsole");


/*
============================================================
SERVER
============================================================
*/

const GSE_SERVER =
    "https://arduino-guide-6.onrender.com";


/*
============================================================
GSE
============================================================
*/

let gse = null;

const token =
    new URLSearchParams(
        window.location.search
    ).get("gse");


/*
============================================================
SIMULATOR STATE
============================================================
*/

const simulatorState = {
    pins:{},
    analogPins:{},
    serial:[],
    time:0
};


/*
============================================================
STATUS
============================================================
*/

function setStatus(
    text,
    type=""
){

    if(!statusBox){
        return;
    }

    statusBox.textContent =
        text;

    statusBox.className =
        type;

}


/*
============================================================
CONSOLE
============================================================
*/

function simulatorLog(
    text
){

    if(!consoleBox){
        return;
    }

    consoleBox.textContent +=
        text + "\n";

    consoleBox.scrollTop =
        consoleBox.scrollHeight;

}


/*
============================================================
LOAD GSE
============================================================
*/

async function loadGSE(){

    if(!token){

        throw new Error(
            "No GSE token was provided."
        );

    }

    setStatus(
        "Loading GSE..."
    );

    const response =
        await fetch(
            GSE_SERVER +
            "/gse/" +
            encodeURIComponent(token)
        );

    if(!response.ok){

        throw new Error(
            "GSE server returned HTTP " +
            response.status
        );

    }

    const data =
        await response.json();

    if(
        !data ||
        !data.success ||
        !data.executable
    ){

        throw new Error(
            data.error ||
            "Invalid GSE response."
        );

    }

    gse =
        data.executable;

    validateGSE();

    simulatorLog(
        "GSE loaded."
    );

}


/*
============================================================
VALIDATE GSE
============================================================
*/

function validateGSE(){

    if(!gse){

        throw new Error(
            "GSE executable is missing."
        );

    }

    if(
        gse.format !== "GSE"
    ){

        throw new Error(
            "Invalid GSE format."
        );

    }

    if(
        typeof gse.version !== "number"
    ){

        throw new Error(
            "Invalid GSE version."
        );

    }

    if(
        !gse.program
    ){

        throw new Error(
            "GSE program is missing."
        );

    }

    if(
        !Array.isArray(
            gse.program.setup
        )
    ){

        throw new Error(
            "GSE setup is invalid."
        );

    }

    if(
        !Array.isArray(
            gse.program.loop
        )
    ){

        throw new Error(
            "GSE loop is invalid."
        );

    }

}


/*
============================================================
PIN HELPERS
============================================================
*/

function getPin(
    pin
){

    if(
        !simulatorState.pins[pin]
    ){

        simulatorState.pins[pin] = {
            mode:null,
            value:0,
            pwm:0
        };

    }

    return simulatorState.pins[pin];

}


/*
============================================================
PIN MODE
============================================================
*/

function executePinMode(
    instruction
){

    const pin =
        getPin(
            instruction.pin
        );

    pin.mode =
        instruction.mode;

}


/*
============================================================
DIGITAL WRITE
============================================================
*/

function executeDigitalWrite(
    instruction
){

    const pin =
        getPin(
            instruction.pin
        );

    pin.value =
        instruction.value ? 1 : 0;

    updateDigitalPin(
        instruction.pin
    );

}


/*
============================================================
ANALOG WRITE / PWM
============================================================
*/

function executeAnalogWrite(
    instruction
){

    const pin =
        getPin(
            instruction.pin
        );

    let value =
        Number(
            instruction.value
        );

    if(
        Number.isNaN(value)
    ){

        value = 0;

    }

    value =
        Math.max(
            0,
            Math.min(
                255,
                value
            )
        );

    pin.pwm =
        value;

    pin.value =
        value > 0 ? 1 : 0;

    updateAnalogPin(
        instruction.pin
    );

}


/*
============================================================
DIGITAL PIN DISPLAY
============================================================
*/

function updateDigitalPin(
    pinNumber
){

    const element =
        document.querySelector(
            '.digitalPin[data-pin="' +
            pinNumber +
            '"]'
        );

    if(!element){
        return;
    }

    const pin =
        getPin(
            pinNumber
        );

    if(pin.value){

        element.classList.add(
            "high"
        );

    }
    else{

        element.classList.remove(
            "high"
        );

    }

    if(
        Number(pinNumber) === 13
    ){

        updateBuiltinLED(
            pin.value
        );

    }

}


/*
============================================================
BUILT-IN LED
============================================================
*/

function updateBuiltinLED(
    value
){

    const led =
        document.getElementById(
            "builtinLed"
        );

    if(!led){
        return;
    }

    if(value){

        led.classList.add(
            "on"
        );

    }
    else{

        led.classList.remove(
            "on"
        );

    }

}


/*
============================================================
ANALOG / PWM DISPLAY
============================================================
*/

function updateAnalogPin(
    pinNumber
){

    const element =
        document.querySelector(
            '.digitalPin[data-pin="' +
            pinNumber +
            '"]'
        );

    if(!element){
        return;
    }

    const pin =
        getPin(
            pinNumber
        );

    const pwm =
        pin.pwm;

    element.style.opacity =
        pwm === 0
            ? "0.35"
            : String(
                0.35 +
                (pwm / 255) * 0.65
            );

    element.title =
        "PWM: " +
        pwm +
        "/255";

    if(
        Number(pinNumber) === 13
    ){

        updateBuiltinLEDPWM(
            pwm
        );

    }

}


/*
============================================================
BUILT-IN LED PWM
============================================================
*/

function updateBuiltinLEDPWM(
    value
){

    const led =
        document.getElementById(
            "builtinLed"
        );

    if(!led){
        return;
    }

    if(value <= 0){

        led.classList.remove(
            "on"
        );

        led.style.opacity =
            "0.35";

        return;

    }

    led.classList.add(
        "on"
    );

    led.style.opacity =
        String(
            0.25 +
            (value / 255) * 0.75
        );

}


/*
============================================================
DELAY
============================================================
*/

function executeDelay(
    milliseconds
){

    return new Promise(
        resolve => {

            setTimeout(
                resolve,
                Math.max(
                    0,
                    Number(milliseconds) || 0
                )
            );

        }
    );

}


/*
============================================================
EXECUTE INSTRUCTION
============================================================
*/

async function executeInstruction(
    instruction
){

    if(!instruction){
        return;
    }

    switch(
        instruction.op
    ){

        case "PIN_MODE":

            executePinMode(
                instruction
            );

            break;


        case "DIGITAL_WRITE":

            executeDigitalWrite(
                instruction
            );

            break;


        case "ANALOG_WRITE":

            executeAnalogWrite(
                instruction
            );

            break;


        case "DELAY":

            await executeDelay(
                instruction.ms
            );

            simulatorState.time +=
                Number(
                    instruction.ms
                ) || 0;

            break;


        default:

            throw new Error(
                "Unsupported GSE operation: " +
                instruction.op
            );

    }

}


/*
============================================================
EXECUTE PROGRAM
============================================================
*/

async function executeProgram(
    instructions
){

    for(
        const instruction
        of instructions
    ){

        await executeInstruction(
            instruction
        );

    }

}


/*
============================================================
SETUP
============================================================
*/

async function executeSetup(){

    simulatorLog(
        "Running setup..."
    );

    await executeProgram(
        gse.program.setup
    );

    simulatorLog(
        "Setup complete."
    );

}


/*
============================================================
LOOP
============================================================
*/

async function executeLoop(){

    while(true){

        await executeProgram(
            gse.program.loop
        );

    }

}


/*
============================================================
START
============================================================
*/

async function startSimulator(){

    try{

        if(!token){

            setStatus(
                "No GSE token.",
                "error"
            );

            return;

        }

        await loadGSE();

        setStatus(
            "GSE loaded. Starting...",
            "ready"
        );

        await executeSetup();

        setStatus(
            "Simulator running.",
            "ready"
        );

        await executeLoop();

    }
    catch(error){

        console.error(
            "Simulator error:",
            error
        );

        setStatus(
            "Simulator error: " +
            error.message,
            "error"
        );

        simulatorLog(
            "ERROR: " +
            error.message
        );

    }

}


/*
============================================================
START
============================================================
*/

startSimulator();
