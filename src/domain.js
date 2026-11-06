export const STATUSES = ["Open", "In progress", "Waiting", "Resolved"];
export const PRIORITIES = ["High", "Normal", "Low"];
export const AGENTS = ["Unassigned", "Alex Morgan", "Jordan Lee"];
const text = (value, max) =>
  String(value ?? "")
    .trim()
    .slice(0, max);
export function createTicket(
  input,
  { id, now } = { id: crypto.randomUUID(), now: new Date().toISOString() },
) {
  const title = text(input.title, 120),
    requester = text(input.requester, 80),
    description = text(input.description, 2000);
  if (title.length < 5)
    throw new Error("Use at least 5 characters for the summary.");
  if (!requester) throw new Error("Enter a requester name.");
  if (description.length < 10)
    throw new Error("Describe the issue in at least 10 characters.");
  if (!PRIORITIES.includes(input.priority))
    throw new Error("Choose a valid priority.");
  return {
    id,
    title,
    requester,
    description,
    priority: input.priority,
    status: "Open",
    assignee: "Unassigned",
    createdAt: now,
    history: [{ at: now, message: "Ticket created" }],
  };
}
export function updateTicket(ticket, input, now = new Date().toISOString()) {
  if (!STATUSES.includes(input.status) || !AGENTS.includes(input.assignee))
    throw new Error("Choose a valid status and assignee.");
  const note = text(input.note, 2000);
  if (
    input.status === "Resolved" &&
    ticket.status !== "Resolved" &&
    note.length < 10
  )
    throw new Error("Add a resolution note of at least 10 characters.");
  const changes = [];
  if (input.status !== ticket.status)
    changes.push(`Status: ${ticket.status} → ${input.status}`);
  if (input.assignee !== ticket.assignee)
    changes.push(`Assigned to ${input.assignee}`);
  if (note) changes.push(note);
  if (!changes.length)
    throw new Error("Change the status, assignee, or add a note.");
  return {
    ...ticket,
    status: input.status,
    assignee: input.assignee,
    history: [...ticket.history, { at: now, message: changes.join(". ") }],
  };
}
export function filterTickets(
  tickets,
  { query = "", status = "All", priority = "All" } = {},
) {
  const q = query.trim().toLowerCase();
  return tickets
    .filter(
      (t) =>
        (status === "All" || t.status === status) &&
        (priority === "All" || t.priority === priority) &&
        [t.id, t.title, t.requester, t.description].some((v) =>
          v.toLowerCase().includes(q),
        ),
    )
    .sort(
      (a, b) =>
        PRIORITIES.indexOf(a.priority) - PRIORITIES.indexOf(b.priority) ||
        b.createdAt.localeCompare(a.createdAt),
    );
}
export function validStoredTickets(value) {
  return (
    Array.isArray(value) &&
    value.length <= 500 &&
    value.every(
      (t) =>
        t &&
        ["id", "title", "requester", "description", "createdAt"].every(
          (k) => typeof t[k] === "string",
        ) &&
        STATUSES.includes(t.status) &&
        PRIORITIES.includes(t.priority) &&
        AGENTS.includes(t.assignee) &&
        Array.isArray(t.history) &&
        t.history.every(
          (h) => typeof h.at === "string" && typeof h.message === "string",
        ),
    )
  );
}
export const sampleTickets = [
  {
    id: "HD-1042",
    title: "Classroom display loses its HDMI signal",
    requester: "Casey Reed",
    description:
      "The display disconnects when the laptop wakes from sleep. Another cable works until the next restart. Please check the input settings before replacing hardware.",
    priority: "High",
    status: "Open",
    assignee: "Unassigned",
  },
  {
    id: "HD-1041",
    title: "Shared printer queue is paused",
    requester: "Taylor Lane",
    description:
      "Documents remain in the queue on two workstations. The printer itself can print a test page.",
    priority: "Normal",
    status: "In progress",
    assignee: "Alex Morgan",
  },
  {
    id: "HD-1040",
    title: "Guest Wi-Fi access for a workshop",
    requester: "Sam Ellis",
    description:
      "A temporary guest network is needed for the Saturday workshop. Waiting for the organiser to confirm attendance.",
    priority: "Normal",
    status: "Waiting",
    assignee: "Jordan Lee",
  },
  {
    id: "HD-1039",
    title: "Replace a missing keyboard keycap",
    requester: "Robin Park",
    description:
      "The spare keyboard has been installed and checked with the requester. Original keyboard set aside for repair.",
    priority: "Low",
    status: "Resolved",
    assignee: "Alex Morgan",
  },
].map((t, i) => ({
  ...t,
  createdAt: `2026-11-0${6 - i}T08:00:00.000Z`,
  history: [
    {
      at: `2026-11-0${6 - i}T08:00:00.000Z`,
      message:
        i === 3
          ? "Replacement checked with the requester. Ticket resolved."
          : "Sample ticket recorded",
    },
  ],
}));
