# Splitter, Stepper, file input

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.
Blocked by: `.scratch/core-foundations/` (the same patterns, reused).

## Problem

The next tier after the six basics: the Splitter is becoming standard (Mantine
9.3, Ant Design, Chakra, Carbon's Resizer) and fits control-room layouts
(trend above, alarms below); a Stepper carries recipes and changeovers; a file
input carries recipe imports and attachments.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| L1 | Splitter | The WAI-ARIA window splitter: `role="separator"` with `aria-valuenow`, arrows move it, Enter collapses, sizes in percent, controlled and uncontrolled; horizontal and vertical. |
| L2 | Stepper | A list of steps with state (done, current, upcoming, error), `aria-current="step"`; navigation is the caller's. |
| L3 | File input | A native `<input type="file">` behind a key and a drop zone; `accept`, `multiple`, the chosen files listed; no upload - that is the application's. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Splitter | M |
| 02 | Stepper | S |
| 03 | File input | M |
| 04 | Final polish round | S |

## Testing

Per component at its interface; axe; screenshots.

## Out of scope

Upload progress and transport; a wizard container.
