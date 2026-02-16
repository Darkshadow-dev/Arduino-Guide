/*------------------------------------___  Main Script ___------------------------*/

/*-------------___ Page script ___----------------*/
const STORAGE_KEY = "arduino-last-page";

/* ACTIVATE PAGE */
function activatePage(id, save = true) {
  const target = document.getElementById(id);

  document.querySelectorAll(".page").forEach(p =>
    p.classList.remove("active")
  );

  if (target) {
    target.classList.add("active");
    if (save) localStorage.setItem(STORAGE_KEY, id);
  } else {
    document.getElementById("notfound").classList.add("active");
    if (save) localStorage.setItem(STORAGE_KEY, "notfound");
  }

  window.scrollTo(0, 0);
}

/* HOME BUTTON */
function goHome() {
  activatePage("home");
  history.pushState(null, "", "#home");
}

/* NAV LINK HANDLING */
document.querySelectorAll("nav a").forEach(a => {
  a.addEventListener("click", e => {
    const href = a.getAttribute("href");
    if (!href || href.startsWith("http")) return;

    // #section
    if (href.startsWith("#")) {
      e.preventDefault();
      const id = href.substring(1);
      activatePage(id);
      history.pushState(null, "", href);
      return;
    }

    // page.html#section
    if (href.includes(".html#")) {
      const [page, hash] = href.split("#");
      if (location.pathname.endsWith(page)) {
        e.preventDefault();
        activatePage(hash);
        history.pushState(null, "", "#" + hash);
      }
    }
  });
});

/* BACK / FORWARD */
window.addEventListener("hashchange", () => {
  const id = location.hash.substring(1);
  activatePage(id, false);
});

/* RESTORE LAST PAGE ON LOAD */
window.addEventListener("load", () => {
  const hash = location.hash.substring(1);
  const last = localStorage.getItem(STORAGE_KEY) || "home";

  if (hash) {
    activatePage(hash);
  } else {
    activatePage(last);
    history.replaceState(null, "", "#" + last);
  }
});

/*----------- DROPDOWNS --------------*/
function toggleDropdown(btn, e) {
  e.stopPropagation();

  document.querySelectorAll(".dropdown").forEach(d => {
    if (d !== btn.closest(".dropdown")) {
      d.classList.remove("open");
      d.querySelector(".dropdown-menu").classList.remove("open");
    }
  });

  const dropdown = btn.closest(".dropdown");
  dropdown.classList.toggle("open");
  dropdown.querySelector(".dropdown-menu").classList.toggle("open");
}

function selectLink(link) {
  const dropdown = link.closest(".dropdown");
  dropdown.classList.remove("open");
  dropdown.querySelector(".dropdown-menu").classList.remove("open");
}

document.addEventListener("click", () => {
  document.querySelectorAll(".dropdown").forEach(d => {
    d.classList.remove("open");
    d.querySelector(".dropdown-menu").classList.remove("open");
  });
});

/*------------ Side dropdown ----------------*/
function toggleSideMenu(btn, e){
  e.stopPropagation();

  const panel = btn.nextElementSibling;

  // close other side panels
  document.querySelectorAll(".side-panel").forEach(p => {
    if (p !== panel) p.classList.remove("open");
  });

  panel.classList.toggle("open");
}
// close when clicking outside
document.addEventListener("click", e => {
  if (!e.target.closest(".side-menu")) {
    document.querySelectorAll(".side-panel")
      .forEach(p => p.classList.remove("open"));
  }
});

function toggleLP(btn){
  const card = btn.parentElement;

  document.querySelectorAll(".lp-card").forEach(c=>{
    if(c!==card) c.classList.remove("active");
  });

  card.classList.toggle("active");
}

/* progress system (toggle version) */

document.querySelectorAll(".lp-check").forEach(box=>{
  const text = box.previousElementSibling.textContent.trim();
  const key = "lp_" + text;

  if(localStorage.getItem(key)==="1"){
    box.classList.add("done");
  }

  box.onclick = ()=>{
    box.classList.toggle("done");

    if(box.classList.contains("done")){
      localStorage.setItem(key,"1");
    }else{
      localStorage.removeItem(key);
    }

    updateCard(box.closest(".lp-card"));
  };
});

function updateCard(card){
  const total = card.querySelectorAll(".lp-check").length;
  const done  = card.querySelectorAll(".lp-check.done").length;

  if(done === total){
    card.classList.add("done");
  }else{
    card.classList.remove("done");
  }
}

/* restore buttons on load */
document.querySelectorAll(".lp-card").forEach(card=>{
  updateCard(card);
});

/*-------------- Animation on hardwarevi page --------------*/

document.querySelectorAll('.led-container').forEach(container => {
  const frames = container.querySelectorAll('.led-frame');
  if (frames.length < 2) return; // nothing to animate

  let index = 0;
  frames[index].classList.add('active');

  setInterval(() => {
    frames[index].classList.remove('active');
    index = (index + 1) % frames.length;
    frames[index].classList.add('active');
  }, 1000);
});

/*-------------------- Animation tutorial page --------------------*/

let currentTutorial = null;
let currentStep = 0;

const tutorials = {
  led: {
    title: "Blink LED",
    steps: [
      {
        img: "Images/led-step1.png",
        text: "Step 1: Get an Arduino, LED, 220Ω resistor and wires."
      },
      {
        img: "Images/led-step2.png",
        text: "Step 2: Connect resistor to pin 13."
      },
      {
        img: "Images/led-step3.png",
        text: "Step 3: Connect LED to resistor and GND."
      },
      {
        img: "Images/led-step4.png",
        text: "Step 4: Upload this code.",
        code: `
// Blink LED
void setup(){
  pinMode(13, OUTPUT);
}

void loop(){
  digitalWrite(13, HIGH);
  delay(1000);
  digitalWrite(13, LOW);
  delay(1000);
}`
      }
    ]
  }
};

function loadTutorial(name){
  currentTutorial = tutorials[name];
  currentStep = 0;
  renderStep();
}

function renderStep(){
  const step = currentTutorial.steps[currentStep];

  document.getElementById("tutImage").src = step.img;
  document.getElementById("tutTitle").innerText =
    currentTutorial.title + " – Step " + (currentStep+1);
  document.getElementById("tutText").innerText = step.text;
  document.getElementById("stepCounter").innerText =
    "Step " + (currentStep+1) + " / " + currentTutorial.steps.length;

  const codeBox = document.getElementById("tutCode");
  if(step.code){
    codeBox.style.display = "block";
    codeBox.querySelector("pre").innerText = step.code;
  }else{
    codeBox.style.display = "none";
  }
}

function nextStep(){
  if(currentStep < currentTutorial.steps.length-1){
    currentStep++;
    renderStep();
  }
}

function prevStep(){
  if(currentStep > 0){
    currentStep--;
    renderStep();
  }
}

loadTutorial("blink");

/*this is a gone function above*/

/*-------------- 3D model renderer--------------- */
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("uno3d"),
  antialias: true,
  alpha: true // <- this removes black background
});

renderer.setClearColor(0x000000, 0); // fully transparent

/*--------------___ Feedback functiones ___---------------------*/

function toggleCustomType(){
  const sel = document.getElementById("type");
  const custom = document.getElementById("customType");

  if(sel.value === "custom"){
    custom.style.display = "block";
    custom.focus();
  }else{
    custom.style.display = "none";
    custom.value = "";
  }
}
        function sendMail(form) {
            const name = document.getElementById("name").value;
            const email = document.getElementById("email").value;
            const subject = document.getElementById("subject").value;
            const message = document.getElementById("message").value;
            // Format mailto link
            const mailtoLink = `mailto:guidecommunity.contacts@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
                "Name: " + name + "\n" +
                "Email: " + email + "\n\n" +
                "Message:\n" + message
            )}`;

            // Open user's email client
            window.location.href = mailtoLink;
        }
function submitFeedback(){

  const typeSelect = document.getElementById("type");
  const customType = document.getElementById("customType");
  const idea = document.getElementById("idea").value;
  const user = document.getElementById("user").value || "Anonymous";

  const finalType = 
    typeSelect.value === "custom"
    ? customType.value
    : typeSelect.value;

  const subject = "Arduino Guide Feedback: " + finalType;

  const body =
    "Type: " + finalType + "\n" +
    "User: " + user + "\n\n" +
    "Message:\n" + idea;

  const mailtoLink =
    `mailto:guidecommunity.contacts@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
}

function downloadQRCode() {
  fetch('QR-Code.png')
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ArduinoGuideQRCode.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    })
    .catch(() => alert('Failed to download QR code'));
}
/*-------------------___ pdf download ___-------------------------------*/

/* Go to Feedback.html for the script leave it there*/

/*-------------------___ Example copy function + download ___---------------------------*/

function copyCode(btn){
  const code = btn.parentElement.querySelector("pre").innerText;
  navigator.clipboard.writeText(code).then(()=>{
    btn.textContent="✓";
    setTimeout(()=>btn.textContent="Copy",900);
  });
}
function downloadCode(btn){
  const old = btn.innerText;
  btn.innerText = "Downloading...";

  const block = btn.parentElement;
  const code = block.querySelector("pre").innerText;
  const name = block.dataset.filename || "code";

  downloadFile(code, name + ".ino");

  setTimeout(()=>{
    downloadFile(code, name + ".txt");
    btn.innerText = "✔ Downloaded";
    setTimeout(()=> btn.innerText = old, 1500);
  }, 1000);
}

function downloadFile(content, filename){
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/*--------------- Examples ---------------*/
function loadExample(type){
  activatePage("examples", false);
  const box = document.getElementById("exampleBox");

  if(type === "code"){
    box.innerHTML = `
      <h2>What and why</h2>
      <p>Way does some code needs to be typed in it's own way and you can't type it in any other way:</p>
<div class="code-block" data-filename="Code">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

So code like:
pinMode - needs to be pin+M+ode you can try to type it other way but it may not work.

digitalWrite - same way as the pinMode just a another command you call.

HIGH/LOW/INPUT/OUTPUT/... - all NEED to be all caps trust me,
I tryed in other ways some work but this is standard
so just use all caps when typing command outputs.
Also Im personaly using the names commands/com-output and so on you can feel free to use all of these
names, but I don't know if it's used by "professionals",
Im self taught so Im saying stuff my way you find your or use my way feel free.
I can't stop you or make you I can just Guide you :) . // Robot hehe.   you know im not so w you saying.  ok il stop posably. you misspaled it so did i so you know what.  w.  ntg.  :).

analogRead/digitalRead/Serial.print - all and more shown in rest of examples follow same way of type in them
somewhere you might find other ways but this is more or less standard snytax.

  </pre>
      </div>
    `;
  }

  if(type === "blink"){
    box.innerHTML = `
      <h2>Blink LED</h2>
      <p>Basic digital output example.</p>
<div class="code-block" data-filename="blink">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// This code runs repeatedly on the Arduino
// It makes the built-in LED blink on and off

// Set digital pin 13 as an OUTPUT
// Pin 13 has a built-in LED on most Arduino boards
pinMode(13, OUTPUT);

// Turn the LED ON by setting the pin HIGH (5V)
digitalWrite(13, HIGH);

// Pause the program for 1000 milliseconds (1 second)
delay(1000);

// Turn the LED OFF by setting the pin LOW (0V)
digitalWrite(13, LOW);

// Pause again for 1 second
delay(1000);

// After this, the code repeats forever
        </pre>
      </div>
    `;
  }

  if(type === "button"){
    box.innerHTML = `
      <h2>Button Input</h2>
      <p>Read a button using a digital pin.</p>
<div class="code-block" data-filename="button">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Set pin 2 as an INPUT pin
// This pin will read HIGH (5V) or LOW (0V)
pinMode(2, INPUT);

// Read the current state of the button
// HIGH = button pressed (depending on wiring)
// LOW  = button not pressed
int value = digitalRead(2);

// NOTE:
// Without a pull-up or pull-down resistor,    // waht ar these res?.  idk relay i used tham but ye. k i guss ;).  (;.
// the value may randomly change (floating pin)

        </pre>
      </div>
    `;
  }

  if(type === "button-led"){
    box.innerHTML = `
      <h2>Button + LED</h2>
      <p>Turn an LED on when a button is pressed.</p>
<div class="code-block" data-filename="button-led">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Configure pin 2 to read button input
pinMode(2, INPUT);

// Configure pin 13 to control the LED
pinMode(13, OUTPUT);

// Read the button state
// If pin 2 reads HIGH, the button is pressed
if(digitalRead(2) == HIGH){

  // Button is pressed → turn LED ON
  digitalWrite(13, HIGH);

}else{

  // Button not pressed → turn LED OFF
  digitalWrite(13, LOW);
}

// This code should be inside loop()
// so it continuously checks the button

        </pre>
      </div>
    `;
  }

  if(type === "pwm"){
    box.innerHTML = `
      <h2>PWM LED (Fade)</h2>
      <p>Control LED brightness using PWM (~ pins).</p>

      <div class="code-block" data-filename="PWM">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
        <pre>

// Set pin 9 as OUTPUT
// Pin 9 supports PWM (~ symbol on Arduino)
pinMode(9, OUTPUT);

// Write a PWM value to the pin
// 0   = always OFF
// 255 = always ON
// Values in between simulate brightness
analogWrite(9, 128); // ~50% brightness

// NOTE:
// PWM is NOT true analog voltage
// It rapidly switches the pin ON and OFF

        </pre>
      </div>
    `;
  }

  if(type === "multi-led"){
    box.innerHTML = `
      <h2>Multiple LEDs</h2>
      <p>Control more than one LED.</p>
<div class="code-block" data-filename="multi-led">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Set pin 13 as OUTPUT (LED 1)
pinMode(13, OUTPUT);

// Set pin 12 as OUTPUT (LED 2)
pinMode(12, OUTPUT);

// Set pin 11 as OUTPUT (LED 3)
pinMode(11, OUTPUT);

// Turn ON LED connected to pin 13
digitalWrite(13, HIGH);

// Turn OFF LED connected to pin 12
digitalWrite(12, LOW);

// Turn OFF LED connected to pin 11
digitalWrite(11, LOW);

// All three pins are controlled independently
        </pre>
      </div>
    `;
  }

  if(type === "buzzer"){
    box.innerHTML = `
      <h2>Buzzer Sound</h2>
      <p>Make sound using a buzzer.</p>
<div class="code-block" data-filename="buzzer">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Set pin 6 as OUTPUT
// Buzzer signal pin is connected here
pinMode(6, OUTPUT);

// Generate a sound at 1000 Hz (1 kHz)
// Works with passive buzzers
tone(6, 1000);

// Keep the sound playing for 500 ms
delay(500);

// Stop the sound
noTone(6);

// NOTE:
// Active buzzers do NOT need tone()
// They only need HIGH or LOW

        </pre>
      </div>
    `;
  }

  if(type === "analog"){
    box.innerHTML = `
      <h2>Analog Sensor</h2>
      <p>Read a sensor value (0–1023).</p>
<div class="code-block" data-filename="analog">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Read analog voltage from pin A0
// Arduino converts voltage to a number:
// 0   = 0V
// 1023 = reference voltage (usually 5V)
int value = analogRead(A0);

// Example:
// ~512 ≈ 2.5V (half of 5V)

// NOTE:
// analogRead does NOT measure current
// Only voltage

        </pre>
      </div>
    `;
  }

if(type === "joystick"){
  box.innerHTML = `
    <h2>Joystick (Analog + Button)</h2>
    <p>
      Read X/Y movement and button press from a joystick module.
      Uses analog pins and one digital pin.
    </p>
<div class="code-block" data-filename="joystick">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Joystick connections
// VRx -> A0
// VRy -> A1
// SW  -> Pin 2

void setup(){
  pinMode(2, INPUT_PULLUP); // Joystick button
  Serial.begin(9600);
}

void loop(){
  int x = analogRead(A0); // X-axis (0–1023)
  int y = analogRead(A1); // Y-axis (0–1023)
  int button = digitalRead(2); // LOW when pressed

  Serial.print("X: ");
  Serial.print(x);
  Serial.print("  Y: ");
  Serial.print(y);
  Serial.print("  Button: ");
  Serial.println(button == LOW ? "Pressed" : "Released");

  delay(200);
}
      </pre>
    </div>
  `;
}

if(type === "oled"){
  box.innerHTML = `
    <h2>OLED Display (4-Pin I²C)</h2>
    <p>
      Display text on a small OLED screen using I²C.
      Uses only SDA and SCL pins.
    </p>
<div class="code-block" data-filename="oled">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire);

void setup(){
  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)){
    while(true); // Stop if OLED not found
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 0);
  display.println("Arduino OLED");
  display.println("4-pin I2C");
  display.display();
}
// hey also the // is wisibile in the page do we erase it or?.  no no we do not.  ok w?. w? way to do?.  i guss so.
void loop(){
  // Nothing here for now
}
      </pre>
    </div>

    <p><i>
      Wiring: VCC → 5V / 3.3V, GND → GND, SDA → A4, SCL → A5
    </i></p>
  `;
}

  if(type === "serial"){
    box.innerHTML = `
      <h2>Serial Monitor</h2>
      <p>Send data to the PC via USB.</p>
<div class="code-block" data-filename="serial">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Setup runs once
void setup(){
  // Start serial communication at 9600 baud rate
  Serial.begin(9600);
}

// Loop runs repeatedly
void loop(){
  // Print "Hello" to serial monitor
  Serial.println("Hello");
  
  // Wait 1 second
  delay(1000);
}
        </pre>
      </div>
    `;
  }

  if(type === "timer"){
    box.innerHTML = `
      <h2>Timers (millis)</h2>
      <p>Run code without blocking.</p>
<div class="code-block" data-filename="timer">
  <button class="btn-action" onclick="copyCode(this)">Copy</button>
  <button class="btn-action" style="right:70px" onclick="downloadCode(this)">Download</button>
  <pre>

// Store the last time the action happened
// unsigned long is required for millis()
unsigned long t = 0;

void loop(){

  // millis() returns time since Arduino started (ms)
  // This checks if 1 second has passed
  if(millis() - t > 1000){

    // Update the timer
    t = millis();

    // Toggle LED state:
    // If ON → OFF
    // If OFF → ON
    digitalWrite(13, !digitalRead(13));
  }

  // Code here keeps running without delay()
}

// This method allows multitasking

        </pre>
      </div>
    `;
  }
}
