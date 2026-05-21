
const data = {
/* =================== PINS =================== */
pins:[
  /* ---------- QUIZ 1 (Easy) ---------- */
  [
    {type:"mc",q:"Which pins are used for Serial communication on Arduino Uno?",a:["D0 & D1","A0 & A1","D13 & D12"],c:0},
    {type:"mc",q:"Which pin has the built-in LED?",a:["D13","D8","A0"],c:0},
    {type:"mc",q:"Which symbol marks PWM pins?",a:["~","!","#"],c:0},
    {type:"mc",q:"How many digital pins does Arduino Uno have?",a:["14","10","6"],c:0},
    {type:"fill",q:"Analog input pins start with the letter __",c:"A"}
  ],

  /* ---------- QUIZ 2 (Beginner) ---------- */
  [
    {type:"fill",q:"I2C data (SDA) pin is __",c:"A4"},
    {type:"fill",q:"I2C clock (SCL) pin is __",c:"A5"},
    {type:"fill",q:"SPI MOSI pin is __",c:"11"},
    {type:"mcm",q:"Which of these are PWM pins?",a:["D3","D5","D8","A0"],c:[0,1]},
    {type:"mc",q:"Which pin is RX (Serial Receive)?",a:["D0","D1","D2"],c:0},
    {type:"mc",q:"Which pin is TX (Serial Transmit)?",a:["D1","D0","D3"],c:0},
    {type:"mc",q:"Which pin is Ground?",a:["GND","5V","VIN"],c:0}
  ],

  /* ---------- QUIZ 3 (Intermediate) ---------- */
  [
    {type:"fill",q:"ADC resolution is __ bits",c:"10"},
    {type:"fill",q:"Arduino Uno clock speed is __ MHz",c:"16"},
    {type:"fill",q:"Maximum PWM value is __",c:"255"},
    {type:"fill",q:"Number of analog input pins is __",c:"6"},
    {type:"mcm",q:"Which of these are SPI pins?",a:["D10","D11","D12","D13"],c:[0,1,2,3]},
    {type:"mcm",q:"Which of these are analog pins?",a:["A0","A1","D2","D5"],c:[0,1]},
    {type:"mc",q:"What does pinMode() set?",a:["Pin direction","Pin voltage","Clock speed"],c:0},
    {type:"mc",q:"What voltage does HIGH represent?",a:["5V","3.3V","0V"],c:0},
    {type:"mc",q:"What voltage does LOW represent?",a:["0V","5V","3.3V"],c:0}
  ],

  /* ---------- QUIZ 4 (Advanced – 12 Q) ---------- */
  [
    {type:"mc",q:"Which pins should be avoided while uploading code?",a:["D0 & D1","D10 & D11","A4 & A5"],c:0},
    {type:"mc",q:"Which function reads analog input?",a:["analogRead()","digitalRead()","analogWrite()"],c:0},
    {type:"mc",q:"Which pin is the SPI Slave Select (SS)?",a:["D10","D11","D13"],c:0},
    {type:"fill",q:"AnalogRead() returns values from 0 to __",c:"1023"},
    {type:"fill",q:"PWM resolution is __ bits",c:"8"},
    {type:"fill",q:"Digital pins operate at __ logic levels",c:"2"},
    {type:"mcm",q:"Which pins support hardware PWM?",a:["3","5","6","9","10","11"],c:[0,1,2,3,4,5]},
    {type:"mc",q:"Which pin is connected to the onboard LED?",a:["13","12","8"],c:0},
    {type:"mc",q:"Which function sets pin as OUTPUT?",a:["pinMode()","digitalWrite()","analogWrite()"],c:0},
    {type:"mc",q:"Which pin is SPI MISO?",a:["12","11","13"],c:0},
    {type:"mc",q:"Which pin is SPI SCK?",a:["13","10","11"],c:0},
    {type:"mc",q:"Which pin is SPI MOSI?",a:["11","12","10"],c:0}
  ],

  /* ---------- QUIZ 5 (Expert – 15 Q) ---------- */
  [
    {type:"mc",q:"Which pin is NOT safe for powering motors?",a:["5V","VIN","GND"],c:0},
    {type:"mc",q:"Which pin supports interrupts on Uno?",a:["2 & 3","8 & 9","10 & 11"],c:0},
    {type:"mc",q:"Which pins are used for I2C?",a:["A4 & A5","D2 & D3","D10 & D11"],c:0},
    {type:"mc",q:"Which function outputs PWM?",a:["analogWrite()","digitalWrite()","analogRead()"],c:0},
    {type:"fill",q:"Interrupt pin INT0 is __",c:"2"},
    {type:"fill",q:"Interrupt pin INT1 is __",c:"3"},
    {type:"fill",q:"SPI clock pin is __",c:"13"},
    {type:"fill",q:"SPI MISO pin is __",c:"12"},
    {type:"fill",q:"SPI MOSI pin is __",c:"11"},
    {type:"fill",q:"SPI SS pin is __",c:"10"},
    {type:"mcm",q:"Which pins should NOT be used while uploading?",a:["0","1","2","3"],c:[0,1]},
    {type:"mc",q:"Which voltage can damage Arduino pins?",a:["Above 5V","3.3V","0V"],c:0},
    {type:"mc",q:"Which pins can act as digital inputs?",a:["All GPIO pins","Only analog","Only PWM"],c:0},
    {type:"mc",q:"Which pin is usually used for status LED?",a:["13","7","2"],c:0},
    {type:"mc",q:"What happens if pin is floating?",a:["Random values","Always LOW","Always HIGH"],c:0}
  ]
],

/* =================== HARDWARE =================== */
hardware:[

/* ---------- QUIZ 1 (Easy – 6) ---------- */
[
  {type:"fill",q:"USB-to-Serial chip on Uno is __",c:"CH340"},
  {type:"fill",q:"Main output voltage is __ V",c:"5"},
  {type:"fill",q:"Crystal frequency is __ MHz",c:"16"},
  {type:"fill",q:"Flash memory size is __ KB",c:"32"},
  {type:"fill",q:"SRAM size is __ KB",c:"2"},
  {type:"fill",q:"EEPROM size is __ KB",c:"1"}
],

/* ---------- QUIZ 2 (Beginner – 8) ---------- */
[
  {type:"fill",q:"Reset pin is labeled __",c:"RESET"},
  {type:"mc",q:"Voltage regulator does what?",a:["Controls voltage","Stores data","Boosts power"],c:0},
  {type:"mc",q:"Capacitor is used to?",a:["Smooth power","Store code","Increase speed"],c:0},
  {type:"mc",q:"Crystal oscillator provides?",a:["Clock signal","Power","Reset"],c:0},
  {type:"mc",q:"ATmega328P is a?",a:["Microcontroller","Sensor","Voltage regulator"],c:0},
  {type:"mc",q:"If the crystal fails, the board will?",a:["Not boot","Run faster","Use more power"],c:0},
  {type:"mc",q:"If regulator fails, the board will?",a:["Turn off","LED stays on","USB still works"],c:0},
  {type:"mc",q:"Short on 5V will?",a:["Reset board","Do nothing","Overheat"],c:2}
],

/* ---------- QUIZ 3 (Intermediate – 14) ---------- */
[
  {type:"fill",q:"Arduino Uno uses __ USB communication",c:"serial"},
  {type:"fill",q:"VIN input range is __ V",c:"7-12"},
  {type:"fill",q:"ICSP header is used for __",c:"SPI"},
  {type:"fill",q:"Bootloader is uploaded using __",c:"USB"},
  {type:"fill",q:"Reset pin is active __",c:"LOW"},
  {type:"mc",q:"Which chip runs your sketch?",a:["ATmega328P","USB chip","Crystal"],c:0},
  {type:"mc",q:"Which memory stores your program?",a:["Flash","SRAM","EEPROM"],c:0},
  {type:"mc",q:"Which pin restarts the board?",a:["RESET","5V","GND"],c:0},
  {type:"mc",q:"Holding RESET LOW will?",a:["Restart","Stop","Run normally"],c:1},
  {type:"mc",q:"Too high VIN causes?",a:["Overheat","Faster speed","No effect"],c:0},
  {type:"mc",q:"Removing USB power will?",a:["Stop board","Continue running","Overvoltage"],c:0},
  {type:"mc",q:"Which supplies stable clock?",a:["Crystal","Capacitor","Regulator"],c:0},
  {type:"mc",q:"Which part filters noise?",a:["Capacitor","Crystal","Flash"],c:0},
  {type:"mc",q:"Which part protects voltage?",a:["Regulator","EEPROM","SRAM"],c:0}
],

/* ---------- QUIZ 4 (Advanced – 10) ---------- */
[
  {type:"mc",q:"Which pin provides raw input voltage?",a:["VIN","5V","3.3V"],c:0},
  {type:"mc",q:"Which part handles USB communication?",a:["USB chip","ATmega","Regulator"],c:0},
  {type:"fill",q:"Uno logic voltage is __ V",c:"5"},
  {type:"fill",q:"Maximum VIN is __ V",c:"12"},
  {type:"mc",q:"If VIN is below 7V?",a:["Unstable","Faster","No change"],c:0},
  {type:"mc",q:"If regulator overheats?",a:["Shuts down","Boosts","Nothing"],c:0},
  {type:"mc",q:"Which memory loses data on power off?",a:["SRAM","Flash","EEPROM"],c:0},
  {type:"mc",q:"Which memory keeps data without power?",a:["EEPROM","SRAM","Cache"],c:0},
  {type:"mc",q:"Which part protects USB from damage?",a:["Polyfuse","Crystal","Capacitor"],c:0},
  {type:"mc",q:"Which chip controls the board?",a:["ATmega328P","USB chip","Regulator"],c:0}
],

/* ---------- QUIZ 5 (Expert – 15) ---------- */
[
  {type:"mc",q:"Which part limits USB current?",a:["Polyfuse","Crystal","SRAM"],c:0},
  {type:"mc",q:"Which capacitor type is polarized?",a:["Electrolytic","Ceramic","Film"],c:0},
  {type:"mc",q:"Which chip converts USB to Serial?",a:["CH340","ATmega","Regulator"],c:0},
  {type:"fill",q:"Uno max current per pin is __ mA",c:"40"},
  {type:"fill",q:"Recommended current per pin is __ mA",c:"20"},
  {type:"fill",q:"3.3V pin max current is __ mA",c:"50"},
  {type:"mc",q:"Which protects reverse polarity?",a:["Diode","Crystal","EEPROM"],c:0},
  {type:"mc",q:"Shorting GND and 5V will?",a:["Damage","Charge","Boost"],c:0},
  {type:"mc",q:"Too much current causes?",a:["Overheating","Faster","Stable"],c:0},
  {type:"mc",q:"Which part smooths voltage?",a:["Capacitor","SRAM","USB chip"],c:0},
  {type:"mc",q:"Which part generates clock?",a:["Crystal","Regulator","EEPROM"],c:0},
  {type:"mc",q:"Which memory is fastest?",a:["SRAM","Flash","EEPROM"],c:0},
  {type:"mc",q:"Which part resets MCU?",a:["Reset circuit","Crystal","USB chip"],c:0},
  {type:"mc",q:"Which stores bootloader?",a:["Flash","EEPROM","SRAM"],c:0},
  {type:"mc",q:"Which pin powers from adapter?",a:["VIN","5V","GND"],c:0}
],

/* ---------- QUIZ 6 (Advanced+ – 13) ---------- */
[
  {type:"mc",q:"Which pin powers board from barrel jack?",a:["VIN","5V","3.3V"],c:0},
  {type:"mc",q:"Which memory is erased on reset?",a:["SRAM","Flash","EEPROM"],c:0},
  {type:"fill",q:"Uno operating voltage is __ V",c:"5"},
  {type:"fill",q:"USB voltage is __ V",c:"5"},
  {type:"fill",q:"Bootloader size is about __ KB",c:"0.5"},
  {type:"mc",q:"If EEPROM is full?",a:["Old data overwritten","Stops","Speeds up"],c:0},
  {type:"mc",q:"If flash is corrupted?",a:["No program","Faster","Overheat"],c:0},
  {type:"mc",q:"Which chip stores sketches?",a:["Flash","SRAM","EEPROM"],c:0},
  {type:"mc",q:"Which part ensures stable reset?",a:["Reset capacitor","Crystal","USB chip"],c:0},
  {type:"mc",q:"Which part steps down voltage?",a:["Regulator","Capacitor","EEPROM"],c:0},
  {type:"mc",q:"Which part is most heat sensitive?",a:["Regulator","Crystal","EEPROM"],c:0},
  {type:"mc",q:"Which chip handles USB?",a:["CH340","ATmega","Regulator"],c:0},
  {type:"mc",q:"Which memory is non-volatile?",a:["EEPROM","SRAM","Cache"],c:0}
],

/* ---------- QUIZ 7 (Master – 20) ---------- */
[
  {type:"mc",q:"Which part limits USB current?",a:["Polyfuse","Capacitor","Crystal"],c:0},
  {type:"mc",q:"Which component protects against reverse polarity?",a:["Diode","Crystal","EEPROM"],c:0},
  {type:"mc",q:"Which voltage can damage the Uno?",a:["Above 5V","3.3V","0V"],c:0},
  {type:"mc",q:"Which part stabilizes voltage?",a:["Capacitor","Crystal","EEPROM"],c:0},
  {type:"mc",q:"Which part generates the clock?",a:["Crystal","Regulator","SRAM"],c:0},
  {type:"mc",q:"Which chip runs the program?",a:["ATmega328P","USB chip","Regulator"],c:0},
  {type:"fill",q:"Maximum current per I/O pin is __ mA",c:"40"},
  {type:"fill",q:"Recommended current per I/O pin is __ mA",c:"20"},
  {type:"fill",q:"Flash memory size is __ KB",c:"32"},
  {type:"fill",q:"SRAM memory size is __ KB",c:"2"},
  {type:"fill",q:"EEPROM memory size is __ KB",c:"1"},
  {type:"fill",q:"Operating voltage is __ V",c:"5"},
  {type:"fill",q:"Crystal speed is __ MHz",c:"16"},
  {type:"mc",q:"If regulator fails?",a:["Board shuts down","Speeds up","Charges"],c:0},
  {type:"mc",q:"If crystal fails?",a:["No boot","Runs faster","Overvoltage"],c:0},
  {type:"mc",q:"Shorting 5V and GND will?",a:["Damage board","Charge battery","Boost power"],c:0},
  {type:"mc",q:"Which part protects USB port?",a:["Polyfuse","EEPROM","SRAM"],c:0},
  {type:"mc",q:"Which memory keeps data after power off?",a:["EEPROM","SRAM","Cache"],c:0},
  {type:"mc",q:"Which memory is volatile?",a:["SRAM","Flash","EEPROM"],c:0},
  {type:"mc",q:"Which part steps down VIN?",a:["Regulator","Crystal","SRAM"],c:0}
]

],

/* =================== SOFTWARE =================== */
software:[

/* ---------- QUIZ 1 ---------- */
[
  {type:"fill",q:"setup() runs __ time(s)",c:"once"},
  {type:"fill",q:"loop() runs __",c:"forever"},
  {type:"fill",q:"Serial.begin default speed is __",c:"9600"},
  {type:"mc",q:"pinMode() sets pin?",a:["Direction","Voltage","Clock"],c:0},
  {type:"mc",q:"digitalWrite() changes?",a:["State","Speed","Mode"],c:0}
],

/* ---------- QUIZ 2 ---------- */
[
  {type:"fill",q:"delay() uses __",c:"milliseconds"},
  {type:"fill",q:"HIGH equals __",c:"1"},
  {type:"fill",q:"LOW equals __",c:"0"},
  {type:"mc",q:"Which prints to Serial?",a:["Serial.print","pinMode","delay"],c:0}
],

/* ---------- QUIZ 3 ---------- */
[
  {type:"mc",q:"Which function runs first?",a:["setup","loop","main"],c:0},
  {type:"mc",q:"Which function repeats?",a:["loop","setup","start"],c:0},
  {type:"fill",q:"To read digital pin use __",c:"digitalRead"},
  {type:"fill",q:"To read analog pin use __",c:"analogRead"},
  {type:"fill",q:"PWM output uses __",c:"analogWrite"},
  {type:"mc",q:"Which pauses program?",a:["delay","Serial","pinMode"],c:0},
  {type:"mc",q:"Which compares equal?",a:["==","=","==="],c:0},
  {type:"mc",q:"Which is a comment?",a:["//","##","**"],c:0}
],

/* ---------- QUIZ 4 ---------- */
[
  {type:"mc",q:"Which sets serial speed?",a:["Serial.begin","Serial.print","Serial.read"],c:0},
  {type:"mc",q:"Which reads serial data?",a:["Serial.read","Serial.print","delay"],c:0},
  {type:"fill",q:"Serial baud rate is __",c:"9600"},
  {type:"fill",q:"For loop uses __ loops",c:"for"},
  {type:"mc",q:"Which is logical AND?",a:["&&","||","!"],c:0},
  {type:"mc",q:"Which is logical OR?",a:["||","&&","!"],c:0},
  {type:"mc",q:"Which means NOT?",a:["!","&&","||"],c:0},
  {type:"mc",q:"Which stores whole numbers?",a:["int","float","char"],c:0},
  {type:"mc",q:"Which stores decimal?",a:["float","int","bool"],c:0},
  {type:"fill",q:"Fix: pinMode(13, IN);",c:"pinMode(13, OUTPUT);"}
],

/* ---------- QUIZ 5 ---------- */
[
  {type:"mc",q:"Which creates a function?",a:["void","int","char"],c:0},
  {type:"mc",q:"Which exits a loop?",a:["break","stop","exit"],c:0},
  {type:"mc",q:"Which repeats while true?",a:["while","if","for"],c:0},
  {type:"mc",q:"Which converts text to number?",a:["toInt","parse","cast"],c:0},
  {type:"mc",q:"Which reads serial input?",a:["Serial.read","Serial.write","delay"],c:0},
  {type:"mc",q:"Which sends serial data?",a:["Serial.print","Serial.read","pinMode"],c:0},
  {type:"mc",q:"Which checks condition?",a:["if","for","void"],c:0},
  {type:"mc",q:"Which repeats a set number of times?",a:["for","while","loop"],c:0},

  {type:"fill",q:"Fix: digitalWrite(13, ON);",c:"digitalWrite(13, HIGH);"},
  {type:"fill",q:"Fix: if(x=5)",c:"if(x==5)"},
  {type:"fill",q:"Fix: Serial.begin;",c:"Serial.begin(9600);"},
  {type:"fill",q:"Fix: delay 1000;",c:"delay(1000);"},
  {type:"fill",q:"Fix: int x == 5;",c:"int x = 5;"}
],

/* ---------- QUIZ 6 ---------- */
[
  {type:"mc",q:"Which reads PWM value?",a:["analogRead","digitalRead","delay"],c:0},
  {type:"mc",q:"Which sends PWM?",a:["analogWrite","digitalWrite","Serial.print"],c:0},
  {type:"mc",q:"Which stops code?",a:["return","stop","exit"],c:0},
  {type:"mc",q:"Which defines constant?",a:["const","#define","static"],c:0},
  {type:"mc",q:"Which creates array?",a:["int a[5]","int a(5)","array a"],c:0},
  {type:"mc",q:"Which checks multiple cases?",a:["switch","if","while"],c:0},
  {type:"mc",q:"Which delays without blocking?",a:["millis","delay","sleep"],c:0},
  {type:"mc",q:"Which stores true/false?",a:["bool","int","char"],c:0},
  {type:"mc",q:"Which handles time?",a:["millis","delay","clock"],c:0},
  {type:"mc",q:"Which repeats forever?",a:["loop","main","setup"],c:0},
  {type:"mc",q:"Which stops a loop?",a:["break","continue","return"],c:0},
  {type:"mc",q:"Which skips one loop?",a:["continue","break","stop"],c:0},

  {type:"fill",q:"Fix: if(x==5);",c:"if(x==5)"},
  {type:"fill",q:"Fix: for i<5;",c:"for(int i=0;i<5;i++)"},
  {type:"fill",q:"Fix: while x<10",c:"while(x<10)"},
  {type:"fill",q:"Fix: Serial.print;",c:"Serial.print(x);"},
  {type:"fill",q:"Fix: pinMode(8, OUTPUT",c:"pinMode(8, OUTPUT);"},
  {type:"fill",q:"Fix: digitalRead = 8;",c:"digitalRead(8);"},
  {type:"fill",q:"Fix: analogWrite(300);",c:"analogWrite(pin,255);"}
],

/* ---------- QUIZ 7 ---------- */
[
  {type:"mc",q:"Which returns value?",a:["return","break","void"],c:0},
  {type:"mc",q:"Which creates loop?",a:["for","case","goto"],c:0},
  {type:"mc",q:"Which stores text?",a:["String","int","bool"],c:0},
  {type:"mc",q:"Which handles serial data?",a:["Serial","EEPROM","Wire"],c:0},
  {type:"mc",q:"Which library handles I2C?",a:["Wire","SPI","EEPROM"],c:0},
  {type:"mc",q:"Which library handles SPI?",a:["SPI","Wire","Serial"],c:0},
  {type:"mc",q:"Which creates object?",a:["new","make","create"],c:0},
  {type:"mc",q:"Which defines macro?",a:["#define","const","static"],c:0},
  {type:"mc",q:"Which delays using system time?",a:["millis","delay","sleep"],c:0},
  {type:"mc",q:"Which converts int to text?",a:["String()","toString","print"],c:0},
  {type:"mc",q:"Which compares greater?",a:[">","<","=="],c:0},
  {type:"mc",q:"Which compares less?",a:["<",">","!="],c:0},
  {type:"mc",q:"Which means NOT?",a:["!","&&","||"],c:0},
  {type:"mc",q:"Which operator adds?",a:["+","-","*"],c:0},
  {type:"mc",q:"Which operator multiplies?",a:["*","+","/"],c:0},
  {type:"mc",q:"Which creates delay in seconds?",a:["delay(1000)","delay(1)","delay(100)"],c:0},
  {type:"mc",q:"Which reads analog?",a:["analogRead","digitalRead","Serial.read"],c:0},
  {type:"mc",q:"Which writes digital?",a:["digitalWrite","analogWrite","Serial.print"],c:0}
],

/* ---------- QUIZ 8 ---------- */
[
  {type:"mc",q:"Which library controls LCD?",a:["LiquidCrystal","Wire","SPI"],c:0},
  {type:"mc",q:"Which handles time without delay?",a:["millis","delay","clock"],c:0},
  {type:"mc",q:"Which keyword creates constant?",a:["const","#define","static"],c:0},
  {type:"mc",q:"Which stores decimal numbers?",a:["float","int","char"],c:0},
  {type:"mc",q:"Which starts Serial?",a:["Serial.begin","Serial.print","Serial.read"],c:0},
  {type:"mc",q:"Which function runs forever?",a:["loop","setup","main"],c:0},
  {type:"mc",q:"Which checks a condition?",a:["if","for","while"],c:0},
  {type:"mc",q:"Which sends data to PC?",a:["Serial.print","Serial.read","pinMode"],c:0},
  {type:"mc",q:"Which stops loop?",a:["break","continue","return"],c:0},
  {type:"mc",q:"Which skips iteration?",a:["continue","break","stop"],c:0},
  {type:"mc",q:"Which creates array?",a:["int a[5]","int a(5)","array a"],c:0},
  {type:"mc",q:"Which compares equal?",a:["==","=","==="],c:0},
  {type:"mc",q:"Which is a comment?",a:["//","##","**"],c:0},
  {type:"mc",q:"Which sets pin direction?",a:["pinMode","digitalWrite","analogRead"],c:0},
  {type:"mc",q:"Which reads sensor?",a:["analogRead","digitalRead","delay"],c:0},
  {type:"mc",q:"Which outputs PWM?",a:["analogWrite","digitalWrite","Serial.print"],c:0},

  {type:"fill",q:"Fix: if(x=3)",c:"if(x==3)"},
  {type:"fill",q:"Fix: Serial.print;",c:"Serial.print(x);"},
  {type:"fill",q:"Fix: for i<10;",c:"for(int i=0;i<10;i++)"},
  {type:"fill",q:"Fix: pinMode(5, IN);",c:"pinMode(5, INPUT);"},
  {type:"fill",q:"Fix: digitalWrite(8, TRUE);",c:"digitalWrite(8, HIGH);"}
]



]
};

let currentCategory = 'pins';
let currentQuizIndex = 0;
let userAnswers = [];
let totalQuestions = 0;
let progress = JSON.parse(localStorage.getItem("progress")) || {};
let mode = "quiz"; // "quiz" or "code"
let activeCodeChallenge = null;
let challengeTimer = null;
let challengeResult = null;
function getDraftKey(){
  return currentCategory + "-" + currentQuizIndex + "-draft";
}

function saveDraft(){
  localStorage.setItem(getDraftKey(), JSON.stringify(userAnswers[currentQuizIndex] || []));
}

function loadDraft(){
  const key = getDraftKey();
  return JSON.parse(localStorage.getItem(key) || "[]");
}

function clearDraft(){
  localStorage.removeItem(getDraftKey());
}
const board = {
  value: "uno"
};
