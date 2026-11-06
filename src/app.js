import {
  sampleTickets,
  createTicket,
  updateTicket,
  filterTickets,
  STATUSES,
  AGENTS,
  validStoredTickets,
} from "./domain.js";
const $ = (s) => document.querySelector(s),
  key = "only-helpdesk-v1";
const esc = (v) =>
  String(v).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
let tickets = structuredClone(sampleTickets),
  selected = tickets[0].id;
try {
  const saved = localStorage.getItem(key);
  if (saved) {
    const data = JSON.parse(saved);
    if (!validStoredTickets(data)) throw Error();
    tickets = data;
    selected = tickets[0]?.id;
  }
} catch {
  $("#feedback").textContent =
    "Saved data could not be read. Sample requests are shown; reset to replace the saved copy.";
}
function save() {
  try {
    localStorage.setItem(key, JSON.stringify(tickets));
    return true;
  } catch {
    $("#feedback").textContent =
      "Browser storage is unavailable. Changes will last only while this page is open.";
    return false;
  }
}
function render() {
  $("#active-count").textContent = tickets.filter(
    (t) => t.status !== "Resolved",
  ).length;
  $("#high-count").textContent = tickets.filter(
    (t) => t.status !== "Resolved" && t.priority === "High",
  ).length;
  $("#progress-count").textContent = tickets.filter(
    (t) => t.status === "In progress",
  ).length;
  $("#resolved-count").textContent = tickets.filter(
    (t) => t.status === "Resolved",
  ).length;
  const matches = filterTickets(tickets, {
    query: $("#search").value,
    status: $("#status-filter").value,
    priority: $("#priority-filter").value,
  });
  $("#result-count").textContent =
    `${matches.length} of ${tickets.length} requests`;
  if (!matches.some((t) => t.id === selected)) selected = matches[0]?.id;
  $("#ticket-list").innerHTML = matches.length
    ? matches
        .map(
          (t) =>
            `<button class="item ${t.id === selected ? "selected" : ""}" data-id="${esc(t.id)}" aria-pressed="${t.id === selected}"><span class="row"><span class="meta">${esc(t.id)}</span><span class="pill ${t.priority.toLowerCase()}">${t.priority}</span></span><span class="item-title">${esc(t.title)}</span><span class="row"><span class="meta">${esc(t.requester)}</span><span class="pill ${t.status === "Resolved" ? "resolved" : ""}">${t.status}</span></span></button>`,
        )
        .join("")
    : '<div class="empty">No requests match these filters. Try another search or choose All.</div>';
  document.querySelectorAll("[data-id]").forEach(
    (b) =>
      (b.onclick = () => {
        selected = b.dataset.id;
        render();
      }),
  );
  const t = tickets.find((t) => t.id === selected);
  if (!t) {
    $("#details").innerHTML =
      '<h2>Request details</h2><p class="subtle">Select a request from the queue.</p>';
    return;
  }
  $("#details").innerHTML =
    `<p class="eyebrow">${esc(t.id)}</p><h2>${esc(t.title)}</h2><p>${esc(t.description)}</p><dl><div><dt>Requester</dt><dd>${esc(t.requester)}</dd></div><div><dt>Priority</dt><dd>${t.priority}</dd></div></dl><div class="divider"></div><form id="update-form"><label class="field">Status<select name="status">${STATUSES.map((s) => `<option ${s === t.status ? "selected" : ""}>${s}</option>`).join("")}</select></label><label class="field">Assignee<select name="assignee">${AGENTS.map((s) => `<option ${s === t.assignee ? "selected" : ""}>${s}</option>`).join("")}</select></label><label class="field">Work note<textarea name="note" maxlength="2000" placeholder="What changed? What should happen next?"></textarea></label><p class="subtle">Resolving a request requires a note of at least 10 characters.</p><p class="error" id="update-error" role="alert"></p><button class="primary" type="submit">Save update</button></form><div class="divider"></div><h3>Activity</h3><ol class="activity">${[
      ...t.history,
    ]
      .reverse()
      .map(
        (h) =>
          `<li>${esc(h.message)}<time>${esc(new Date(h.at).toLocaleString("en-GB"))}</time></li>`,
      )
      .join("")}</ol>`;
  $("#update-form").onsubmit = (e) => {
    e.preventDefault();
    try {
      const updated = updateTicket(
        t,
        Object.fromEntries(new FormData(e.target)),
      );
      tickets = tickets.map((v) => (v.id === t.id ? updated : v));
      const persisted = save();
      render();
      if (persisted) $("#feedback").textContent = `${t.id} updated.`;
    } catch (err) {
      $("#update-error").textContent = err.message;
    }
  };
}
$("#new-ticket").onclick = () => {
  $("#create-form").reset();
  $("#create-error").textContent = "";
  $("#create-dialog").showModal();
};
$("#cancel-create").onclick = () => $("#create-dialog").close();
$("#create-form").onsubmit = (e) => {
  e.preventDefault();
  try {
    if (tickets.length >= 500)
      throw Error(
        "This demo supports up to 500 tickets. Reset the sample data to start again.",
      );
    const ticket = createTicket(Object.fromEntries(new FormData(e.target)), {
      id: "HD-" + crypto.randomUUID().slice(0, 8).toUpperCase(),
      now: new Date().toISOString(),
    });
    tickets.unshift(ticket);
    selected = ticket.id;
    $("#search").value = "";
    $("#status-filter").value = "All";
    $("#priority-filter").value = "All";
    const persisted = save();
    $("#create-dialog").close();
    render();
    if (persisted) $("#feedback").textContent = `${ticket.id} created.`;
  } catch (err) {
    $("#create-error").textContent = err.message;
  }
};
$("#search").addEventListener("input", render);
$("#status-filter").onchange = render;
$("#priority-filter").onchange = render;
$("#reset").onclick = () => $("#reset-dialog").showModal();
$("#cancel-reset").onclick = () => $("#reset-dialog").close();
$("#confirm-reset").onclick = () => {
  tickets = structuredClone(sampleTickets);
  selected = tickets[0].id;
  $("#search").value = "";
  $("#status-filter").value = "All";
  $("#priority-filter").value = "All";
  const persisted = save();
  $("#reset-dialog").close();
  render();
  if (persisted) $("#feedback").textContent = "Sample requests restored.";
};
render();
