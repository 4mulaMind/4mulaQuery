/**
 * =========================================================
 *    API COMMUNICATION MODULE (api.js)
 *    ------------------------------------------------------
 *    Handles communication between the frontend UI and
 *    backend API endpoints.
 *
 *    Features:
 *    - CRUD operations (Insert, Delete, Search, Fetch)
 *    - Query execution timing
 *    - Console command execution
 *    - Data explorer integration
 *    - Result rendering
 * =========================================================
 *
 * @format
 */

/* ---------------------------------------------------------
   CRUD Operation Handler
   ---------------------------------------------------------
   operate(type) → executes insert / delete / search
--------------------------------------------------------- */
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

    document.getElementById("outBody").innerHTML = `<div class="log">
            <span class="${err ? "log-err" : ok ? "log-ok" : "log-info"}">
                ${data.trim()}
            </span>
            <span class="log-time"> · ${ms}ms · ${type.toUpperCase()}</span>
        </div>`;

    document.getElementById("statOp").textContent = type.toUpperCase();

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

/* ---------------------------------------------------------
   Fetch All Records
   ---------------------------------------------------------
   Loads entire dataset from backend
--------------------------------------------------------- */
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
      document.getElementById("outBody").innerHTML = `<div class="log">
                <span class="log-err">Error: ${e.message}</span>
            </div>`;
  }

  if (!silent) setLoad("lb1", false);
}

/* ---------------------------------------------------------
   Explorer Data Loader
   ---------------------------------------------------------
   Displays records inside data explorer panel
--------------------------------------------------------- */
async function fetchAllExplorer() {
  setLoad("lb2", true);

  try {
    const res = await fetch("/api/all");
    const data = await res.text();

    document.getElementById("explorerBody").innerHTML = renderTable(data);

    document.getElementById("statTotal").textContent = countRows(data);
  } catch (e) {
    document.getElementById("explorerBody").innerHTML = `<div class="log">
            <span class="log-err">Error: ${e.message}</span>
        </div>`;
  }

  setLoad("lb2", false);
}

/* ---------------------------------------------------------
   Raw Command Console
   ---------------------------------------------------------
   Allows manual command execution similar to CLI
--------------------------------------------------------- */
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
