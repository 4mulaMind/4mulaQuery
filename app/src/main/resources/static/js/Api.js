/**
 * =================================================
 *    api.js — Database API Communication Layer
 *    -------------------------------------------------
 *    Responsible for all HTTP communication with the
 *    Spring Boot backend service.
 *
 *    Features:
 *    • Insert / Search / Delete operations
 *    • Fetch all database records
 *    • Render records into HTML tables
 *    • Raw command console execution
 *    • Performance timing and status reporting
 * =================================================
 *
 * @format
 */

/* =================================================
   LOADING BAR CONTROLLER
   -------------------------------------------------
   Toggles the animated loading indicator used in
   dashboard panels while API requests are running.
================================================= */
function setLoad(id, on) {
  document.getElementById(id).classList.toggle("on", on);
}

/* =================================================
   TABLE RENDERING ENGINE
   -------------------------------------------------
   Converts CSV formatted database response into
   a styled HTML table used by the dashboard UI.
================================================= */
function renderTable(data) {
  /* ── Handle empty or invalid responses ── */
  if (!data || !data.trim() || data.includes("empty") || data.includes("Empty"))
    return `<div class="empty"><div class="empty-icon">◈</div>No records found.</div>`;

  const rows = data
    .trim()
    .split("\n")
    .filter((r) => r.includes(","));

  if (!rows.length)
    return `<div class="empty"><div class="empty-icon">◈</div>${data}</div>`;

  /* ── Build table layout ── */
  let html = `
  <table class="db-table">
    <thead>
      <tr>
        <th>#</th>
        <th>ID</th>
        <th>Username</th>
        <th>Email</th>
      </tr>
    </thead>
    <tbody>`;

  rows.forEach((row, i) => {
    const p = row.split(",");
    if (p.length >= 3) {
      html += `
      <tr>
        <td>${i + 1}</td>
        <td>${p[0].trim()}</td>
        <td>${p[1].trim()}</td>
        <td>${p[2].trim()}</td>
      </tr>`;
    }
  });

  return html + "</tbody></table>";
}

/* =================================================
   ROW COUNTER
   -------------------------------------------------
   Calculates total number of records returned
   from backend CSV response.
================================================= */
function countRows(data) {
  if (!data || !data.trim() || data.includes("empty")) return 0;

  return data
    .trim()
    .split("\n")
    .filter((r) => r.includes(",")).length;
}

/* =================================================
   CRUD OPERATION HANDLER
   -------------------------------------------------
   Handles Insert, Search, and Delete requests
   through the REST API endpoints.
================================================= */
async function operate(type) {
  const id = document.getElementById("opId").value;
  const name = document.getElementById("opName").value;
  const email = document.getElementById("opEmail").value;

  if (!id || id <= 0) {
    alert("Valid ID required");
    return;
  }

  let url = `/api/${type}?id=${id}`;

  /* ── Insert operation requires extra fields ── */
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

    document.getElementById("outBody").innerHTML = `<div class="log">
        <span class="${err ? "log-err" : ok ? "log-ok" : "log-info"}">
          ${data.trim()}
        </span>
        <span class="log-time"> · ${ms}ms · ${type.toUpperCase()}</span>
      </div>`;

    document.getElementById("statOp").textContent = type.toUpperCase();

    /* ── Clear input fields after success ── */
    if ((type === "insert" || type === "delete") && ok) {
      document.getElementById("opId").value = "";
      document.getElementById("opName").value = "";
      document.getElementById("opEmail").value = "";

      setTimeout(() => fetchAll(true), 600);
    }
  } catch (e) {
    document.getElementById("outBody").innerHTML = `<div class="log">
        <span class="log-err">Network Error: ${e.message}</span>
      </div>`;
  }

  setLoad("lb1", false);
}

/* =================================================
   FETCH ALL RECORDS (DASHBOARD)
   -------------------------------------------------
   Retrieves entire dataset from backend and
   displays it in the dashboard data table.
================================================= */
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

/* =================================================
   FETCH ALL RECORDS (EXPLORER VIEW)
   -------------------------------------------------
   Loads database data into the Explorer tab UI.
================================================= */
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

/* =================================================
   RAW COMMAND CONSOLE
   -------------------------------------------------
   Allows direct database command execution from
   the developer console interface.

   Supported commands:
   insert,id,name,email
   search,id
   delete,id
   all
================================================= */
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
    document.getElementById("consoleBody").innerHTML = `<div class="log">
        <span class="log-err">Unknown command</span>
        <span class="log-time">
          insert,id,name,email | search,id | delete,id | all
        </span>
      </div>`;

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
        : `<div class="log">
            <span class="${err ? "log-err" : ok ? "log-ok" : "log-info"}">
              ${data.trim()}
            </span>
            <span class="log-time"> · ${ms}ms</span>
          </div>`;

    document.getElementById("consoleBody").innerHTML = html;

    document.getElementById("rawCmd").value = "";
  } catch (e) {
    document.getElementById("consoleBody").innerHTML = `<div class="log">
        <span class="log-err">Error: ${e.message}</span>
      </div>`;
  }

  setLoad("lb3", false);
}
