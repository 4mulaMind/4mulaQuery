/**
 * =========================================================
 *    AUTH MODULE (auth.js)
 *    ------------------------------------------------------
 *    Handles user authentication and session management.
 *    Uses browser localStorage to store users and login
 *    sessions.
 *
 *    Features:
 *    - User Signup
 *    - User Login
 *    - Session Storage
 *    - Logout Handling
 *    - Toast Notifications
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   Global Authentication State
   ---------------------------------------------------------
   currentUser → stores currently logged-in user object
--------------------------------------------------------- */
let currentUser = null;

/* ---------------------------------------------------------
   Local Storage Utilities
   ---------------------------------------------------------
   getUsers()    → retrieve all registered users
   saveUsers()   → save updated user list
   getSession()  → get active login session
   saveSession() → store logged-in session
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
   Toast Notification System
   ---------------------------------------------------------
   Displays temporary notification messages to users
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
   Validates user credentials and starts session
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

  loadApp();
}

/* ---------------------------------------------------------
   Signup Handler
   ---------------------------------------------------------
   Creates a new user account and stores in localStorage
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
   Logout Handler
   ---------------------------------------------------------
   Clears current session and returns to login page
--------------------------------------------------------- */
function doLogout() {
  localStorage.removeItem("fq_session");

  currentUser = null;

  document.getElementById("app").style.display = "none";

  if (typingTimer) clearTimeout(typingTimer);

  showPage("loginPage");
}
