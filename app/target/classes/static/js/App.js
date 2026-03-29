/**
 * =========================================================
 *    APP MODULE
 *    ---------------------------------------------------------
 *    Handles frontend UI logic, hero typing animation,
 *    and initial application startup behavior.
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Hero Typing Animation Phrases
   ---------------------------------------------------------
   Text messages displayed in the animated hero banner
   on the dashboard header.
--------------------------------------------------------- */
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
  "Developed by Abdul Qadir",
];

/* ---------------------------------------------------------
   Typing Animation State Variables
--------------------------------------------------------- */
let pIndex = 0; // current phrase index
let cIndex = 0; // current character index
let deleting = false;
let typingTimer = null;

/* ---------------------------------------------------------
   Animation Starter
   ---------------------------------------------------------
   Resets typing state and begins animation loop.
--------------------------------------------------------- */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/* ---------------------------------------------------------
   Typing Animation Engine
   ---------------------------------------------------------
   Simulates typing and deleting text character by
   character to create a looping typewriter effect.
--------------------------------------------------------- */
function typeNext() {
  const el = document.getElementById("dynamic-text");

  if (!el) return;

  const text = phrases[pIndex];

  el.textContent = deleting
    ? text.substring(0, cIndex--)
    : text.substring(0, cIndex++);

  if (!deleting && cIndex > text.length) {
    deleting = true;
    typingTimer = setTimeout(typeNext, 2000);
  } else if (deleting && cIndex === 0) {
    deleting = false;
    pIndex = (pIndex + 1) % phrases.length;
    typingTimer = setTimeout(typeNext, 500);
  } else {
    typingTimer = setTimeout(typeNext, deleting ? 50 : 100);
  }
}

/* ---------------------------------------------------------
   Application Bootstrap
   ---------------------------------------------------------
   Runs on page load and checks if user session exists.
   If session found → load dashboard
   Otherwise → redirect to login page.
--------------------------------------------------------- */
window.onload = () => {
  const s = getSession(); // from auth.js

  if (s) {
    currentUser = s; // global user state
    loadApp(); // initialize dashboard
  } else {
    showPage("loginPage"); // show login screen
  }
};
