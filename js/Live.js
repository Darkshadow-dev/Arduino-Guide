
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
  getDatabase,
  ref,
  onValue,
  set,
  onDisconnect
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

import {
  getAnalytics
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";

/* ================= FIREBASE CONFIG ================= */

const firebaseConfig = {
  apiKey: "AIzaSyCVq2PWrDMXTsG4GdceE4tUvTYeRYsul1Q",
  authDomain: "arduino-guideg.firebaseapp.com",
  databaseURL: "https://arduino-guideg-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "arduino-guideg",
  storageBucket: "arduino-guideg.firebasestorage.app",
  messagingSenderId: "146740789054",
  appId: "1:146740789054:web:069f11c6f6aa314b5af66f",
  measurementId: "G-V3ZB157P0R"
};

/* ================= INIT ================= */

const app = initializeApp(firebaseConfig);

getAnalytics(app);

const db = getDatabase(app);

/* ================= LIVE COUNTER ================= */

const userId =
  "user_" +
  Math.random().toString(36).substring(2, 12);

const userRef =
  ref(db, "onlineUsers/" + userId);

const usersRef =
  ref(db, "onlineUsers");

/* mark online */

set(userRef, true);

/* remove when leave */

onDisconnect(userRef).remove();

/* update count */

onValue(usersRef, (snapshot) => {

  const data = snapshot.val();

  const count =
    data
    ? Object.keys(data).length
    : 0;

  document.getElementById("onlineCount").textContent =
    count;

});
window.addEventListener("DOMContentLoaded", () => {

  const overlay = document.getElementById("zoomOverlay");
  const overlayImg = document.getElementById("zoomImg");

  // OPEN (works for ALL images, even future ones)

document.body.addEventListener("click", (e) => {

  const box = e.target.closest("[data-tut]");
  const img = e.target.closest("img");

  if (box && img) {
    overlayImg.src = img.src;
    overlay.classList.add("active");
  }
});
  // CLOSE
  overlay.addEventListener("click", () => {
    overlay.classList.remove("active");
  });

});
