/*
============================================================
LED COMPONENT
============================================================
*/

const ledColors = [
    [255,0,0],
    [0,80,255],
    [0,220,80]
];

const leds = {};
const ledPins = [];


function createLED(pin){

    pin = String(pin);

    if(leds[pin]){
        return leds[pin];
    }

    const index =
        ledPins.length;

    ledPins.push(pin);

    const led =
        document.createElement("div");

    led.className = "arduino-led";

    led.style.position = "absolute";
    led.style.width = "60px";
    led.style.height = "60px";
    led.style.borderRadius = "50%";

    const color =
        index < 3
        ? ledColors[index]
        : [255,255,255];

    led.dataset.r = color[0];
    led.dataset.g = color[1];
    led.dataset.b = color[2];

    setLED(led,0);

    simulator.appendChild(led);

    arrangeLEDs();

    leds[pin] = led;

    return led;

}


function setLED(led,value){

    value =
        Math.max(
            0,
            Math.min(
                255,
                Number(value)
            )
        );

    const r =
        Number(led.dataset.r);

    const g =
        Number(led.dataset.g);

    const b =
        Number(led.dataset.b);

    const rr =
        Math.round(
            r * value / 255
        );

    const gg =
        Math.round(
            g * value / 255
        );

    const bb =
        Math.round(
            b * value / 255
        );

    led.style.background =
        `rgb(${rr},${gg},${bb})`;

}


function arrangeLEDs(){

    const spacing = 20;

    const width =
        60 + spacing;

    const total =
        ledPins.length * width - spacing;

    const start =
        (simulator.clientWidth - total) / 2;

    const top =
        (simulator.clientHeight - 60) / 2;

    ledPins.forEach(
        (pin,index) => {

            const led =
                leds[pin];

            led.style.left =
                `${start + index * width}px`;

            led.style.top =
                `${top}px`;

        }
    );

}


/*
============================================================
COMPONENT INTERFACE
============================================================
*/

registerComponent({

    setPin(pin,value){

        const led =
            createLED(pin);

        if(
            value === "HIGH"
        ){

            setLED(
                led,
                255
            );

        }

        else if(
            value === "LOW"
        ){

            setLED(
                led,
                0
            );

        }

        else{

            setLED(
                led,
                value
            );

        }

    }

});
