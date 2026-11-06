# Design notes

## Problem and scope

Small support teams need enough context to reproduce a problem and enough history to hand it to the next person. The demo focuses on this workflow rather than dashboards with invented service metrics.

## Structure

- `src/domain.js`: ticket creation, validation, updates, filtering and fictional fixtures.
- `src/app.js`: event handling, rendering and browser storage.
- `scripts/serve.mjs`: a loopback-only development server.
- `tests/domain.test.mjs`: business rules checked without a browser.

## Rules

A request starts Open and Unassigned. Priorities are High, Normal and Low. The queue places high priority first. A transition into Resolved requires at least 10 characters of work note. Reopening is permitted because a user may report that a fix did not hold. Status, assignment and notes add activity entries without changing the earlier history.

The UI limits the demo to 500 tickets. This is a local performance guard, not a service quota. Input lengths are bounded. Text is escaped when rendered. Storage is validated before use; malformed records fall back to fixtures with a visible warning.

## Tradeoffs

localStorage makes a quick demo convenient but provides neither access control nor authoritative audit history. Browser-side timestamps can be altered. Native modules reduce setup work at the cost of not demonstrating a framework. The demo has no SLA clock, attachments or notifications because they are outside this small workflow.
