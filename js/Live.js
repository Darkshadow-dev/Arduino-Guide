
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set,
    remove,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";
import {
    getAnalytics
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-analytics.js";

import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";
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



/* ================= INITIALIZATION ================= */

const app = initializeApp(firebaseConfig);

getAnalytics(app);

const db = getDatabase(app);
const auth = getAuth(app);
window.firebaseDebug = function () {
    return {
        workspace: localStorage.getItem("workspace"),
        mode: localStorage.getItem("workspaceMode"),
        user: auth.currentUser?.uid || "NOT SIGNED IN",
        connected: firebaseConnected,
        presence: currentPresence
    };
};

/* ================= DATABASE REFERENCES ================= */

const onlineUsersRef = ref(db, "onlineUsers");
const workspaceUsersRef = ref(db, "workspaceUsers");
const connectionRef = ref(db, ".info/connected");

let currentUser = null;
let firebaseConnected = false;
let currentPresence = null;


/* ================= COUNTER DISPLAY ================= */

function updateCounter(elementId, value) {

    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }

}


/* ================= ONLINE COUNT ================= */

onValue(onlineUsersRef, (snapshot) => {

    const data = snapshot.val();

    const count = data
        ? Object.keys(data).length
        : 0;

    updateCounter("onlineCount", count);

});


/* ================= WORKSPACE COUNT ================= */

onValue(workspaceUsersRef, (snapshot) => {

    const data = snapshot.val();

    const count = data
        ? Object.keys(data).length
        : 0;

    updateCounter("workspaceCount", count);

});


/* ================= PRESENCE MANAGEMENT ================= */

function syncLivePresence() {

    if (!currentUser || !firebaseConnected) return;

    const userId = currentUser.uid;

    const onlineRef = ref(db, "onlineUsers/" + userId);
    const workspaceRef = ref(db, "workspaceUsers/" + userId);

    const workspaceEnabled =
        localStorage.getItem("workspace") === "on";

    const desiredPresence = workspaceEnabled
        ? "workspace"
        : "online";

    // No unnecessary database writes
    if (currentPresence === desiredPresence) return;

    currentPresence = desiredPresence;

    if (desiredPresence === "workspace") {

        remove(onlineRef);

        set(workspaceRef, true)
            .catch(error => {
                console.error("Workspace presence error:", error);
            });

    } else {

        remove(workspaceRef);

        set(onlineRef, true)
            .catch(error => {
                console.error("Online presence error:", error);
            });

    }

}


/* ================= CONNECTION DETECTION ================= */

onValue(connectionRef, async (snapshot) => {

    firebaseConnected = snapshot.val() === true;

    currentPresence = null;

    if (!firebaseConnected || !currentUser) return;

    const userId = currentUser.uid;

    const onlineRef = ref(db, "onlineUsers/" + userId);
    const workspaceRef = ref(db, "workspaceUsers/" + userId);

    try {

        // Register disconnect cleanup BEFORE writing presence
        await onDisconnect(onlineRef).remove();
        await onDisconnect(workspaceRef).remove();

        syncLivePresence();

    } catch (error) {

        console.error("Presence setup error:", error);

    }

});


/* ================= AUTHENTICATION ================= */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        try {

            await signInAnonymously(auth);

            console.log("Anonymous Firebase login successful");

        } catch (error) {

            console.error("Anonymous login failed:", error);

        }

        return;
    }

    currentUser = user;
    currentPresence = null;

    console.log("Live counter user:", user.uid);

    syncLivePresence();

});


/* ================= WORKSPACE STATE CHANGES ================= */

// Called whenever Workspace changes state
window.addEventListener("workspace-state-changed", () => {

    currentPresence = null;

    syncLivePresence();

});

