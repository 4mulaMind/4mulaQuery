/**
 * =========================================================
 *    AUTH MODULE
 *    ---------------------------------------------------------
 *    Handles user authentication, session storage, and
 *    account management using browser localStorage.
 *    Includes login, signup, logout, OTP password reset,
 *    and account settings update functionality.
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Global Authentication State
   ---------------------------------------------------------
   currentUser   → logged-in user object
   generatedOtp  → temporary OTP for password reset
   otpEmail      → email used during OTP verification
--------------------------------------------------------- */
let currentUser = null;
let generatedOtp = null;
let otpEmail = null;

/* ---------------------------------------------------------
   Local Storage Utilities
   ---------------------------------------------------------
   getUsers()    → fetch registered users
   saveUsers()   → save updated users
   getSession()  → retrieve active session
   saveSession() → store logged-in user session
--------------------------------------------------------- */
function getUsers() {
  return JSON.parse(localStorage.getItem("fq_users") || "{}");
}

function saveUsers(u) {
  localStorage.setItem("fq_users", JSON.stringify(u));
}

function getSession() {
  return JSON.parse(localStorage.getItem("fq_session") || "null");
}

function saveSession(u) {
  localStorage.setItem("fq_session", JSON.stringify(u));
}

/* ---------------------------------------------------------
   Page Navigation Controller
   ---------------------------------------------------------
   Shows one auth page at a time:
   - Login
   - Signup
   - Forgot Password
--------------------------------------------------------- */
function showPage(id) {
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  document.getElementById(id).style.display = "flex";

  // Reset forgot password steps
  if (id === "forgotPage") {
    document.getElementById("fStep1").style.display = "block";
    document.getElementById("fStep2").style.display = "none";
    document.getElementById("fStep3").style.display = "none";
  }
}

/* ---------------------------------------------------------
   Toast Notification System
   ---------------------------------------------------------
   Displays temporary messages for user actions
--------------------------------------------------------- */
function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);

  el.textContent = msg;
  el.className = `toast ${type} show`;

  setTimeout(() => {
    el.className = `toast ${type}`;
  }, 3500);
}

/* ---------------------------------------------------------
   Login Handler
   ---------------------------------------------------------
   Validates user credentials and creates session
--------------------------------------------------------- */
function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  if (!email || !pass) return showToast("loginToast", "Please fill all fields");

  const users = getUsers();

  if (!users[email])
    return showToast("loginToast", "Account not found. Sign up first.");

  if (users[email].password !== btoa(pass))
    return showToast("loginToast", "Incorrect password.");

  currentUser = users[email];
  saveSession(currentUser);

  loadApp(); // from app.js
}

/* ---------------------------------------------------------
   Signup Handler
   ---------------------------------------------------------
   Creates new user and stores in localStorage
--------------------------------------------------------- */
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

  showToast("signupToast", "Account created! Loading...", "success");

  setTimeout(loadApp, 800);
}

/* ---------------------------------------------------------
   OTP Generator (Password Reset)
   ---------------------------------------------------------
   Generates 4-digit OTP and moves to verification step
--------------------------------------------------------- */
function sendOtp() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) return showToast("forgotToast", "Enter your email");

  const users = getUsers();

  if (!users[email])
    return showToast("forgotToast", "No account with this email.");

  otpEmail = email;

  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  showToast("forgotToast", `Your OTP: ${generatedOtp}`, "success");

  setTimeout(() => {
    document.getElementById("fStep1").style.display = "none";
    document.getElementById("fStep2").style.display = "block";
  }, 1200);
}

/* ---------------------------------------------------------
   OTP Input Auto-Focus
   ---------------------------------------------------------
   Moves cursor automatically to next OTP field
--------------------------------------------------------- */
function otpNext(el, idx) {
  if (el.value && idx < 3) {
    document.querySelectorAll(".otp-input")[idx + 1].focus();
  }
}

/* ---------------------------------------------------------
   OTP Verification
--------------------------------------------------------- */
function verifyOtp() {
  const entered = [...document.querySelectorAll(".otp-input")]
    .map((i) => i.value)
    .join("");

  if (entered !== generatedOtp)
    return showToast("forgotToast", "Invalid OTP. Try again.");

  document.getElementById("fStep2").style.display = "none";
  document.getElementById("fStep3").style.display = "block";
}

/* ---------------------------------------------------------
   Password Reset Handler
--------------------------------------------------------- */
function resetPass() {
  const p1 = document.getElementById("newPass").value;
  const p2 = document.getElementById("newPass2").value;

  if (!p1 || p1 !== p2)
    return showToast("forgotToast", "Passwords do not match");

  if (p1.length < 6) return showToast("forgotToast", "Min 6 characters");

  const users = getUsers();

  users[otpEmail].password = btoa(p1);

  saveUsers(users);

  showToast("forgotToast", "Password updated! Redirecting...", "success");

  setTimeout(() => showPage("loginPage"), 1500);
}

/* ---------------------------------------------------------
   Logout Handler
   ---------------------------------------------------------
   Clears session and returns to login screen
--------------------------------------------------------- */
function doLogout() {
  localStorage.removeItem("fq_session");

  currentUser = null;

  document.getElementById("app").style.display = "none";

  if (window.typingTimer) clearTimeout(window.typingTimer);

  showPage("loginPage");
}

/* ---------------------------------------------------------
   Application Loader
   ---------------------------------------------------------
   Loads dashboard after successful login
--------------------------------------------------------- */
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

  document.getElementById("setName").value = currentUser.name;
  document.getElementById("setEmail").value = currentUser.email;

  startTyping(); // app.js
  fetchAll(true); // api.js
}

/* ---------------------------------------------------------
   Account Settings Update
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

  users[currentUser.email].name = name;

  if (pass) users[currentUser.email].password = btoa(pass);

  saveUsers(users);

  currentUser = users[currentUser.email];
  saveSession(currentUser);

  document.getElementById("userNm").textContent = currentUser.name;
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  showToast("setToast", "Saved successfully!", "success");
}

/* ---------------------------------------------------------
   Section Switcher (Dashboard Navigation)
--------------------------------------------------------- */
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
