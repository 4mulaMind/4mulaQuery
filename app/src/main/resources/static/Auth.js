/**
 * =========================================================
 *  auth.js — Authentication Module
 * =========================================================
 * Handles all client-side authentication functionality:
 *
 * Features:
 *  • User Signup
 *  • Login Authentication
 *  • Forgot Password with OTP verification
 *  • Session Management using LocalStorage
 *  • Account Settings Update
 *  • Toast Notifications
 *
 * Storage Keys:
 *  - fq_users   → Registered users database
 *  - fq_session → Current logged-in user session
 *
 * Author: Abdul Qadir
 * Project: 4mulaQuery
 * =========================================================
 *
 * @format
 */

let currentUser = null;
let generatedOtp = null;
let otpEmail = null;

/* =========================================================
   LocalStorage Utility Functions
   ---------------------------------------------------------
   Wrapper helpers for reading and writing authentication
   data in browser LocalStorage.
========================================================= */

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

/* =========================================================
   Toast Notification System
   ---------------------------------------------------------
   Displays temporary UI alerts for user feedback such as
   errors, warnings, or success messages.
========================================================= */

function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);

  el.textContent = msg;
  el.className = `toast ${type} show`;

  setTimeout(() => {
    el.className = `toast ${type}`;
  }, 3500);
}

/* =========================================================
   Page Navigation
   ---------------------------------------------------------
   Controls switching between authentication screens:
   • Login
   • Signup
   • Forgot Password
========================================================= */

function showPage(id) {
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  document.getElementById(id).style.display = "flex";

  /* Reset forgot-password steps when opened */
  if (id === "forgotPage") {
    document.getElementById("fStep1").style.display = "block";
    document.getElementById("fStep2").style.display = "none";
    document.getElementById("fStep3").style.display = "none";
  }
}

/* =========================================================
   Login Handler
   ---------------------------------------------------------
   Authenticates user credentials and initializes session.
========================================================= */

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

  loadApp();
}

/* =========================================================
   Signup Handler
   ---------------------------------------------------------
   Creates a new user account and stores credentials in
   LocalStorage.
========================================================= */

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

/* =========================================================
   Forgot Password — Step 1
   ---------------------------------------------------------
   Generates and sends a temporary OTP code to verify the
   user before allowing password reset.
========================================================= */

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

/* =========================================================
   OTP Input Navigation
   ---------------------------------------------------------
   Automatically focuses the next input field after a digit
   is entered to improve user experience.
========================================================= */

function otpNext(el, idx) {
  if (el.value && idx < 3)
    document.querySelectorAll(".otp-input")[idx + 1].focus();
}

/* =========================================================
   Forgot Password — Step 2
   ---------------------------------------------------------
   Validates the OTP entered by the user.
========================================================= */

function verifyOtp() {
  const entered = [...document.querySelectorAll(".otp-input")]
    .map((i) => i.value)
    .join("");

  if (entered !== generatedOtp)
    return showToast("forgotToast", "Invalid OTP. Try again.");

  document.getElementById("fStep2").style.display = "none";
  document.getElementById("fStep3").style.display = "block";
}

/* =========================================================
   Forgot Password — Step 3
   ---------------------------------------------------------
   Updates the user password after successful OTP validation.
========================================================= */

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

/* =========================================================
   Logout Handler
   ---------------------------------------------------------
   Clears the current session and returns user to login page.
========================================================= */

function doLogout() {
  localStorage.removeItem("fq_session");

  currentUser = null;

  document.getElementById("app").style.display = "none";

  if (typingTimer) clearTimeout(typingTimer);

  showPage("loginPage");
}

/* =========================================================
   Account Settings Update
   ---------------------------------------------------------
   Allows users to update their profile name or password.
========================================================= */

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
