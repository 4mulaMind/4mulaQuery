/**
 * =========================================================
 *    4mulaQuery — app.js
 *    ---------------------------------------------------------
 *    Application Core Module
 *
 *    This module controls the main client-side behavior of
 *    the 4mulaQuery web application.
 *
 *    Responsibilities
 *    • Hero typing animation
 *    • Application initialization
 *    • User session loading
 *    • Section navigation handling
 *
 *    Author  : Abdul Qadir
 *    Project : 4mulaQuery Intelligent Database Engine
 * =========================================================
 *
 * @format
 */

/* =========================================================
   Hero Typing Animation Configuration
---------------------------------------------------------
   List of phrases displayed in the dashboard hero area.
   The animation simulates typing and deleting characters
   to highlight key features of the system.
========================================================= */
const phrases = [
  "Fastest C++ B-Tree Engine",
  "Spring Boot + Docker Integrated",
  "Intelligent Query Processing",
  "AI Powered SQL Optimization",
  "Real-Time Query Performance Insights",
  "Machine Learning Driven Database Engine",
  "Next Generation Query Analyzer",
  "Smart Database Exploration",
  "Predictive SQL Execution Engine",
];

/* =========================================================
   Typing Animation State Variables
---------------------------------------------------------
   pIndex      : Current phrase index
   cIndex      : Current character index
   deleting    : Indicates typing or deleting state
   typingTimer : Timer reference for animation loop
========================================================= */
let pIndex = 0;
let cIndex = 0;
let deleting = false;
let typingTimer = null;

/* =========================================================
   startTyping()
---------------------------------------------------------
   Initializes the hero typing animation.

   Behavior
   • Clears any existing animation timer
   • Resets phrase and character indexes
   • Starts the animation loop
========================================================= */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/* =========================================================
   typeNext()
---------------------------------------------------------
   Core typing animation engine.

   Responsibilities
   • Updates the displayed text character by character
   • Controls typing and deleting phases
   • Cycles through all phrases continuously
========================================================= */
function typeNext() {
  const el = document.getElementById("dynamic-text");
  if (!el) return;

  const text = phrases[pIndex];

  // Update text content based on animation state
  el.textContent = deleting
    ? text.substring(0, cIndex--)
    : text.substring(0, cIndex++);

  // Phrase fully typed → pause then begin deletion
  if (!deleting && cIndex > text.length) {
    deleting = true;
    typingTimer = setTimeout(typeNext, 2000);
  }

  // Phrase fully deleted → move to next phrase
  else if (deleting && cIndex === 0) {
    deleting = false;
    pIndex = (pIndex + 1) % phrases.length;

    typingTimer = setTimeout(typeNext, 500);
  }

  // Continue typing or deleting animation
  else {
    typingTimer = setTimeout(typeNext, deleting ? 50 : 100);
  }
}

/* =========================================================
   loadApp()
---------------------------------------------------------
   Initializes the main application interface after
   successful authentication.

   Responsibilities
   • Restore user session
   • Hide authentication pages
   • Display main dashboard
   • Populate user profile information
   • Start hero animation
   • Load database data asynchronously
========================================================= */
function loadApp() {
  const s = currentUser || getSession();
  if (!s) return;

  currentUser = s;

  // Hide authentication pages
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  // Display main application container
  document.getElementById("app").style.display = "block";

  // Populate user information in navigation bar
  document.getElementById("userNm").textContent = currentUser.name;
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  // Prefill user settings form
  document.getElementById("setName").value = currentUser.name;
  document.getElementById("setEmail").value = currentUser.email;

  // Start hero typing animation
  startTyping();

  // Fetch database records in background
  fetchAll(true);
}

/* =========================================================
   switchSec()
---------------------------------------------------------
   Handles navigation between application sections.

   Behavior
   • Deactivates current section and navigation item
   • Activates selected section and navigation tab

   Parameters
   name : target section name
   el   : clicked navigation element
========================================================= */
function switchSec(name, el) {
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));

  document
    .querySelectorAll(".tnav")
    .forEach((n) => n.classList.remove("active"));

  document.getElementById("sec-" + name).classList.add("active");

  el.classList.add("active");
}

/* =========================================================
   Application Entry Point
---------------------------------------------------------
   window.onload

   Executed when the page finishes loading.

   Behavior
   • Checks for an existing user session
   • Loads main application if session exists
   • Otherwise redirects to login page
========================================================= */
window.onload = () => {
  const s = getSession();

  if (s) {
    currentUser = s;
    loadApp();
  } else {
    showPage("loginPage");
  }
};
