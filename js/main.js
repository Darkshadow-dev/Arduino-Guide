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




