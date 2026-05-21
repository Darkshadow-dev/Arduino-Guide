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
text:"Control multiple outputs.",
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
text:"Display text using I2C OLED.",
filename:"oled",
code:`
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

Adafruit_SSD1306 display(128, 64, &Wire);

void setup(){

  display.begin(SSD1306_SWITCHCAPVCC, 0x3C);

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);

  display.setCursor(0, 0);
  display.println("Arduino OLED");
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

