/**
 * =================================================
 *    app.js — Application Controller
 *    -------------------------------------------------
 *    Handles core frontend application behavior.
 *
 *    Responsibilities:
 *    • App initialization and session restore
 *    • Hero typing animation
 *    • Dashboard navigation
 *    • User interface setup after login
 * =================================================
 *
 * @format
 */

/* =================================================
   HERO TYPING ANIMATION
   -------------------------------------------------
   Displays rotating system highlights in the
   dashboard hero section with a typewriter effect.
================================================= */

/* ── Phrases used in animation ── */
const phrases = [
  "Fastest C++ B-Tree Engine",
  "Spring Boot + Docker Integrated",
  "Intelligent Query Processing",
  "Developed by Abdul Qadir"
];

/* ── Typing state controller ── */
let pIndex = 0,
  cIndex = 0,
  deleting = false,
  typingTimer = null;

/* -------------------------------------------------
   Starts the typing animation loop
------------------------------------------------- */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/* -------------------------------------------------
   Typing animation engine
   Handles typing and deleting characters
------------------------------------------------- */
function typeNext() {
  const el = document.getElementById("dynamic-text");

  if (!el) return;

  const text = phrases[pIndex];

  el.textContent = deleting
    ? text.substring(0, cIndex--)
    : text.substring(0, cIndex++);

  /* ── Phrase completed → start deleting ── */
  if (!deleting && cIndex > text.length) {
    deleting = true;

    typingTimer = setTimeout(typeNext, 2000);
  } else if (deleting && cIndex === 0) {

  /* ── Phrase deleted → move to next phrase ── */
    deleting = false;

    pIndex = (pIndex + 1) % phrases.length;

    typingTimer = setTimeout(typeNext, 500);
  } else {

  /* ── Continue typing / deleting ── */
    typingTimer = setTimeout(typeNext, deleting ? 50 : 100);
  }
}

/* =================================================
   MAIN APPLICATION LOADER
   -------------------------------------------------
   Initializes dashboard after successful login.
   Loads user data, UI components and database data.
================================================= */
function loadApp() {
  const s = currentUser || getSession();

  if (!s) return;

  currentUser = s;

  /* ── Hide authentication pages ── */
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  /* ── Show main application UI ── */
  document.getElementById("app").style.display = "block";

  /* ── Load user profile information ── */
  document.getElementById("userNm").textContent = currentUser.name;

  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  document.getElementById("setName").value = currentUser.name;

  document.getElementById("setEmail").value = currentUser.email;

  /* ── Start hero animation ── */
  startTyping();

  /* ── Load dashboard data ── */
  fetchAll(true);
}

/* =================================================
   DASHBOARD NAVIGATION CONTROLLER
   -------------------------------------------------
   Handles switching between dashboard sections
   such as Operations, Explorer and Console.
================================================= */
function switchSec(name, el) {
  /* ── Hide all sections ── */
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));

  /* ── Reset navigation state ── */
  document
    .querySelectorAll(".tnav")
    .forEach((n) => n.classList.remove("active"));

  /* ── Activate selected section ── */
  document.getElementById("sec-" + name).classList.add("active");

  el.classList.add("active");
}

/* =================================================
   APPLICATION INITIALIZER
   -------------------------------------------------
   Runs when page loads and restores previous
   user session if available.
================================================= */
window.onload = () => {
  const s = getSession();

  if (s) {
    currentUser = s;

    loadApp();
  } else {
    showPage("loginPage");
  }
};
