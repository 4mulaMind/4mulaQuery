/**
 * ======================================================================
 *  4mulaQuery — Frontend Application Controller
 * ----------------------------------------------------------------------
 *  Author      : Abdul Qadir
 *  Project     : 4mulaQuery Database Engine UI
 *  Description : Primary client-side controller responsible for
 *                managing UI behavior, authentication flows, and
 *                communication with the backend API.
 *
 *  Responsibilities:
 *  • Typing animation for landing header
 *  • Client-side authentication (localStorage based)
 *  • User session persistence
 *  • Page navigation and UI state control
 *  • Database operation API calls
 *  • Query console execution
 *  • Data rendering (tables, logs, statistics)
 *
 *  Backend API Endpoints Used:
 *  --------------------------------
 *  GET /api/all
 *  GET /api/search?id=
 *  GET /api/insert?id=&name=&email=
 *  GET /api/delete?id=
 *
 * ======================================================================
 *
 * @format
 */

/* ======================================================================
   SECTION 1 — GLOBAL STATE VARIABLES
   ----------------------------------------------------------------------
   Maintains runtime state for the application.
====================================================================== */

/**
 * Currently logged in user object.
 * Structure:
 * {
 *   name: string,
 *   email: string,
 *   password: string (base64 encoded)
 * }
 */
let currentUser = null;

/** OTP generated during password reset flow */
let generatedOtp = null;

/** Email associated with OTP request */
let otpEmail = null;

/** Timer reference used by typing animation */
let typingTimer = null;

/* ======================================================================
   SECTION 2 — TYPING ANIMATION
   ----------------------------------------------------------------------
   Displays rotating animated phrases on the landing screen.
====================================================================== */

/**
 * Phrase list displayed in typing animation.
 */
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

/** Current phrase index */
let pIndex = 0;

/** Character index within phrase */
let cIndex = 0;

/** Indicates whether animation is deleting characters */
let deleting = false;

/**
 * Initializes typing animation.
 */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/**
 * Core typing animation loop.
 */
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

/* ======================================================================
   SECTION 3 — LOCAL STORAGE UTILITIES
   ----------------------------------------------------------------------
   Provides abstraction layer for storing and retrieving
   user accounts and session data from browser storage.
====================================================================== */

/**
 * Retrieves registered users from localStorage.
 *
 * @returns {Object} user dictionary
 */
function getUsers() {
  return JSON.parse(localStorage.getItem("fq_users") || "{}");
}

/**
 * Saves user dictionary to localStorage.
 *
 * @param {Object} u - users object
 */
function saveUsers(u) {
  localStorage.setItem("fq_users", JSON.stringify(u));
}

/**
 * Returns active session user.
 *
 * @returns {Object|null}
 */
function getSession() {
  return JSON.parse(localStorage.getItem("fq_session") || "null");
}

/**
 * Stores active session.
 *
 * @param {Object} u
 */
function saveSession(u) {
  localStorage.setItem("fq_session", JSON.stringify(u));
}

/* ======================================================================
   SECTION 4 — UI NOTIFICATIONS
====================================================================== */

/**
 * Displays toast notification message.
 *
 * @param {string} id   Element ID
 * @param {string} msg  Message text
 * @param {string} type Notification type (error|success|info)
 */
function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);

  el.textContent = msg;
  el.className = `toast ${type} show`;

  setTimeout(() => {
    el.className = `toast ${type}`;
  }, 3500);
}

/* ======================================================================
   SECTION 5 — AUTHENTICATION
   ----------------------------------------------------------------------
   Handles login, signup, password recovery, and logout flows.
====================================================================== */

/**
 * Handles user login process.
 */
function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!email || !pass) return showToast("loginToast", "Please fill all fields");

  const users = getUsers();

  if (!users[email]) return showToast("loginToast", "Account not found.");

  if (users[email].password !== btoa(pass))
    return showToast("loginToast", "Incorrect password.");

  currentUser = users[email];

  saveSession(currentUser);

  loadApp();
}

/**
 * Registers a new user account.
 */
function doSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPass").value;
  const pass2 = document.getElementById("signupPass2").value;

  if (!name || !email || !pass)
    return showToast("signupToast", "Please fill all fields");

  if (pass !== pass2) return showToast("signupToast", "Passwords do not match");

  if (pass.length < 6)
    return showToast("signupToast", "Min 6 characters required");

  const users = getUsers();

  if (users[email])
    return showToast("signupToast", "Email already registered.");

  users[email] = {
    name,
    email,
    password: btoa(pass),
  };

  saveUsers(users);

  currentUser = users[email];

  saveSession(currentUser);

  showToast("signupToast", "Account created!", "success");

  setTimeout(loadApp, 800);
}

/* ======================================================================
   SECTION 6 — APPLICATION LOADING
   ----------------------------------------------------------------------
   Initializes UI after successful authentication.
====================================================================== */

/**
 * Loads main application interface.
 */
function loadApp() {
  const s = currentUser || getSession();

  if (!s) return;

  currentUser = s;

  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  document.getElementById("app").style.display = "block";

  document.getElementById("userNm").textContent = currentUser.name;

  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  startTyping();

  fetchAll(true);
}

/* ======================================================================
   SECTION 7 — DATABASE API OPERATIONS
   ----------------------------------------------------------------------
   Handles frontend communication with backend database API.
====================================================================== */

/**
 * Toggles loading animation bar.
 *
 * @param {string} id
 * @param {boolean} on
 */
function setLoad(id, on) {
  document.getElementById(id).classList.toggle("on", on);
}

/**
 * Fetches all database records.
 *
 * @param {boolean} silent
 */
async function fetchAll(silent = false) {
  if (!silent) setLoad("lb1", true);

  try {
    const res = await fetch("/api/all");

    const data = await res.text();

    if (!silent)
      document.getElementById("outBody").innerHTML = renderTable(data);
  } catch (e) {
    document.getElementById("outBody").innerHTML =
      `<div class="log"><span class="log-err">${e.message}</span></div>`;
  }

  if (!silent) setLoad("lb1", false);
}

/* ======================================================================
   SECTION 8 — APPLICATION ENTRY POINT
====================================================================== */

/**
 * Application bootstrapping logic.
 * Runs when the browser finishes loading the page.
 */
window.onload = () => {
  const s = getSession();

  if (s) {
    currentUser = s;
    loadApp();
  } else {
    showPage("loginPage");
  }
};
