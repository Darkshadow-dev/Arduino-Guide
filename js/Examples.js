let selectedPort = "COM8";
const examples = {

code:{
title:"What and why",
text:"Explanation of Arduino syntax and commands.",
filename:"code",
code:`
// Arduino commands must be typed exactly

pinMode(LED_BUILTIN, OUTPUT);
digitalWrite(LED_BUILTIN, HIGH);
delay(1000);

// Commands are case sensitive
// HIGH LOW INPUT OUTPUT must be capital letters
`
},

blink:{
title:"Blink LED",
text:"Blink the built-in LED every second.",
filename:"blink",
code:`
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop() {

  digitalWrite(LED_BUILTIN, HIGH);
  delay(1000);

  digitalWrite(LED_BUILTIN, LOW);
  delay(1000);

}
`
},

button:{
title:"Button Input",
text:"Read a button using a digital pin.",
filename:"button",
code:`
void setup() {
  pinMode(2, INPUT_PULLUP);
}

void loop() {

  int value = digitalRead(2);

}
`
},

"button-led":{
title:"Button + LED",
text:"Turn an LED on when a button is pressed.",
filename:"button-led",
code:`
void setup(){
  pinMode(2, INPUT_PULLUP);
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop(){

  if(digitalRead(2) == LOW){
    digitalWrite(LED_BUILTIN, HIGH);
  } else {
    digitalWrite(LED_BUILTIN, LOW);
  }

}
`
},

pwm:{
title:"PWM LED",
text:"Control LED brightness using PWM.",
filename:"pwm",
code:`
void setup(){
  pinMode(9, OUTPUT);
}

void loop(){

  analogWrite(9, 128);

}
`
},

"multi-led":{
title:"Multiple LEDs",
text:"Control three LEDs independently and cycle through them.",
filename:"multi-led",
code:`
void setup(){

  pinMode(13, OUTPUT);
  pinMode(12, OUTPUT);
  pinMode(11, OUTPUT);

}

void loop(){

  digitalWrite(13, HIGH);
  digitalWrite(12, LOW);
  digitalWrite(11, LOW);

  delay(500);

  digitalWrite(13, LOW);
  digitalWrite(12, HIGH);
  digitalWrite(11, LOW);

  delay(500);

  digitalWrite(13, LOW);
  digitalWrite(12, LOW);
  digitalWrite(11, HIGH);

  delay(500);

}
`
},

buzzer:{
title:"Buzzer",
text:"Play sound using a buzzer.",
filename:"buzzer",
code:`
void setup(){
  pinMode(6, OUTPUT);
}

void loop(){

  tone(6, 1000);
  delay(500);

  noTone(6);
  delay(500);

}
`
},

analog:{
title:"Analog Sensor",
text:"Read analog voltage values.",
filename:"analog",
code:`
void setup(){
  Serial.begin(9600);
}

void loop(){

  int value = analogRead(A0);

  Serial.println(value);

  delay(200);

}
`
},

joystick:{
title:"Joystick",
text:"Read joystick X/Y and button.",
filename:"joystick",
code:`
void setup(){
  pinMode(2, INPUT_PULLUP);
  Serial.begin(9600);
}

void loop(){

  int x = analogRead(A0);
  int y = analogRead(A1);
  int button = digitalRead(2);

  Serial.print("X:");
  Serial.print(x);

  Serial.print(" Y:");
  Serial.print(y);

  Serial.print(" Button:");
  Serial.println(button);

  delay(200);

}
`
},

oled:{
title:"OLED Display",
text:"Display text on a 128x64 I2C SSD1306 OLED.",
filename:"oled",
code:`
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  -1
);

void setup(){

  if(!display.begin(
    SSD1306_SWITCHCAPVCC,
    0x3C
  )){
    while(true){
    }
  }

  display.clearDisplay();

  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.println("Arduino OLED");

  display.setCursor(0, 16);
  display.println("Hello World!");

  display.display();

}

void loop(){

}
`
},

serial:{
title:"Serial Monitor",
text:"Send data to the PC.",
filename:"serial",
code:`
void setup(){
  Serial.begin(9600);
}

void loop(){

  Serial.println("Hello");

  delay(1000);

}
`
},

timer:{
title:"Timer (millis)",
text:"Run code without delay blocking.",
filename:"timer",
code:`
unsigned long t = 0;

void setup(){
  pinMode(LED_BUILTIN, OUTPUT);
}

void loop(){

  if(millis() - t > 1000){

    t = millis();

    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));

  }

}
`
},

interrupts:{
title:"Interrupts",
text:"Use external interrupts.",
filename:"interrupts",
code:`
volatile bool triggered = false;

void blink(){

  triggered = true;

}

void setup(){

  pinMode(2, INPUT_PULLUP);

  pinMode(LED_BUILTIN, OUTPUT);

  attachInterrupt(digitalPinToInterrupt(2), blink, FALLING);

}

void loop(){

  if(triggered){

    triggered = false;

    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));

  }

}
`
},

eeprom:{
title:"EEPROM Save",
text:"Store values permanently.",
filename:"eeprom",
code:`
#include <EEPROM.h>

int address = 0;

void setup(){

  Serial.begin(9600);

  EEPROM.write(address, 123);

  int value = EEPROM.read(address);

  Serial.println(value);

}

void loop(){

}
`
},

"pwm-control":{
title:"PWM Control",
text:"Control brightness with PWM.",
filename:"pwm-control",
code:`
int led = 9;

void setup(){

  pinMode(led, OUTPUT);

}

void loop(){

  for(int i=0;i<255;i++){

    analogWrite(led, i);

    delay(5);

  }

  for(int i=255;i>0;i--){

    analogWrite(led, i);

    delay(5);

  }

}
`
},

"battery-monitor":{
title:"Battery Monitor",
text:"Read battery voltage.",
filename:"battery-monitor",
code:`
int pin = A0;

void setup(){

  Serial.begin(9600);

}

void loop(){

  int value = analogRead(pin);

  float voltage = value * (5.0 / 1023.0);

  Serial.println(voltage);

  delay(1000);

}
`
},

"usb-monitor":{
title:"USB Voltage",
text:"Monitor USB voltage.",
filename:"usb-monitor",
code:`
int usbPin = A0;

void setup(){

  Serial.begin(9600);

}

void loop(){

  int raw = analogRead(usbPin);

  float voltage = raw * (5.0 / 1023.0);

  Serial.println(voltage);

  delay(500);

}
`
},

"solar-monitor":{
title:"Solar Monitor",
text:"Monitor solar panel voltage.",
filename:"solar-monitor",
code:`
int solarPin = A0;

void setup(){

  Serial.begin(9600);

}

void loop(){

  int raw = analogRead(solarPin);

  float voltage = raw * (5.0 / 1023.0);

  Serial.print("Solar Voltage: ");

  Serial.println(voltage);

  delay(1000);

}
`
},

"power-supply-test":{
title:"Power Supply Test",
text:"Check PSU voltage.",
filename:"power-supply-test",
code:`
int psuPin = A0;

void setup(){

  Serial.begin(9600);

}

void loop(){

  float voltage = analogRead(psuPin) * (5.0 / 1023.0);

  Serial.print("PSU: ");

  Serial.println(voltage);

  delay(1000);

}
`
},

"low-voltage-alert":{
title:"Low Voltage Alert",
text:"Warn on low battery.",
filename:"low-voltage-alert",
code:`
int batteryPin = A0;

void setup(){

  Serial.begin(9600);

  pinMode(LED_BUILTIN, OUTPUT);

}

void loop(){

  float voltage = analogRead(batteryPin) * (5.0 / 1023.0);

  if(voltage < 3.0){

    digitalWrite(LED_BUILTIN, HIGH);

  }else{

    digitalWrite(LED_BUILTIN, LOW);

  }

  delay(500);

}
`
},

"led-test":{
title:"LED Test",
text:"Basic LED blink test.",
filename:"led-test",
code:`
void setup(){

  pinMode(LED_BUILTIN, OUTPUT);

}

void loop(){

  digitalWrite(LED_BUILTIN, HIGH);

  delay(500);

  digitalWrite(LED_BUILTIN, LOW);

  delay(500);

}
`
},

"speaker-test":{
title:"Speaker Test",
text:"Play test tones.",
filename:"speaker-test",
code:`
int speaker = 8;

void setup(){

}

void loop(){

  tone(speaker, 1000);

  delay(500);

  noTone(speaker);

  delay(500);

}
`
},

"button-test":{
title:"Button Test",
text:"Test button input.",
filename:"button-test",
code:`
int button = 2;

void setup(){

  Serial.begin(9600);

  pinMode(button, INPUT_PULLUP);

}

void loop(){

  if(digitalRead(button) == LOW){

    Serial.println("Pressed");

  }

  delay(100);

}
`
},

"relay-test":{
title:"Relay Test",
text:"Switch relay on/off.",
filename:"relay-test",
code:`
int relay = 7;

void setup(){

  pinMode(relay, OUTPUT);

}

void loop(){

  digitalWrite(relay, HIGH);

  delay(1000);

  digitalWrite(relay, LOW);

  delay(1000);

}
`
},

"sensor-test":{
title:"Sensor Test",
text:"Basic analog sensor test.",
filename:"sensor-test",
code:`
int sensor = A0;

void setup(){

  Serial.begin(9600);

}

void loop(){

  int value = analogRead(sensor);

  Serial.println(value);

  delay(500);

}
`
}

};




const newExamples = {

blink:{
  title:"Blink LED — Explanation",
  text:"Explaining how blinking an LED works.",
  filename:"blink-explanation",
  code:`

void setup() { // Starts setup(). This function runs once when the Arduino starts or resets.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED pin as an OUTPUT so the Arduino can control it.
                                // On an Arduino Uno, LED_BUILTIN normally refers to digital pin 13.

} // Ends setup(). The Arduino now moves to loop().


void loop() { // Starts loop(). Everything inside this function repeats continuously while the Arduino is powered.

  digitalWrite(LED_BUILTIN, HIGH); // Sets the LED pin HIGH, which turns the built-in LED ON.

  delay(1000); // Pauses the program for 1000 milliseconds.
              // 1000 milliseconds = 1 second.
              // Increasing this number makes the LED stay ON longer.

  digitalWrite(LED_BUILTIN, LOW); // Sets the LED pin LOW, which turns the built-in LED OFF.

  delay(1000); // Waits another 1000 milliseconds = 1 second.
              // The LED remains OFF during this delay.

} // Ends loop().
  // The Arduino immediately starts loop() again.
  // Because loop() repeats forever, the LED continuously turns ON and OFF.

`
},

button:{
  title:"Button Input — Explanation",
  text:"Explaining how an Arduino reads a push button.",
  filename:"button-explanation",
  code:`

void setup() { // Starts setup(). It runs once when the Arduino starts.

  pinMode(2, INPUT_PULLUP); // Configures digital pin 2 as an input.
                           // INPUT_PULLUP also activates the Arduino's internal pull-up resistor.
                           // This means the pin normally reads HIGH.
                           // When a button connects pin 2 to GND, the pin reads LOW.

} // Ends setup().


void loop() { // Starts loop(). It repeats continuously.

  int value = digitalRead(2); // Reads the current state of digital pin 2.
                              // HIGH means the button is normally released.
                              // LOW means the button is connected to GND, normally meaning pressed.
                              // The result is stored inside the integer variable called value.

} // Ends loop().
  // The button is read again when loop() starts over.

`
},

"button-led":{
  title:"Button + LED — Explanation",
  text:"Explaining how a button can control an LED.",
  filename:"button-led-explanation",
  code:`

void setup() { // Starts setup(). Runs once when the Arduino starts.

  pinMode(2, INPUT_PULLUP); // Sets pin 2 as a button input.
                           // INPUT_PULLUP activates the internal pull-up resistor.
                           // The input normally reads HIGH.
                           // Pressing the button should connect the pin to GND, making it LOW.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED pin as an output.
                               // On an Arduino Uno this is normally pin 13.

} // Ends setup().


void loop() { // Starts the repeating loop.

  if(digitalRead(2) == LOW){ // Reads pin 2 and checks if its value is LOW.
                             // With INPUT_PULLUP, LOW normally means the button is pressed.

    digitalWrite(LED_BUILTIN, HIGH); // If the button is pressed, turn the LED ON.

  } else { // Runs when the button is NOT pressed.

    digitalWrite(LED_BUILTIN, LOW); // Turn the LED OFF.

  } // Ends the if/else decision.

} // Ends loop().
  // The Arduino checks the button again when loop() repeats.

`
},

pwm:{
  title:"PWM LED — Explanation",
  text:"Explaining how PWM can control LED brightness.",
  filename:"pwm-explanation",
  code:`

void setup() { // Starts setup(). Runs once when the Arduino starts.

  pinMode(9, OUTPUT); // Sets digital pin 9 as an output.
                     // Pin 9 supports PWM on an Arduino Uno.
                     // PWM allows the Arduino to simulate different output levels.

} // Ends setup().


void loop() { // Starts the repeating loop.

  analogWrite(9, 128); // Sends a PWM value of 128 to pin 9.
                       // PWM values normally range from 0 to 255.
                       // 0 = completely OFF.
                       // 255 = completely ON.
                       // 128 is approximately half of the available PWM level.
                       // With an LED, this normally produces roughly half brightness.

} // Ends loop().
  // The same PWM value is continuously written to pin 9.

`
},

"multi-led":{
  title:"Multiple LEDs — Explanation",
  text:"Control three external LEDs independently using digital pins 11, 12 and 13.",
  filename:"multi-led-explanation",
  code:`
void setup(){ // Runs once when the Arduino starts.

  pinMode(13, OUTPUT); // Sets pin 13 as an output.
                       // Connect an LED and resistor to this pin.
                       // On an Arduino Uno, pin 13 also has the built-in LED.

  pinMode(12, OUTPUT); // Sets pin 12 as an output.
                       // This can control a second external LED.

  pinMode(11, OUTPUT); // Sets pin 11 as an output.
                       // This can control a third external LED.

} // setup() ends here.


void loop(){ // Runs repeatedly while the Arduino is powered.

  digitalWrite(13, HIGH); // Turns the LED connected to pin 13 ON.

  digitalWrite(12, LOW); // Turns the LED connected to pin 12 OFF.

  digitalWrite(11, LOW); // Turns the LED connected to pin 11 OFF.

  delay(500); // Waits half a second.


  digitalWrite(13, LOW); // Turns the LED on pin 13 OFF.

  digitalWrite(12, HIGH); // Turns the LED on pin 12 ON.

  digitalWrite(11, LOW); // Keeps the LED on pin 11 OFF.

  delay(500); // Waits half a second.


  digitalWrite(13, LOW); // Keeps the LED on pin 13 OFF.

  digitalWrite(12, LOW); // Turns the LED on pin 12 OFF.

  digitalWrite(11, HIGH); // Turns the LED on pin 11 ON.

  delay(500); // Waits half a second.

} // loop() starts again.
  // The three LEDs take turns turning ON.
`
},

buzzer:{
  title:"Buzzer — Explanation",
  text:"Explaining how Arduino can generate sound with a buzzer.",
  filename:"buzzer-explanation",
  code:`

void setup() { // Starts setup(). Runs once when the Arduino starts.

  pinMode(6, OUTPUT); // Sets digital pin 6 as an output.
                     // The buzzer is connected to this pin.

} // Ends setup().


void loop() { // Starts the repeating loop.

  tone(6, 1000); // Generates a tone on pin 6 at 1000 Hz.
                 // 1000 Hz means approximately 1000 cycles per second.
                 // This creates an audible tone on a suitable buzzer.

  delay(500); // Keeps the tone playing for 500 milliseconds = 0.5 seconds.

  noTone(6); // Stops the tone being generated on pin 6.

  delay(500); // Waits 500 milliseconds while the buzzer is silent.

} // Ends loop().
  // The tone starts again when loop() repeats.

`
},

analog:{
  title:"Analog Sensor — Explanation",
  text:"Read a sensor connected to A0 and display its analog value in the Serial Monitor.",
  filename:"analog-explanation",
  code:`

void setup() { // Runs once when the Arduino starts.

  Serial.begin(9600); // Starts communication with the computer.
                      // Open Serial Monitor and set it to 9600 baud.

}


void loop() { // Runs repeatedly while the Arduino is powered.

  int value = analogRead(A0); // Reads the voltage on analog pin A0.
                              // Arduino Uno returns a value from 0 to 1023.
                              // 0 = approximately 0V.
                              // 1023 = approximately 5V.

  Serial.print("Sensor: "); // Prints a label so the value is easier to understand.

  Serial.println(value); // Prints the sensor value and starts a new line.

  delay(200); // Waits 200 milliseconds before reading the sensor again.
              // This gives about 5 readings per second.

}
  // The loop repeats, continuously reading A0 and displaying the value.
`
},

joystick:{
  title:"Joystick — Explanation",
  text:"Explaining how an Arduino reads joystick X, Y and button values.",
  filename:"joystick-explanation",
  code:`

void setup() { // Starts setup(). Runs once.

  pinMode(2, INPUT_PULLUP); // Sets pin 2 as the joystick button input.
                           // The internal pull-up keeps the input HIGH normally.
                           // Pressing the joystick button normally connects it to GND, producing LOW.

  Serial.begin(9600); // Starts serial communication at 9600 baud.
                      // Used to display joystick values on the PC.

} // Ends setup().


void loop() { // Starts the repeating loop.

  int x = analogRead(A0); // Reads the joystick's X-axis from analog pin A0.
                          // The value is normally between 0 and 1023.

  int y = analogRead(A1); // Reads the joystick's Y-axis from analog pin A1.
                          // The value is normally between 0 and 1023.

  int button = digitalRead(2); // Reads the joystick button on digital pin 2.
                               // HIGH normally means released.
                               // LOW normally means pressed.


  Serial.print("X:"); // Sends the text "X:" to the Serial Monitor.

  Serial.print(x); // Sends the current X-axis value.


  Serial.print(" Y:"); // Sends a space followed by "Y:".

  Serial.print(y); // Sends the current Y-axis value.


  Serial.print(" Button:"); // Sends the text "Button:".

  Serial.println(button); // Sends the button state and moves to the next line.


  delay(200); // Waits 200 milliseconds before reading everything again.

} // Ends loop().

`
},

oled:{
  title:"OLED Display — Explanation",
  text:"Display text on a 128×64 I2C SSD1306 OLED using the Adafruit libraries.",
  filename:"oled-explanation",
  code:`
#include <Wire.h> // Provides I2C communication for the OLED.

#include <Adafruit_GFX.h> // Provides graphics and text functions.

#include <Adafruit_SSD1306.h> // Provides support for the SSD1306 OLED controller.


#define SCREEN_WIDTH 128 // Defines the OLED width as 128 pixels.

#define SCREEN_HEIGHT 64 // Defines the OLED height as 64 pixels.


Adafruit_SSD1306 display(
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  &Wire,
  -1
); // Creates the OLED display object.
    // 128 = width.
    // 64 = height.
    // &Wire = use the Arduino I2C interface.
    // -1 = the OLED does not have a separate reset pin.


void setup(){ // Runs once when the Arduino starts.

  if(!display.begin(
    SSD1306_SWITCHCAPVCC,
    0x3C
  )){ // Starts the OLED at I2C address 0x3C.

    while(true){
      // Stops here if the OLED could not be initialized.
    }

  }


  display.clearDisplay(); // Clears the OLED drawing buffer.


  display.setTextSize(1); // Sets the text size.


  display.setTextColor(SSD1306_WHITE); // Makes the text white.


  display.setCursor(0, 0); // Places the text cursor at the top-left.


  display.println("Arduino OLED"); // Writes text into the display buffer.


  display.println(); // Adds an empty line.


  display.println("Hello!"); // Writes another line of text.


  display.display(); // Sends the buffer to the physical OLED.
                     // Without this command, the changes remain in memory.

}


void loop(){ // Runs repeatedly.

  // Nothing needs to happen here.
  // The OLED already contains the displayed text.

}
`
},

serial:{
  title:"Serial Monitor — Explanation",
  text:"Explaining how Arduino sends text to a computer.",
  filename:"serial-explanation",
  code:`

void setup() { // Starts setup(). Runs once.

  Serial.begin(9600); // Starts serial communication at 9600 baud.
                      // This allows the Arduino to communicate with the PC.

} // Ends setup().


void loop() { // Starts the repeating loop.

  Serial.println("Hello"); // Sends the word "Hello" to the Serial Monitor.
                           // println() automatically adds a new line.

  delay(1000); // Waits 1000 milliseconds = 1 second.
              // This makes the Arduino send "Hello" once every second.

} // Ends loop().
  // The message is sent again when loop() repeats.

`
},

timer:{
  title:"Timer (millis) — Explanation",
  text:"Explaining how millis() can perform timing without delay().",
  filename:"timer-explanation",
  code:`

unsigned long t = 0; // Creates a variable named t for storing a time value.
                     // unsigned long is used because millis() returns an unsigned long.
                     // The variable starts at 0.


void setup() { // Starts setup(). Runs once.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED as an output.

} // Ends setup().


void loop() { // Starts the repeating loop.

  if(millis() - t > 1000){ // Gets the number of milliseconds since the Arduino started.
                           // It subtracts the previous stored time t.
                           // If more than 1000 milliseconds have passed, the code inside runs.
                           // Unlike delay(), millis() allows the loop to continue running while time passes.

    t = millis(); // Saves the current time.
                  // This becomes the starting point for the next 1-second interval.

    digitalWrite(
      LED_BUILTIN,
      !digitalRead(LED_BUILTIN)
    ); // Reads the current LED state and reverses it.
        // HIGH becomes LOW.
        // LOW becomes HIGH.
        // This makes the LED toggle every time the timer reaches the interval.

  } // Ends the if statement.

} // Ends loop().
  // loop() keeps running and repeatedly checks the elapsed time.

`
},

interrupts:{
  title:"Interrupts — Explanation",
  text:"Explaining how an external interrupt can react to a button immediately.",
  filename:"interrupts-explanation",
  code:`

volatile bool triggered = false; // Creates a Boolean variable.
                                 // false means the interrupt has not happened.
                                 // volatile tells the compiler that this value can change outside normal program flow.
                                 // This is important because an interrupt can change the variable.


void blink(){ // Defines a function that will be called by the interrupt.

  triggered = true; // Tells the main program that the interrupt occurred.

} // Ends the interrupt function.


void setup(){ // Starts setup(). Runs once.

  pinMode(2, INPUT_PULLUP); // Sets pin 2 as an input using the internal pull-up resistor.
                           // The pin normally reads HIGH.
                           // Connecting it to GND produces LOW.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED as an output.

  attachInterrupt(
    digitalPinToInterrupt(2),
    blink,
    FALLING
  ); // Connects the interrupt to pin 2.
      // digitalPinToInterrupt(2) converts pin 2 into the correct interrupt number.
      // blink is the function that runs when the interrupt happens.
      // FALLING means the interrupt triggers when the signal changes from HIGH to LOW.

} // Ends setup().


void loop(){ // Starts the normal program loop.

  if(triggered){ // Checks whether the interrupt changed triggered to true.

    triggered = false; // Clears the flag so the next interrupt can be detected.

    digitalWrite(
      LED_BUILTIN,
      !digitalRead(LED_BUILTIN)
    ); // Reads the current LED state and reverses it.
        // This makes the LED toggle whenever the interrupt occurs.

  } // Ends the if statement.

} // Ends loop().

`
},

eeprom:{
  title:"EEPROM Save — Explanation",
  text:"Explaining how Arduino can store data that survives a reset or power loss.",
  filename:"eeprom-explanation",
  code:`

#include <EEPROM.h> // Includes the EEPROM library.
                    // EEPROM provides non-volatile memory on boards that have it.


int address = 0; // Creates an integer containing the EEPROM memory address.
                // Address 0 means the first EEPROM location.


void setup(){ // Starts setup(). Runs once after startup or reset.

  Serial.begin(9600); // Starts serial communication so the stored value can be displayed.

  EEPROM.write(address, 123); // Writes the number 123 into EEPROM address 0.
                             // EEPROM keeps its stored value even after the Arduino loses power.

  int value = EEPROM.read(address); // Reads the value from EEPROM address 0.
                                    // The result is stored in the variable called value.

  Serial.println(value); // Prints the stored value to the Serial Monitor.

} // Ends setup().


void loop(){ // Starts loop().
             // Nothing needs to repeat in this example.

} // Ends loop().

`
},

"pwm-control":{
  title:"PWM Control — Explanation",
  text:"Explaining how a loop can smoothly increase and decrease LED brightness.",
  filename:"pwm-control-explanation",
  code:`

int led = 9; // Creates a variable containing the LED pin number.
             // Pin 9 supports PWM on an Arduino Uno.


void setup(){ // Starts setup().

  pinMode(led, OUTPUT); // Sets the LED pin as an output.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  for(int i=0;i<255;i++){ // Creates a for loop.
                          // i starts at 0.
                          // The loop continues while i is less than 255.
                          // i increases by 1 after every iteration.

    analogWrite(led, i); // Sends the current PWM value to the LED.
                         // As i increases, the LED becomes brighter.

    delay(5); // Waits 5 milliseconds between brightness changes.
              // This makes the brightness change gradually instead of instantly.

  } // Ends the first brightness loop.


  for(int i=255;i>0;i--){ // Starts a second loop.
                          // i starts at 255.
                          // The value decreases by 1 each time.
                          // This makes the LED become dimmer.

    analogWrite(led, i); // Applies the current PWM brightness.

    delay(5); // Waits 5 milliseconds before changing brightness again.

  } // Ends the second brightness loop.

} // Ends loop().
  // The brightness cycle starts again.

`
},

"battery-monitor":{
  title:"Battery Monitor — Explanation",
  text:"Explaining how an analog input can be converted into an estimated voltage.",
  filename:"battery-monitor-explanation",
  code:`

int pin = A0; // Stores analog pin A0 in a variable called pin.
              // The battery measurement is connected to this analog input.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts communication with the PC at 9600 baud.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  int value = analogRead(pin); // Reads the analog voltage on A0.
                               // On an Arduino Uno this normally returns 0 to 1023.

  float voltage =
    value * (5.0 / 1023.0); // Converts the ADC value into an estimated voltage.
                            // 1023 represents approximately 5V when using a 5V reference.
                            // This simple formula assumes the measured voltage is within the ADC range.
                            // A real battery may require a voltage divider before connecting it to A0.

  Serial.println(voltage); // Prints the calculated voltage to the Serial Monitor.

  delay(1000); // Waits one second before taking another measurement.

} // Ends loop().

`
},

"usb-monitor":{
  title:"USB Voltage — Explanation",
  text:"Explaining how an analog input can be used to monitor a voltage.",
  filename:"usb-monitor-explanation",
  code:`

int usbPin = A0; // Stores analog pin A0 in the variable usbPin.
                 // This is where the voltage measurement is expected.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts Serial communication at 9600 baud.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  int raw = analogRead(usbPin); // Reads the analog value from A0.
                                // The Arduino Uno ADC normally produces a value from 0 to 1023.

  float voltage =
    raw * (5.0 / 1023.0); // Converts the ADC reading into an estimated voltage.
                          // This assumes a 5V reference and that the measured voltage
                          // has been safely reduced to the ADC's allowed input range.

  Serial.println(voltage); // Prints the calculated voltage to the Serial Monitor.

  delay(500); // Waits 500 milliseconds before measuring again.

} // Ends loop().

`
},

"solar-monitor":{
  title:"Solar Monitor — Explanation",
  text:"Explaining how an analog input can monitor solar panel voltage.",
  filename:"solar-monitor-explanation",
  code:`

int solarPin = A0; // Stores analog pin A0 in the variable solarPin.
                   // The solar panel measurement is expected here.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts serial communication at 9600 baud.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  int raw = analogRead(solarPin); // Reads the voltage measurement from A0.
                                  // The Arduino converts the analog voltage into a number from 0 to 1023.

  float voltage =
    raw * (5.0 / 1023.0); // Converts the ADC reading into an estimated voltage.
                          // This assumes a 5V reference.
                          // A solar panel may produce more voltage than the Arduino input can safely accept,
                          // so a suitable voltage divider is normally required.

  Serial.print("Solar Voltage: "); // Prints a label before the voltage.

  Serial.println(voltage); // Prints the calculated voltage and moves to the next line.

  delay(1000); // Waits one second before taking another reading.

} // Ends loop().

`
},

"power-supply-test":{
  title:"Power Supply Test — Explanation",
  text:"Explaining how an analog input can be used to measure a power supply.",
  filename:"power-supply-test-explanation",
  code:`

int psuPin = A0; // Stores analog pin A0 as the measurement input.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts serial communication with the PC.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  float voltage =
    analogRead(psuPin) * (5.0 / 1023.0); // Reads the analog input and converts the ADC value to an estimated voltage.
                                         // This assumes a 5V analog reference.
                                         // A voltage divider is required if the power supply is higher
                                         // than the Arduino analog input can safely handle.

  Serial.print("PSU: "); // Prints the label "PSU:".

  Serial.println(voltage); // Prints the calculated voltage.

  delay(1000); // Waits one second before checking again.

} // Ends loop().

`
},

"low-voltage-alert":{
  title:"Low Voltage Alert — Explanation",
  text:"Explaining how an Arduino can detect a low voltage and turn on an LED.",
  filename:"low-voltage-alert-explanation",
  code:`

int batteryPin = A0; // Stores analog pin A0 as the battery measurement input.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts serial communication with the PC.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED as an output.
                               // The LED will be used as the warning indicator.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  float voltage =
    analogRead(batteryPin) * (5.0 / 1023.0); // Reads the battery measurement and converts it into voltage.
                                             // This assumes a 5V analog reference.
                                             // A voltage divider may be required for batteries above the ADC range.

  if(voltage < 3.0){ // Checks whether the calculated voltage is below 3.0V.

    digitalWrite(LED_BUILTIN, HIGH); // If the voltage is below 3.0V, turn the warning LED ON.

  }else{ // Runs when the voltage is 3.0V or higher.

    digitalWrite(LED_BUILTIN, LOW); // Turns the warning LED OFF.

  } // Ends the voltage check.

  delay(500); // Waits 500 milliseconds before checking the voltage again.

} // Ends loop().

`
},

"led-test":{
  title:"LED Test — Explanation",
  text:"Explaining a simple LED test program.",
  filename:"led-test-explanation",
  code:`

void setup(){ // Starts setup(). Runs once.

  pinMode(LED_BUILTIN, OUTPUT); // Sets the built-in LED pin as an output.
                               // On an Arduino Uno this normally refers to pin 13.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  digitalWrite(LED_BUILTIN, HIGH); // Turns the built-in LED ON.

  delay(500); // Keeps the LED ON for 500 milliseconds = 0.5 seconds.

  digitalWrite(LED_BUILTIN, LOW); // Turns the built-in LED OFF.

  delay(500); // Keeps the LED OFF for 500 milliseconds = 0.5 seconds.

} // Ends loop().
  // The LED repeatedly flashes twice per second.

`
},

"speaker-test":{
  title:"Speaker Test — Explanation",
  text:"Explaining how Arduino can test a speaker or buzzer with a tone.",
  filename:"speaker-test-explanation",
  code:`

int speaker = 8; // Stores digital pin 8 as the speaker output pin.


void setup(){ // Starts setup().
              // Nothing needs to be configured here because tone()
              // can configure the required pin behavior itself.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  tone(speaker, 1000); // Generates a 1000 Hz tone on pin 8.
                       // The frequency controls the pitch.
                       // Higher numbers produce higher-pitched tones.

  delay(500); // Keeps the tone playing for 500 milliseconds.

  noTone(speaker); // Stops the tone on pin 8.

  delay(500); // Waits 500 milliseconds while the speaker is silent.

} // Ends loop().
  // The test tone starts again when loop() repeats.

`
},

"button-test":{
  title:"Button Test — Explanation",
  text:"Explaining how to test a button and print its state.",
  filename:"button-test-explanation",
  code:`

int button = 2; // Stores digital pin 2 as the button input pin.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts Serial communication with the PC.

  pinMode(button, INPUT_PULLUP); // Configures pin 2 as an input.
                                 // Enables the internal pull-up resistor.
                                 // The input normally reads HIGH.
                                 // Pressing the button to GND makes it LOW.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  if(digitalRead(button) == LOW){ // Reads the button.
                                  // LOW means the button is pressed with INPUT_PULLUP.

    Serial.println("Pressed"); // Sends "Pressed" to the Serial Monitor.

  } // Ends the if statement.

  delay(100); // Waits 100 milliseconds before checking again.
              // This reduces how quickly messages can be printed.

} // Ends loop().

`
},

"relay-test":{
title:"Relay Test — Explanation",
text:"Explaining how an Arduino controls a relay module.",
filename:"relay-test-explanation",
code:`

int relay = 7; // Stores the relay control pin number.
// The relay module's signal/input pin is connected to Arduino pin 7.

void setup(){ // Runs once when the Arduino starts.

pinMode(relay, OUTPUT); // Sets pin 7 as an output.
// The Arduino will use this pin to control the relay.

} // setup() ends.

void loop(){ // Runs repeatedly while the Arduino is powered.

digitalWrite(relay, HIGH); // Sets pin 7 HIGH.
// On a typical active-HIGH relay module,
// this activates the relay.
// The relay makes an audible click and switches its contacts.

delay(1000); // Keeps the relay activated for 1 second.

digitalWrite(relay, LOW); // Sets pin 7 LOW.
// On a typical active-HIGH relay module,
// this deactivates the relay.
// The relay switches its contacts back.

delay(1000); // Keeps the relay deactivated for 1 second.

} // loop() ends.
// The loop starts again, so the relay repeatedly switches
// ON for 1 second and OFF for 1 second.

`
},

"sensor-test":{
  title:"Sensor Test — Explanation",
  text:"Explaining how to read an analog sensor and display its value.",
  filename:"sensor-test-explanation",
  code:`

int sensor = A0; // Stores analog pin A0 as the sensor input.


void setup(){ // Starts setup().

  Serial.begin(9600); // Starts Serial communication at 9600 baud.
                      // Sensor readings can then be viewed on the Serial Monitor.

} // Ends setup().


void loop(){ // Starts the repeating loop.

  int value = analogRead(sensor); // Reads the analog sensor value from A0.
                                  // On an Arduino Uno the normal result is between 0 and 1023.
                                  // The exact meaning depends on the sensor being connected.

  Serial.println(value); // Sends the sensor value to the Serial Monitor.

  delay(500); // Waits 500 milliseconds before reading the sensor again.

} // Ends loop().
  // The sensor is continuously monitored.

`
}

};

