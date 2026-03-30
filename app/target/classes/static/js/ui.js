/** @format */

// Page switch function (login, signup, forgot password)
function showPage(id) {
  // Sab pages hide kar do
  ["loginPage", "signupPage", "forgotPage"].forEach((p) => {
    document.getElementById(p).style.display = "none";
  });

  // Selected page show karo
  document.getElementById(id).style.display = "flex";

  // Agar forgot password page open hua
  if (id === "forgotPage") {
    // Step 1 show
    document.getElementById("fStep1").style.display = "block";

    // Step 2 hide
    document.getElementById("fStep2").style.display = "none";

    // Step 3 hide
    document.getElementById("fStep3").style.display = "none";
  }
}

// Loader animation on/off
function setLoad(id, on) {
  document.getElementById(id).classList.toggle("on", on);
}

// API data ko HTML table me convert karta hai
function renderTable(data) {
  // Agar data empty hai
  if (!data || !data.trim() || data.includes("empty") || data.includes("Empty"))
    return `<div class="empty"><div class="empty-icon">◈</div>No records found.</div>`;

  // Data ko rows me convert
  const rows = data
    .trim()
    .split("\n")
    .filter((r) => r.includes(","));

  // Agar valid rows nahi hain
  if (!rows.length)
    return `<div class="empty"><div class="empty-icon">◈</div>${data}</div>`;

  // Table start
  let html = `<table class="db-table"><thead><tr><th>#</th><th>ID</th><th>Username</th><th>Email</th></tr></thead><tbody>`;

  // Rows ko table rows me convert
  rows.forEach((row, i) => {
    const p = row.split(",");

    if (p.length >= 3)
      html += `<tr><td>${i + 1}</td><td>${p[0].trim()}</td><td>${p[1].trim()}</td><td>${p[2].trim()}</td></tr>`;
  });

  // Table close
  return html + "</tbody></table>";
}

// Records count karta hai
function countRows(data) {
  // Agar data empty hai
  if (!data || !data.trim() || data.includes("empty")) return 0;

  // Total rows return
  return data
    .trim()
    .split("\n")
    .filter((r) => r.includes(",")).length;
}

// Dashboard section change karta hai
function switchSec(name, el) {
  // Sab sections deactivate
  document
    .querySelectorAll(".section")
    .forEach((s) => s.classList.remove("active"));

  // Navigation buttons deactivate
  document
    .querySelectorAll(".tnav")
    .forEach((n) => n.classList.remove("active"));

  // Selected section activate
  document.getElementById("sec-" + name).classList.add("active");

  // Selected nav button activate
  el.classList.add("active");
}

// User settings save karta hai
function saveSettings() {
  const name = document.getElementById("setName").value.trim();
  const pass = document.getElementById("setPass").value;
  const pass2 = document.getElementById("setPass2").value;

  // Name empty check
  if (!name) return showToast("setToast", "Name cannot be empty");

  // Password match check
  if (pass && pass !== pass2)
    return showToast("setToast", "Passwords do not match");

  // Password minimum length
  if (pass && pass.length < 6) return showToast("setToast", "Min 6 characters");

  // Users data load
  const users = getUsers();

  // Name update
  users[currentUser.email].name = name;

  // Password update (base64 encode)
  if (pass) users[currentUser.email].password = btoa(pass);

  // Users save
  saveUsers(users);

  // Current user update
  currentUser = users[currentUser.email];

  // Session save
  saveSession(currentUser);

  // UI update
  document.getElementById("userNm").textContent = currentUser.name;
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  // Success message
  showToast("setToast", "Saved successfully!", "success");
}
