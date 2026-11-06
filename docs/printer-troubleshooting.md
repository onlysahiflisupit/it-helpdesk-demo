# Runbook: documents stuck in a shared printer queue

**Scenario:** a fictional support exercise. Two computers cannot print, but the printer can print its own test page.

## Establish the impact

Ask which users are affected, when printing last worked, and whether every document fails. Record the exact printer name and error message. Avoid collecting document contents unless necessary and authorised.

## Narrow the cause

1. Check printer power, paper, panel errors and network connection.
2. Compare one affected workstation with a known-working workstation.
3. Check whether the queue is paused or marked offline. Confirm the selected printer, rather than changing the default for everyone.
4. If all clients use one shared queue, inspect that queue and the print service. If only one client fails, investigate its connection and driver first.
5. Before clearing queued jobs or restarting a shared service, explain the impact and obtain the appropriate operational approval.

## Verify the result

Print a harmless test page from an affected workstation. Ask the requester to retry their task. Record which check changed the outcome. If the issue remains, escalate with affected scope, timestamps, exact error text and checks already completed.

## Resolution note example

> The shared queue was paused. Resumed the queue and printed a test page from an affected workstation. The requester confirmed their document printed. No driver changes were needed.

This is an illustrative note, not a claim about an actual customer incident.
