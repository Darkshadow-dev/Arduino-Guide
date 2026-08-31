/*------------------------------------___  Main Script ___------------------------*/

/*-------------___ Page script ___----------------*/

const STORAGE_KEY = "arduino-last-page";

/* ACTIVATE PAGE */
function activatePage(id, save = true) {

  const target = document.getElementById(id);

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  if (target) {

    target.classList.add("active");

    updateDropdownTitles(id);

    if (save) {
      localStorage.setItem(STORAGE_KEY, id);
    }

  } else {

    const notFound = document.getElementById("notfound");

    if (notFound) {
      notFound.classList.add("active");
    }

    if (save) {
      localStorage.setItem(STORAGE_KEY, "notfound");
    }
  }

  /* FORCE TOP */

  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "instant"
  });

  requestAnimationFrame(() => {

    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    window.scrollTo(0, 0);

  });
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

    /* #section */
    if (href.startsWith("#")) {

      e.preventDefault();

      const id = href.substring(1);

      activatePage(id);

      history.pushState(null, "", href);

      return;
    }

    /* page.html#section */
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

/* RESTORE LAST PAGE */
window.addEventListener("load", () => {

  const hash = location.hash.substring(1);

  const last =
    localStorage.getItem(STORAGE_KEY) || "home";

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
/*-----------------Dropdown title-----------------------------*/
function updateDropdownTitles(page){

  document.querySelectorAll(".dropdown").forEach(dropdown=>{

    const title = dropdown.querySelector(".dropdown-title");
    if(!title) return;

    // Save the default title once
    if(!title.dataset.defaultTitle){
      title.dataset.defaultTitle = title.textContent.trim();
    }

    const links = dropdown.querySelectorAll(".dropdown-menu a");

    let found = false;

    links.forEach(link=>{

      const href = link.getAttribute("href");

      if(href && href.endsWith("#" + page)){
        title.textContent = link.textContent.trim();
        found = true;
      }

    });

    // Restore the original title if page isn't in this dropdown
    if(!found){
      title.textContent = title.dataset.defaultTitle;
    }

  });

}

/*------------ Side dropdown ----------------*/
/* deleted on 8/7/2026 at 10:28*/

function toggleLP(btn){
  const card = btn.parentElement;

  document.querySelectorAll(".lp-card").forEach(c=>{
    if(c!==card) c.classList.remove("active");
  });

  card.classList.toggle("active");
}

/*-------------- Animation on hardwarevi page --------------*/
/* ========================================= WIRE ANIMATIONS ========================================= */

const wireOverlay   = document.getElementById("wireOverlay");
const wireZoomImg   = document.getElementById("wireZoomImg");
const wireZoomAnim  = document.getElementById("wireZoomAnim");

const zoomPrev = document.getElementById("zoomPrev");
const zoomNext = document.getElementById("zoomNext");

/* =========================================
   ANIMATION ENGINE
========================================= */

/* =========================================
   FIXED ZOOM ANIMATION
========================================= */

function startWireAnimation(container){

  const frames = container.querySelectorAll(
    ".wire-frame, .wire-zoom-frame"
  );

  if(frames.length <= 1) return;

  let index = 0;

  frames.forEach((f,i)=>{
    f.style.display = i === 0 ? "block" : "none";
  });

  if(container.animInterval){
    clearInterval(container.animInterval);
  }

  container.animInterval = setInterval(()=>{

    frames[index].style.display = "none";

    index++;

    if(index >= frames.length){
      index = 0;
    }

    frames[index].style.display = "block";

  },700);

}

/* START ALL PAGE ANIMATIONS */
document.querySelectorAll("[data-wire-anim]").forEach(anim=>{
  startWireAnimation(anim);
});

/* =========================================
   GALLERIES
========================================= */

document.querySelectorAll("[data-wire-gallery]").forEach(gallery=>{

  const slides = gallery.querySelectorAll(".wire-slide");

  const prev = gallery.querySelector(".gallery-prev");
  const next = gallery.querySelector(".gallery-next");

  let current = 0;

  function showSlide(i){

    slides.forEach(s=>s.classList.remove("active"));

    slides[i].classList.add("active");

    current = i;
  }

  prev.addEventListener("click", ()=>{

    let i = current - 1;

    if(i < 0){
      i = slides.length - 1;
    }

    showSlide(i);

  });

  next.addEventListener("click", ()=>{

    let i = current + 1;

    if(i >= slides.length){
      i = 0;
    }

    showSlide(i);

  });

  /* =========================================
     ZOOM
  ========================================= */

  slides.forEach((slide,slideIndex)=>{

    slide.addEventListener("click", ()=>{

      wireOverlay.classList.add("active");

      /* IMAGE */
      const img = slide.querySelector(".wire-img");

      /* ANIMATION */
      const anim = slide.querySelector("[data-wire-anim]");

      wireZoomImg.style.display = "none";
      wireZoomAnim.style.display = "none";

      /* STATIC IMAGE */
      if(img){

        wireZoomImg.src = img.src;
        wireZoomImg.style.display = "block";

      }

      /* ANIMATION */
      if(anim){

        wireZoomAnim.innerHTML = "";

        const frames = anim.querySelectorAll(".wire-frame");

        frames.forEach(frame=>{

          const clone = document.createElement("img");

          clone.src = frame.src;
          clone.className = "wire-zoom-frame";

          wireZoomAnim.appendChild(clone);

        });

        wireZoomAnim.style.display = "block";

        startWireAnimation(wireZoomAnim);

      }

      /* OVERLAY ARROWS */
      zoomPrev.onclick = ()=>{

        let i = slideIndex - 1;

        if(i < 0){
          i = slides.length - 1;
        }

        slides[i].click();

      };

      zoomNext.onclick = ()=>{

        let i = slideIndex + 1;

        if(i >= slides.length){
          i = 0;
        }

        slides[i].click();

      };

    });

  });

});

/* =========================================
   CLOSE ZOOM
========================================= */

wireOverlay.addEventListener("click",(e)=>{

  if(
    e.target === wireOverlay ||
    e.target === wireZoomImg
  ){
    wireOverlay.classList.remove("active");
  }

});


/*-------------- 3D model renderer--------------- */

//const renderer = new THREE.WebGLRenderer({
  //canvas: document.getElementById("uno3d"),
  //antialias: true,
  //alpha: true // <- this removes black background
//});

//renderer.setClearColor(0x000000, 0); // fully transparent
//It all works <---------------------------------With out it! <-------------------
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

/*-------------------___ pdf download ___-------------------------------*/

/* Go to Feedback.html for the script leave it there*/



/*--------------------___ CLI download ___-----------------------------------*/
function DownloadScript(){

  const url = "https://github.com/user-attachments/files/28847876/Arduino-CLI-Help.py";

  const a = document.createElement("a");
  a.href = url;
  a.download = "arduino_cli_installer.py";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/*-------------------___ Example copy function + download ___---------------------------*/

function filterExamples(level){
  const items = document.querySelectorAll(".example-item");
  const headers = document.querySelectorAll(".examples-menu h3");

  items.forEach(item=>{
    if(level === "all" || item.dataset.level === level){
      item.style.display = "block";
    } else {
      item.style.display = "none";
    }
  });

  // hide empty headers
  headers.forEach(h=>{
    let next = h.nextElementSibling;
    let visible = false;

    while(next && !next.matches("h3")){
      if(next.style.display !== "none") visible = true;
      next = next.nextElementSibling;
    }

    h.style.display = visible ? "block" : "none";
  });
}

function copyCode(btn){
  const code = btn.parentElement.querySelector("pre").innerText;
  navigator.clipboard.writeText(code).then(()=>{
    btn.textContent="✓";
    setTimeout(()=>btn.textContent="Copy",900);
  });
}

function copyCode(button){

  const codeBlock = button.closest(".code-block");

  if(!codeBlock) return;

  const pre = codeBlock.querySelector("pre");

  if(!pre) return;

  const code = pre.textContent;

  navigator.clipboard.writeText(code)
    .then(() => {
      showPopup("Code copied");
    })
    .catch(() => {

      /* Fallback for local/file:// pages */
      const textarea = document.createElement("textarea");

      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";

      document.body.appendChild(textarea);

      textarea.select();

      try{
        document.execCommand("copy");
        showPopup("Code copied");
      }catch(error){
        showPopup("Copy failed");
      }

      textarea.remove();

    });

}

function downloadCode(button){

  const codeBlock = button.closest(".code-block");

  if(!codeBlock) return;

  const pre = codeBlock.querySelector("pre");

  if(!pre) return;

  const code = pre.textContent;

  let filename =
    codeBlock.dataset.filename || "arduino-example";

  /*
    Prevent duplicate extensions.
    blink-explanation -> blink-explanation.ino
  */

  if(!filename.toLowerCase().endsWith(".ino")){
    filename += ".ino";
  }

  const blob =
    new Blob([code], {
      type:"text/plain;charset=utf-8"
    });

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;
  link.download = filename;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);

  showPopup("Code downloaded");
}


let cliMode = false;

function toggleView(){
  cliMode = !cliMode;

  const blocks = document.querySelectorAll(".code-block");

  blocks.forEach(block => {
    const pre = block.querySelector("pre");
    const title = block.parentElement.querySelector("h2");
    const text = block.parentElement.querySelector("p");

    if(cliMode){
      if(title) title.style.display = "none";
      if(text) text.style.display = "none";

      pre.style.background = "#000";
      pre.style.color = "#0f0";
      pre.style.fontFamily = "monospace";
      pre.style.fontSize = "14px";

    }else{
      if(title) title.style.display = "";
      if(text) text.style.display = "";

      pre.style.background = "";
      pre.style.color = "";
      pre.style.fontFamily = "";
      pre.style.fontSize = "";
    }
  });

  document.getElementById("viewToggle").textContent =
    cliMode ? "Normal View" : "CLI / IDE";
}
function showCategory(category){

  // hide ALL categories
  document.querySelectorAll(".example-category")
  .forEach(cat=>{
    cat.classList.remove("active");
  });

  // show selected category ONLY
  const selected =
    document.getElementById("cat-" + category);

  if(selected){
    selected.classList.add("active");
  }

}

// load BASIC only on startup
window.addEventListener("DOMContentLoaded", ()=>{

  showCategory("basic");

});


/*--------------------------___ More page JS ___---------------------------*/









/* =========================================================   MOBILE TOUCH SUPPORT   ========================================================= */

if(window.matchMedia("(hover:none)").matches){

  /* dropdown touch */
  document.querySelectorAll(".dropdown-btn").forEach(btn=>{

    btn.addEventListener("touchstart",e=>{

      const dropdown=btn.closest(".dropdown");

      dropdown.classList.toggle("open");

      const menu=dropdown.querySelector(".dropdown-menu");

      if(menu){
        menu.classList.toggle("open");
      }

    },{passive:true});

  });

  /* side panels */
  document.querySelectorAll(".side-btn").forEach(btn=>{

    btn.addEventListener("touchstart",()=>{

      const panel=btn.parentElement.querySelector(".side-panel");

      if(panel){
        panel.classList.toggle("open");
      }

    },{passive:true});

  });

  /* gallery buttons */
  document.querySelectorAll(".gallery-btn").forEach(btn=>{

    btn.addEventListener("touchstart",()=>{
      btn.classList.add("touch-active");

      setTimeout(()=>{
        btn.classList.remove("touch-active");
      },120);

    },{passive:true});

  });

  /* smooth nav scroll */
  const nav=document.querySelector("nav");

  if(nav){

    let startX=0;
    let scrollLeft=0;

    nav.addEventListener("touchstart",e=>{

      startX=e.touches[0].pageX;
      scrollLeft=nav.scrollLeft;

    },{passive:true});

    nav.addEventListener("touchmove",e=>{

      const x=e.touches[0].pageX;
      const walk=(startX-x);

      nav.scrollLeft=scrollLeft+walk;

    },{passive:true});

  }

}
function checkOrientation(){

  const mobile = window.innerWidth <= 900;

  const portrait =
    window.innerHeight > window.innerWidth;

  document.getElementById("rotateWarning").style.display =
    (mobile && portrait)
      ? "flex"
      : "none";
}

window.addEventListener("load", checkOrientation);
window.addEventListener("resize", checkOrientation);
window.addEventListener("orientationchange", checkOrientation);



/* ================================================================ Account ============================================= */

const GUIDE_ACCOUNT_KEYS = [
    "arduinoTutorialProgress",
    "secret_ie",
    "arduino_code",
    "progress",
    "secret_ip",
    "secret_id",
    "arduinoExampleMode",
    "arduinoExample",
    "arduinoExampleCategory",
    "firebase:host:arduino-guideg-default-rtdb.europe-west1.firebasedatabase.app",
    "communityUser",
    "userId",
    "arduino_name"
];

const GUIDE_ACCOUNT_FILENAME = "Arduino-Guide-Account.json";

let guideAccountFile = null;
let guideAccountLastModified = 0;
let guideAccountSaving = false;
let guideAccountLoading = false;

function guideGetLocalStorageData(){

    const data = {};

    GUIDE_ACCOUNT_KEYS.forEach(key => {

        const value = localStorage.getItem(key);

        if(value !== null){
            data[key] = value;
        }

    });

    return data;
}

function guideLoadLocalStorageData(data){

    if(!data || typeof data !== "object"){
        return;
    }

    guideAccountLoading = true;

    try{

        GUIDE_ACCOUNT_KEYS.forEach(key => {

            if(Object.prototype.hasOwnProperty.call(data,key)){

                const value = data[key];

                if(value === null || value === undefined){

                    localStorage.removeItem(key);

                }else{

                    localStorage.setItem(key,String(value));

                }

            }

        });

    }finally{

        guideAccountLoading = false;

    }

}

async function createGuideAccount(){

    if(!window.showSaveFilePicker){

        alert(
            "Your browser does not support direct account files.\n\n" +
            "Please use a Chromium-based browser such as Chrome or Edge."
        );

        return;

    }

    try{

        guideAccountFile = await window.showSaveFilePicker({

            suggestedName: GUIDE_ACCOUNT_FILENAME,

            types: [
                {
                    description: "Arduino Guide Account",
                    accept: {
                        "application/json": [".json"]
                    }
                }
            ]

        });

        await guideSaveAccountFile();

        await guideStoreAccountHandle();

        guideStartAccountWatcher();

        console.log("Arduino Guide account created.");

    }catch(error){

        if(error.name !== "AbortError"){
            console.error(
                "Could not create Arduino Guide account:",
                error
            );
        }

    }

}

async function openGuideAccount(){

    if(!window.showOpenFilePicker){

        alert(
            "Your browser does not support account files."
        );

        return;

    }

    try{

        const handles = await window.showOpenFilePicker({

            multiple: false,

            types: [
                {
                    description: "Arduino Guide Account",
                    accept: {
                        "application/json": [".json"]
                    }
                }
            ]

        });

        guideAccountFile = handles[0];

        await guideLoadAccountFile();

        await guideStoreAccountHandle();

        guideStartAccountWatcher();

        console.log("Arduino Guide account loaded.");

    }catch(error){

        if(error.name !== "AbortError"){
            console.error(
                "Could not open Arduino Guide account:",
                error
            );
        }

    }

}

async function guideSaveAccountFile(){

    if(!guideAccountFile){
        return;
    }

    if(guideAccountSaving){
        return;
    }

    guideAccountSaving = true;

    try{

        const data = guideGetLocalStorageData();

        const account = {
            format: "Arduino Guide Account",
            version: 1,
            updated: new Date().toISOString(),
            data: data
        };

        const writable =
            await guideAccountFile.createWritable();

        await writable.write(
            JSON.stringify(account,null,4)
        );

        await writable.close();

        const file =
            await guideAccountFile.getFile();

        guideAccountLastModified =
            file.lastModified;

    }catch(error){

        console.error(
            "Could not save Arduino Guide account:",
            error
        );

    }finally{

        guideAccountSaving = false;

    }

}

async function guideLoadAccountFile(){

    if(!guideAccountFile){
        return;
    }

    if(guideAccountLoading){
        return;
    }

    guideAccountLoading = true;

    try{

        const file =
            await guideAccountFile.getFile();

        const text =
            await file.text();

        const account =
            JSON.parse(text);

        if(
            !account ||
            account.format !== "Arduino Guide Account" ||
            !account.data
        ){

            console.warn(
                "This is not a valid Arduino Guide account file."
            );

            return;

        }

        guideLoadLocalStorageData(
            account.data
        );

        guideAccountLastModified =
            file.lastModified;

        const currentPage =
            localStorage.getItem("arduino-last-page");

        if(
            currentPage &&
            typeof activatePage === "function"
        ){

            activatePage(currentPage,false);

        }

        window.dispatchEvent(
            new CustomEvent(
                "arduinoAccountLoaded",
                {
                    detail: account.data
                }
            )
        );

        console.log(
            "Arduino Guide account loaded from file."
        );

    }catch(error){

        console.error(
            "Could not load Arduino Guide account:",
            error
        );

    }finally{

        guideAccountLoading = false;

    }

}

async function guideCheckAccountFile(){

    if(!guideAccountFile){
        return;
    }

    try{

        const file =
            await guideAccountFile.getFile();

        if(
            file.lastModified !==
            guideAccountLastModified
        ){

            console.log(
                "Arduino Guide account changed. Reloading..."
            );

            await guideLoadAccountFile();

        }

    }catch(error){

        console.warn(
            "Could not check Arduino Guide account file:",
            error
        );

    }

}

function guideStartAccountWatcher(){

    if(!guideAccountFile){
        return;
    }

    /*
       Check every 1 second.

       This detects manual changes made to the JSON file.
    */

    if(window.guideAccountWatcher){
        clearInterval(
            window.guideAccountWatcher
        );
    }

    window.guideAccountWatcher =
        setInterval(
            guideCheckAccountFile,
            1000
        );

}

function guideWatchLocalStorage(){

    const originalSetItem =
        localStorage.setItem.bind(localStorage);

    const originalRemoveItem =
        localStorage.removeItem.bind(localStorage);

    const originalClear =
        localStorage.clear.bind(localStorage);

    localStorage.setItem = function(key,value){

        const result =
            originalSetItem(key,value);

        if(
            !guideAccountLoading &&
            GUIDE_ACCOUNT_KEYS.includes(key) &&
            guideAccountFile
        ){

            guideSaveAccountFile();

        }

        return result;

    };
    localStorage.removeItem = function(key){

        const result =
            originalRemoveItem(key);

        if(
            !guideAccountLoading &&
            GUIDE_ACCOUNT_KEYS.includes(key) &&
            guideAccountFile
        ){

            guideSaveAccountFile();

        }

        return result;

    };

    localStorage.clear = function(){

        const result =
            originalClear();

        if(
            !guideAccountLoading &&
            guideAccountFile
        ){

            guideSaveAccountFile();

        }

        return result;

    };

}

window.addEventListener("storage",function(event){

    if(
        GUIDE_ACCOUNT_KEYS.includes(event.key) &&
        guideAccountFile
    ){

        guideSaveAccountFile();

    }

});

function guideOpenHandleDB(){

    return new Promise((resolve,reject)=>{

        const request =
            indexedDB.open(
                "ArduinoGuideAccountDB",
                1
            );

        request.onupgradeneeded = function(){

            const db = request.result;

            if(!db.objectStoreNames.contains("account")){
                db.createObjectStore("account");
            }

        };

        request.onsuccess = function(){
            resolve(request.result);
        };

        request.onerror = function(){
            reject(request.error);
        };

    });

}
async function guideStoreAccountHandle(){

    if(!guideAccountFile){
        return;
    }

    try{

        const db =
            await guideOpenHandleDB();

        const transaction =
            db.transaction(
                "account",
                "readwrite"
            );

        transaction
            .objectStore("account")
            .put(
                guideAccountFile,
                "fileHandle"
            );

    }catch(error){

        console.warn(
            "Could not remember account file:",
            error
        );

    }

}

async function guideRestoreAccountHandle(){

    try{
        const db =
            await guideOpenHandleDB();
        const handle =
            await new Promise((resolve,reject)=>{

                const transaction =
                    db.transaction(
                        "account",
                        "readonly"
                    );

                const request =
                    transaction
                        .objectStore("account")
                        .get("fileHandle");

                request.onsuccess =
                    () => resolve(request.result);

                request.onerror =
                    () => reject(request.error);
            });
        if(!handle){
            return false;
        }

        let permission =
            await handle.queryPermission({
                mode:"readwrite"
            });

        if(permission !== "granted"){
            permission =
                await handle.requestPermission({
                    mode:"readwrite"
                });
        }

        if(permission !== "granted"){
            return false;
        }

        guideAccountFile = handle;
        await guideLoadAccountFile();
        guideStartAccountWatcher();
        console.log(
            "Arduino Guide account automatically restored."
        );
        return true;

    }catch(error){
        console.warn(
            "Could not restore Arduino Guide account:",
            error
        );
        return false;
    }
}

async function initializeGuideAccountSystem(){
    guideWatchLocalStorage();
    await guideRestoreAccountHandle();
}

window.addEventListener(
    "load",
    function(){
        initializeGuideAccountSystem();
    }
);







