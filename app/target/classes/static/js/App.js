/**
 * ================================================
 * 4mulaQuery - Intelligent Database Engine
 * Author: Abdul Qadir
 * Module: App Controller
 * Purpose: App initialization, partial loading
 * ================================================
 *
 * @format
 */

// App load hone par user session check karta hai
async function loadApp() {
  // Current user ya saved session load
  const s = currentUser || getSession();

  // Agar session nahi hai to return
  if (!s) return;

  // Current user set
  currentUser = s;

  // Main app UI show
  document.getElementById("app").style.display = "block";

  // User name display
  document.getElementById("userNm").textContent = currentUser.name;

  // User avatar (first letter)
  document.getElementById("userAv").textContent =
    currentUser.name[0].toUpperCase();

  // Settings form auto fill
  document.getElementById("setName").value = currentUser.name;
  document.getElementById("setEmail").value = currentUser.email;

  // Typing animation start
  startTyping();

  // Dashboard data load
  fetchAll(true);
}

// HTML partial files load karta hai
async function loadPartials() {
  // Containers aur unki files
  const containers = {
    "topbar-container": "partials/topbar.html",
    "header-container": "partials/header.html",
    "main-content": "partials/dashboard.html",
  };

  // Har container ke liye HTML fetch karo
  for (const [id, url] of Object.entries(containers)) {
    const resp = await fetch(url);
    const html = await resp.text();

    // Container me HTML insert
    document.getElementById(id).innerHTML = html;
  }

  // Default active section dashboard
  document.getElementById("sec-dashboard").classList.add("active");
}

// Remaining dashboard sections load karta hai
async function loadAppWithPartials() {
  // Main partials load
  await loadPartials();

  // Extra sections
  const sections = ["explorer", "console", "settings"];

  for (const sec of sections) {
    // Section HTML load
    const resp = await fetch(`partials/${sec}.html`);
    const html = await resp.text();

    // Dashboard me add
    document
      .getElementById("main-content")
      .insertAdjacentHTML("beforeend", html);
  }
}

// Page load hone par app initialize
window.onload = async () => {
  // Main app layout load
  const resp = await fetch("partials/app.html");
  const appHtml = await resp.text();

  document.getElementById("app-container").innerHTML = appHtml;

  // Sab partials load
  await loadAppWithPartials();

  // Session check
  const s = getSession();

  if (s) {
    // Agar session hai to app load
    currentUser = s;
    loadApp();
  } else {
    // Agar login nahi hai to login page show
    showPage("loginPage");
  }
};
