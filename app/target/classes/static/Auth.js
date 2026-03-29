/**
 * =========================================================
 *    4mulaQuery — Authentication Module
 *    ---------------------------------------------------------
 *    File   : auth.js
 *    Author : Abdul Qadir
 *
 *    Description
 *    ---------------------------------------------------------
 *    Handles user authentication and session management
 *    for the 4mulaQuery web application.
 *
 *    Features
 *    • User Login / Signup
 *    • Forgot Password (OTP based)
 *    • Session persistence using LocalStorage
 *    • Account settings update
 *    • Logout functionality
 * =========================================================
 *
 * @format
 */

/* =========================================================
   GLOBAL AUTH STATE
   ---------------------------------------------------------
   Stores runtime authentication data for the
   currently logged-in user and OTP verification.
========================================================= */
let currentUser = null;
let generatedOtp = null;
let otpEmail = null;

/* =========================================================
   LOCAL STORAGE UTILITIES
   ---------------------------------------------------------
   Helper functions for managing user data and
   authentication sessions in browser LocalStorage.
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
   showToast()
   ---------------------------------------------------------
   Displays temporary notification messages
   such as errors, warnings, or success alerts.
========================================================= */
function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => (el.className = `toast ${type}`), 3500);
}

/* =========================================================
   showPage()
   ---------------------------------------------------------
   Controls navigation between authentication pages
   (Login, Signup, Forgot Password).
========================================================= */
function showPage(id) {
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });
  document.getElementById(id).style.display = "flex";

  if (id === "forgotPage") {
    document.getElementById("fStep1").style.display = "block";
    document.getElementById("fStep2").style.display = "none";
    document.getElementById("fStep3").style.display = "none";
  }
}

/* =========================================================
   doLogin()
   ---------------------------------------------------------
   Authenticates user credentials and creates
   a persistent login session.
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
   doSignup()
   ---------------------------------------------------------
   Registers a new user account and initializes
   the authentication session.
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

  users[email] = { name, email, password: btoa(pass) };

  saveUsers(users);

  currentUser = users[email];
  saveSession(currentUser);

  showToast("signupToast", "Account created! Loading...", "success");
  setTimeout(loadApp, 800);
}

/* =========================================================
   sendOtp()
   ---------------------------------------------------------
   Step 1 of password recovery process.
   Generates and displays a temporary OTP.
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
   otpNext()
   ---------------------------------------------------------
   Automatically focuses the next OTP input field
   during verification.
========================================================= */
function otpNext(el, idx) {
  if (el.value && idx < 3)
    document.querySelectorAll(".otp-input")[idx + 1].focus();
}

/* =========================================================
   verifyOtp()
   ---------------------------------------------------------
   Step 2 of password recovery.
   Validates user-entered OTP.
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
   resetPass()
   ---------------------------------------------------------
   Step 3 of password recovery.
   Updates the user password.
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
   doLogout()
   ---------------------------------------------------------
   Clears the current user session and returns
   to the login page.
========================================================= */
function doLogout() {
  localStorage.removeItem("fq_session");
  currentUser = null;

  document.getElementById("app").style.display = "none";

  if (typingTimer) clearTimeout(typingTimer);

  showPage("loginPage");
}

/* =========================================================
   saveSettings()
   ---------------------------------------------------------
   Updates user profile settings including
   display name and password.
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
