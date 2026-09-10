/*
============================================================
ARDUINO UNO SIMULATOR
============================================================
*/

const simulator =
    document.getElementById("simulator");

const compiledCode =
    localStorage.getItem("arduino_compiled_code");

const pins = {};


/*
============================================================
COMPONENT SYSTEM
============================================================
*/

const components = [];


function registerComponent(component){

    components.push(component);

}


/*
============================================================
PIN STATE
============================================================
*/

function setPin(pin,value){

    pin = String(pin);

    pins[pin] = value;

    for(const component of components){

        if(component.setPin){

            component.setPin(
                pin,
                value
            );

        }

    }

}


/*
============================================================
GET PIN
============================================================
*/

function getPin(pin){

    return pins[String(pin)] ?? 0;

}


/*
============================================================
DELAY
============================================================
*/

function delay(ms){

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );

}


/*
============================================================
GET FUNCTION BODY
============================================================
*/

function getFunctionBody(source,name){

    const match =
        source.match(
            new RegExp(
                "void\\s+" +
                name +
                "\\s*\\(\\s*\\)\\s*\\{",
                "i"
            )
        );

    if(!match){
        return "";
    }

    const start =
        match.index + match[0].length;

    let depth = 1;

    for(
        let i = start;
        i < source.length;
        i++
    ){

        if(source[i] === "{"){
            depth++;
        }

        if(source[i] === "}"){
            depth--;

            if(depth === 0){

                return source.substring(
                    start,
                    i
                );

            }

        }

    }

    return "";
}


/*
============================================================
PARSE LOOP
============================================================
*/

function parseLoop(source){

    const loop =
        getFunctionBody(
            source,
            "loop"
        );

    if(!loop){
        return [];
    }

    const commands = [];

    const regex =
        /digitalWrite\s*\(\s*(LED_BUILTIN|\d+)\s*,\s*(HIGH|LOW)\s*\)|analogWrite\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)|delay\s*\(\s*(\d+)\s*\)/gi;

    let match;

    while(
        (match = regex.exec(loop))
        !== null
    ){

        if(match[1]){

            let pin = match[1];

            if(
                pin.toUpperCase()
                === "LED_BUILTIN"
            ){

                pin = "13";

            }

            commands.push({

                type:"digital",

                pin:pin,

                value:
                    match[2].toUpperCase()

            });

        }

        else if(match[3]){

            commands.push({

                type:"analog",

                pin:match[3],

                value:Number(match[4])

            });

        }

        else if(match[5]){

            commands.push({

                type:"delay",

                value:Number(match[5])

            });

        }

    }

    return commands;

}


/*
============================================================
RUN
============================================================
*/

async function run(){

    if(!compiledCode){
        return;
    }

    const commands =
        parseLoop(
            compiledCode
        );

    if(commands.length === 0){
        return;
    }

    while(true){

        for(
            const command
            of commands
        ){

            if(
                command.type
                === "digital"
            ){

                setPin(
                    command.pin,
                    command.value
                );

            }

            else if(
                command.type
                === "analog"
            ){

                setPin(
                    command.pin,
                    command.value
                );

            }

            else if(
                command.type
                === "delay"
            ){

                await delay(
                    command.value
                );

            }

        }

    }

}


/*
============================================================
START
============================================================
*/

run();
