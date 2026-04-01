/**
 * =====================================================
 *    4mulaQuery — app.js
 *    Author: Abdul Qadir
 *    Sections:
 *    1. Typing Animation
 *    2. Auth (Login / Signup / Forgot / Logout)
 *    3. App Load & Navigation
 *    4. API (Insert / Search / Delete / FetchAll)
 * =====================================================
 *
 * @format
 */

/* ── 1. TYPING ANIMATION ── */
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
let pIndex = 0,
  cIndex = 0,
  deleting = false,
  typingTimer = null;

function startTyping() {
  if (typingTimer) clearTimeout(typingTimer);
  pIndex = 0;
  cIndex = 0;
  deleting = false;
  typeNext();
}
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

/* ── 2. AUTH ── */
let currentUser = null,
  generatedOtp = null,
  otpEmail = null;

// LocalStorage helpers
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

// Toast notification
function showToast(id, msg, type = "error") {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = `toast ${type} show`;
  setTimeout(() => (el.className = `toast ${type}`), 3500);
}

// Page switching (login / signup / forgot)
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

// Forgot password — Step 1: send OTP
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

// Forgot password — Step 2: OTP box auto-focus
function otpNext(el, idx) {
  if (el.value && idx < 3)
    document.querySelectorAll(".otp-input")[idx + 1].focus();
}

// Forgot password — Step 2: verify OTP
function verifyOtp() {
  const entered = [...document.querySelectorAll(".otp-input")]
    .map((i) => i.value)
    .join("");
  if (entered !== generatedOtp)
    return showToast("forgotToast", "Invalid OTP. Try again.");
  document.getElementById("fStep2").style.display = "none";
  document.getElementById("fStep3").style.display = "block";
}

// Forgot password — Step 3: reset password
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

// Logout
function doLogout() {
  localStorage.removeItem("fq_session");
  currentUser = null;
  document.getElementById("app").style.display = "none";
  if (typingTimer) clearTimeout(typingTimer);
  showPage("loginPage");
}

// Settings update
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

/* ── 3. APP LOAD & NAVIGATION ── */
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
  startTyping();
  fetchAll(true);
}

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

/* ── 4. API ── */
function setLoad(id, on) {
  document.getElementById(id).classList.toggle("on", on);
}

function renderTable(data) {
  if (!data || !data.trim() || data.includes("empty") || data.includes("Empty"))
    return `<div class="empty"><div class="empty-icon">◈</div>No records found.</div>`;
  const rows = data
    .trim()
    .split("\n")
    .filter((r) => r.includes(","));
  if (!rows.length)
    return `<div class="empty"><div class="empty-icon">◈</div>${data}</div>`;
  let html = `<table class="db-table"><thead><tr><th>#</th><th>ID</th><th>Username</th><th>Email</th></tr></thead><tbody>`;
  rows.forEach((row, i) => {
    const p = row.split(",");
    if (p.length >= 3)
      html += `<tr><td>${i + 1}</td><td>${p[0].trim()}</td><td>${p[1].trim()}</td><td>${p[2].trim()}</td></tr>`;
  });
  return html + "</tbody></table>";
}

function countRows(data) {
  if (!data || !data.trim() || data.includes("empty")) return 0;
  return data
    .trim()
    .split("\n")
    .filter((r) => r.includes(",")).length;
}

async function operate(type) {
  const id = document.getElementById("opId").value;
  const name = document.getElementById("opName").value;
  const email = document.getElementById("opEmail").value;
  if (!id || id <= 0) {
    alert("Valid ID required");
    return;
  }
  let url = `/api/${type}?id=${id}`;
  if (type === "insert") {
    if (!name || !email) {
      alert("Name and Email required");
      return;
    }
    url += `&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`;
  }
  setLoad("lb1", true);
  const t0 = performance.now();
  try {
    const res = await fetch(url);
    const data = await res.text();
    const ms = (performance.now() - t0).toFixed(1);
    const ok = data.includes("Executed") || data.includes(",");
    const err = data.includes("Error") || data.includes("Bridge");
    document.getElementById("outBody").innerHTML =
      `<div class="log"><span class="${err ? "log-err" : ok ? "log-ok" : "log-info"}">${data.trim()}</span> <span class="log-time"> · ${ms}ms · ${type.toUpperCase()}</span></div>`;
    document.getElementById("statOp").textContent = type.toUpperCase();
    if ((type === "insert" || type === "delete") && ok) {
      document.getElementById("opId").value = "";
      document.getElementById("opName").value = "";
      document.getElementById("opEmail").value = "";
      setTimeout(() => fetchAll(true), 600);
    }
  } catch (e) {
    document.getElementById("outBody").innerHTML =
      `<div class="log"><span class="log-err">Network Error: ${e.message}</span></div>`;
  }
  setLoad("lb1", false);
}

async function fetchAll(silent = false) {
  if (!silent) setLoad("lb1", true);
  try {
    const res = await fetch("/api/all");
    const data = await res.text();
    if (!silent)
      document.getElementById("outBody").innerHTML = renderTable(data);
    document.getElementById("statTotal").textContent = countRows(data);
  } catch (e) {
    if (!silent)
      document.getElementById("outBody").innerHTML =
        `<div class="log"><span class="log-err">Error: ${e.message}</span></div>`;
  }
  if (!silent) setLoad("lb1", false);
}

async function fetchAllExplorer() {
  setLoad("lb2", true);
  try {
    const res = await fetch("/api/all");
    const data = await res.text();
    document.getElementById("explorerBody").innerHTML = renderTable(data);
    document.getElementById("statTotal").textContent = countRows(data);
  } catch (e) {
    document.getElementById("explorerBody").innerHTML =
      `<div class="log"><span class="log-err">Error: ${e.message}</span></div>`;
  }
  setLoad("lb2", false);
}

async function runRaw() {
  const cmd = document.getElementById("rawCmd").value.trim();
  if (!cmd) return;
  const parts = cmd.split(",");
  const type = parts[0].toLowerCase();
  setLoad("lb3", true);
  const t0 = performance.now();
  let url = "";
  if (type === "all" || type === "select") url = "/api/all";
  else if (type === "search" && parts[1])
    url = `/api/search?id=${parts[1].trim()}`;
  else if (type === "insert" && parts.length >= 4)
    url = `/api/insert?id=${parts[1].trim()}&name=${encodeURIComponent(parts[2].trim())}&email=${encodeURIComponent(parts[3].trim())}`;
  else if (type === "delete" && parts[1])
    url = `/api/delete?id=${parts[1].trim()}`;
  else {
    document.getElementById("consoleBody").innerHTML =
      `<div class="log"><span class="log-err">Unknown command</span><br><span class="log-time">insert,id,name,email | search,id | delete,id | all</span></div>`;
    setLoad("lb3", false);
    return;
  }
  try {
    const res = await fetch(url);
    const data = await res.text();
    const ms = (performance.now() - t0).toFixed(1);
    const ok = data.includes("Executed") || data.includes(",");
    const err = data.includes("Error") || data.includes("Bridge");
    const html =
      data.includes(",") && type !== "delete"
        ? renderTable(data)
        : `<div class="log"><span class="${err ? "log-err" : ok ? "log-ok" : "log-info"}">${data.trim()}</span> <span class="log-time"> · ${ms}ms</span></div>`;
    document.getElementById("consoleBody").innerHTML = html;
    document.getElementById("rawCmd").value = "";
  } catch (e) {
    document.getElementById("consoleBody").innerHTML =
      `<div class="log"><span class="log-err">Error: ${e.message}</span></div>`;
  }
  setLoad("lb3", false);
}

/* ── INIT ── */
window.onload = () => {
  const s = getSession();
  if (s) {
    currentUser = s;
    loadApp();
  } else showPage("loginPage");
};
