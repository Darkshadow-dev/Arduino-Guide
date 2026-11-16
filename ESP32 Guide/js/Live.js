
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    set,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

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
const auth = getAuth(app);

/* ================= LIVE COUNTER ================= */

const usersRef =
    ref(db, "onlineUsers");

onAuthStateChanged(auth, (user) => {

    if (!user) {
        console.log(
            "Live counter: no Firebase user signed in."
        );
        return;
    }

    const userId = user.uid;

    const userRef =
        ref(db, "onlineUsers/" + userId);

    /* mark online */

    set(userRef, true)
        .then(() => {

            console.log(
                "Live counter: user online:",
                userId
            );

        })
        .catch((error) => {

            console.error(
                "Live counter: could not mark user online:",
                error
            );

        });

    /* remove automatically when connection closes */

    onDisconnect(userRef)
        .remove()
        .then(() => {

            console.log(
                "Live counter: disconnect handler registered."
            );

        })
        .catch((error) => {

            console.error(
                "Live counter: could not register disconnect:",
                error
            );

        });
});

/* ================= UPDATE COUNT ================= */

onValue(usersRef, (snapshot) => {

    const data =
        snapshot.val();

    const count =
        data
        ? Object.keys(data).length
        : 0;

    const counter =
        document.getElementById("onlineCount");

    if (counter) {
        counter.textContent =
            count;
    }

});

/* ================= IMAGE ZOOM ================= */

window.addEventListener(
    "DOMContentLoaded",
    () => {

        const overlay =
            document.getElementById(
                "zoomOverlay"
            );

        const overlayImg =
            document.getElementById(
                "zoomImg"
            );

        /*
         * Some pages may not contain
         * the image zoom elements.
         *
         * Do not let that break Live.js.
         */

        if (
            !overlay ||
            !overlayImg
        ) {
            console.log(
                "Image zoom elements not found. Skipping image zoom."
            );

            return;
        }

        /* OPEN */

        document.body.addEventListener(
            "click",
            (e) => {

                const box =
                    e.target.closest(
                        "[data-tut]"
                    );

                const img =
                    e.target.closest(
                        "img"
                    );

                if (
                    box &&
                    img
                ) {

                    overlayImg.src =
                        img.src;

                    overlay.classList.add(
                        "active"
                    );
                }

            }
        );

        /* CLOSE */

        overlay.addEventListener(
            "click",
            () => {

                overlay.classList.remove(
                    "active"
                );

            }
        );

    }
);
