/**
 * =========================================================
 *    4mulaQuery — Authentication Module
 *    ---------------------------------------------------------
 *    Handles:
 *    - User Login
 *    - User Signup
 *    - Password Reset (OTP based)
 *    - Session Management
 *    - Toast Notifications
 *    - Logout functionality
 *
 *    Storage: Browser LocalStorage
 *    Author: Abdul Qadir
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Global Authentication State
--------------------------------------------------------- */

// Currently logged-in user object
let currentUser = null;

// Temporary OTP used for password reset
let generatedOtp = null;

// Email associated with the OTP request
let otpEmail = null;

/* ---------------------------------------------------------
   LocalStorage Utility Functions
   Used to persist users and session data
--------------------------------------------------------- */

// Fetch all registered users from storage
function getUsers() {
  return JSON.parse(localStorage.getItem("fq_users") || "{}");
}

// Save users object back to storage
function saveUsers(u) {
  localStorage.setItem("fq_users", JSON.stringify(u));
}

// Get current active user session
function getSession() {
  return JSON.parse(localStorage.getItem("fq_session") || "null");
}

// Save active user session
function saveSession(u) {
  localStorage.setItem("fq_session", JSON.stringify(u));
}

/* ---------------------------------------------------------
   showPage()
   Switch between authentication screens

   Pages:
   - loginPage
   - signupPage
   - forgotPage
--------------------------------------------------------- */
function showPage(id) {
  // Hide all auth pages
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  // Show selected page
  document.getElementById(id).style.display = "flex";

  // Reset forgot password steps
  if (id === "forgotPage") {
    document.getElementById("fStep1").style.display = "block";
    document.getElementById("fStep2").style.display = "none";
    document.getElementById("fStep3").style.display = "none";
  }
}

/* ---------------------------------------------------------
   showToast()
   Displays status messages in the UI

   Types:
   - error
   - success
--------------------------------------------------------- */
function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);

  el.textContent = msg;

  // Apply toast style
  el.className = `toast ${type} show`;

  // Auto-hide after delay
  setTimeout(() => (el.className = `toast ${type}`), 3500);
}

/* ---------------------------------------------------------
   doLogin()
   Authenticates existing user
--------------------------------------------------------- */
function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const pass = document.getElementById("loginPass").value;

  // Validate inputs
  if (!email || !pass) return showToast("loginToast", "Please fill all fields");

  const users = getUsers();

  // Check if user exists
  if (!users[email])
    return showToast("loginToast", "Account not found. Sign up first.");

  // Validate password
  if (users[email].password !== btoa(pass))
    return showToast("loginToast", "Incorrect password.");

  // Set current session
  currentUser = users[email];
  saveSession(currentUser);

  // Load main application
  loadApp(); // defined in app.js
}

/* ---------------------------------------------------------
   doSignup()
   Registers a new user
--------------------------------------------------------- */
function doSignup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const pass = document.getElementById("signupPass").value;
  const pass2 = document.getElementById("signupPass2").value;

  // Basic validation
  if (!name || !email || !pass)
    return showToast("signupToast", "Please fill all fields");

  // Password confirmation
  if (pass !== pass2) return showToast("signupToast", "Passwords do not match");

  // Password length check
  if (pass.length < 6)
    return showToast("signupToast", "Min 6 characters required");

  const users = getUsers();

  // Prevent duplicate accounts
  if (users[email])
    return showToast("signupToast", "Email already registered.");

  // Save new user
  users[email] = {
    name,
    email,
    password: btoa(pass),
  };

  saveUsers(users);

  // Start user session
  currentUser = users[email];
  saveSession(currentUser);

  showToast("signupToast", "Account created! Loading...", "success");

  // Load application
  setTimeout(loadApp, 800);
}

/* ---------------------------------------------------------
   sendOtp()
   Generates OTP for password reset
--------------------------------------------------------- */
function sendOtp() {
  const email = document.getElementById("forgotEmail").value.trim();

  if (!email) return showToast("forgotToast", "Enter your email");

  const users = getUsers();

  // Check account exists
  if (!users[email])
    return showToast("forgotToast", "No account with this email.");

  otpEmail = email;

  // Generate random 4-digit OTP
  generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();

  // Display OTP (for demo purposes)
  showToast("forgotToast", `Your OTP: ${generatedOtp}`, "success");

  // Move to OTP step
  setTimeout(() => {
    document.getElementById("fStep1").style.display = "none";
    document.getElementById("fStep2").style.display = "block";
  }, 1200);
}

/* ---------------------------------------------------------
   otpNext()
   Automatically move cursor to next OTP input
--------------------------------------------------------- */
function otpNext(el, idx) {
  if (el.value && idx < 3) {
    document.querySelectorAll(".otp-input")[idx + 1].focus();
  }
}

/* ---------------------------------------------------------
   verifyOtp()
   Validates entered OTP
--------------------------------------------------------- */
function verifyOtp() {
  const entered = [...document.querySelectorAll(".otp-input")]
    .map((i) => i.value)
    .join("");

  if (entered !== generatedOtp)
    return showToast("forgotToast", "Invalid OTP. Try again.");

  // Proceed to password reset
  document.getElementById("fStep2").style.display = "none";
  document.getElementById("fStep3").style.display = "block";
}

/* ---------------------------------------------------------
   resetPass()
   Updates user password
--------------------------------------------------------- */
function resetPass() {
  const p1 = document.getElementById("newPass").value;
  const p2 = document.getElementById("newPass2").value;

  if (!p1 || p1 !== p2)
    return showToast("forgotToast", "Passwords do not match");

  if (p1.length < 6) return showToast("forgotToast", "Min 6 characters");

  const users = getUsers();

  // Update stored password
  users[otpEmail].password = btoa(p1);

  saveUsers(users);

  showToast("forgotToast", "Password updated! Redirecting...", "success");

  setTimeout(() => showPage("loginPage"), 1500);
}

/* ---------------------------------------------------------
   doLogout()
   Ends user session and returns to login page
--------------------------------------------------------- */
function doLogout() {
  // Remove session from storage
  localStorage.removeItem("fq_session");

  currentUser = null;

  // Hide main application
  document.getElementById("app").style.display = "none";

  // Stop typing animation if active
  if (window.typingTimer) clearTimeout(window.typingTimer);

  // Redirect to login page
  showPage("loginPage");
}
