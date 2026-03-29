/**
 * =========================================================
 *    4mulaQuery - app.js
 *    Main App UI & Initialization Module
 *    Handles App Startup, Typing Animation, and Navigation
 *    Author: Abdul Qadir
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Typing Animation Variables
--------------------------------------------------------- */
let typingTimer = null;

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
  "Developed by Abdul Qadir"
];

let pIndex = 0; // Current phrase index
let cIndex = 0; // Current character index
let deleting = false; // Typing or deleting state

/* ---------------------------------------------------------
   startTyping() — Initialize typing animation
--------------------------------------------------------- */
function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);

  pIndex = 0;
  cIndex = 0;
  deleting = false;

  typeNext();
}

/* ---------------------------------------------------------
   typeNext() — Core typing animation engine
--------------------------------------------------------- */
function typeNext() {
  const el = document.getElementById("dynamic-text");

  if (!el) return;

  const text = phrases[pIndex];

  // Update text content (typing / deleting)
  el.textContent = deleting
    ? text.substring(0, cIndex--)
    : text.substring(0, cIndex++);

  // Phrase finished typing
  if (!deleting && cIndex > text.length) {
    deleting = true;

    typingTimer = setTimeout(typeNext, 2000);
  }

  // Phrase completely deleted
  else if (deleting && cIndex === 0) {
    deleting = false;

    pIndex = (pIndex + 1) % phrases.length;

    typingTimer = setTimeout(typeNext, 500);
  }

  // Continue animation
  else {
    typingTimer = setTimeout(typeNext, deleting ? 50 : 100);
  }
}

/* ---------------------------------------------------------
   loadApp() — Initialize main application UI
   Runs after successful login
--------------------------------------------------------- */
function loadApp() {
  const s = currentUser || getSession();

  if (!s) return;

  currentUser = s;

  // Hide authentication pages
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  // Show main application
  document.getElementById("app").style.display = "block";

  // Update user info in navbar
  document.getElementById("userNm").textContent = currentUser.name;
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  // Fill settings form
  document.getElementById("setName").value = currentUser.name;
  document.getElementById("setEmail").value = currentUser.email;

  // Start hero typing animation
  startTyping();

  // Load database records silently
  fetchAll(true);
}

/* ---------------------------------------------------------
   saveSettings() — Update user profile settings
--------------------------------------------------------- */
function saveSettings() {
  const name = document.getElementById("setName").value.trim();
  const pass = document.getElementById("setPass").value;
  const pass2 = document.getElementById("setPass2").value;

  if (!name) return showToast("setToast", "Name cannot be empty");

  if (pass && pass !== pass2)
    return showToast("setToast", "Passwords do not match");

  if (pass && pass.length < 6) return showToast("setToast", "Min 6 characters");

  const users = getUsers();

  // Update user name
  users[currentUser.email].name = name;

  // Update password if provided
  if (pass) users[currentUser.email].password = btoa(pass);

  saveUsers(users);

  currentUser = users[currentUser.email];

  saveSession(currentUser);

  // Update navbar info
  document.getElementById("userNm").textContent = currentUser.name;
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  showToast("setToast", "Saved successfully!", "success");
}

/* ---------------------------------------------------------
   switchSec() — Section Navigation System
--------------------------------------------------------- */
function switchSec(name, el) {
  // Hide all sections
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));

  // Remove active navigation
  document
    .querySelectorAll(".tnav")
    .forEach((n) => n.classList.remove("active"));

  // Activate selected section
  document.getElementById("sec-" + name).classList.add("active");

  el.classList.add("active");
}

/* ---------------------------------------------------------
   window.onload — Application Entry Point
--------------------------------------------------------- */
window.onload = () => {
  const s = getSession();

  if (s) {
    currentUser = s;

    loadApp();
  } else {
    showPage("loginPage");
  }
};
