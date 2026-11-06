import test from "node:test";
import assert from "node:assert/strict";
import {
  createTicket,
  updateTicket,
  filterTickets,
  sampleTickets,
  validStoredTickets,
} from "../src/domain.js";
const input = {
  title: "Printer is offline",
  requester: "Test requester",
  description: "Two workstations cannot print.",
  priority: "High",
};
const fixture = () =>
  createTicket(input, { id: "T-1", now: "2026-11-06T00:00:00Z" });
test("new requests start open and unassigned", () => {
  const t = fixture();
  assert.equal(t.status, "Open");
  assert.equal(t.assignee, "Unassigned");
  assert.equal(t.history.length, 1);
});
test("blank or short summaries cannot enter the queue", () => {
  for (const title of ["", "    ", "abcd"])
    assert.throws(() => createTicket({ ...input, title }));
});
test("a requester and actionable description are required", () => {
  assert.throws(() => createTicket({ ...input, requester: " " }));
  assert.throws(() => createTicket({ ...input, description: "short" }));
});
test("unknown priorities are rejected", () =>
  assert.throws(() => createTicket({ ...input, priority: "Urgent" })));
test("resolving requires a useful note", () =>
  assert.throws(() =>
    updateTicket(fixture(), {
      status: "Resolved",
      assignee: "Alex Morgan",
      note: "Done",
    }),
  ));
test("resolution records a note without mutating the original", () => {
  const t = fixture();
  const u = updateTicket(
    t,
    {
      status: "Resolved",
      assignee: "Alex Morgan",
      note: "Reconnected the network cable.",
    },
    "2026-11-06T09:00:00Z",
  );
  assert.equal(u.status, "Resolved");
  assert.equal(u.history.length, 2);
  assert.equal(t.status, "Open");
  assert.equal(t.history.length, 1);
});
test("an empty update is rejected", () =>
  assert.throws(() =>
    updateTicket(fixture(), {
      status: "Open",
      assignee: "Unassigned",
      note: "",
    }),
  ));
test("filters combine text, priority and status", () => {
  const matches = filterTickets(sampleTickets, {
    query: "CASEY",
    priority: "High",
    status: "Open",
  });
  assert.equal(matches.length, 1);
  assert.equal(matches[0].id, "HD-1042");
  assert.equal(
    filterTickets(sampleTickets, { query: "missing word" }).length,
    0,
  );
});
test("malformed local records are rejected", () => {
  assert.equal(validStoredTickets(sampleTickets), true);
  assert.equal(validStoredTickets([{ id: "broken" }]), false);
  assert.equal(validStoredTickets({}), false);
});
