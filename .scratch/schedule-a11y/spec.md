# The schedule for keyboard and screen reader

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

The schedule is the only package without keyboard or screen-reader access to
its content (`.scratch/schedule-refinement/spec.md` deferred it to a spec of its
own). Everywhere else umriss is above the market on accessibility; here it is
below. The charts showed the pattern in 0.6.0 (ADR-0030): one tab stop, one
active position, keys that walk, a polite readout.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| S1 | Tab stop | The timeline area is one tab stop (`role="application"`, `aria-roledescription` "schedule", the existing label); lane headers and the toolbar keep their own stops. |
| S2 | What is walked | An **Active subtask**: ←/→ previous/next subtask on the lane in time order, ↑/↓ the subtask on the lane above/below nearest in time (collapsed lane groups are one row), Home/End the lane's first/last, PageUp/PageDown by a visible tenth of time. Transports are reached from their subtask by `]`/`[` (out along the transport, back to the subtask); the keys are settled in ticket 03 after a prototype shown rendered, since no library has a precedent. |
| S3 | Selection vs active | As in core (ADR-0003): the active subtask is where one stands; Space/Enter selects it as the pointer's click does (the existing selection reporting). |
| S4 | Readout | After keys rest (150 ms, as the charts): lane, subtask name, start-end in local time, and its findings (overlap, late transport) by name. The findings are the schedule's distinction - they are spoken, never only coloured. |
| S5 | Editing by key | Alt+←/→ proposes a move by one snap step, Alt+Shift+←/→ a resize - reported as the same intents the drag reports (ADR-0023); nothing is applied by the schedule. |
| S6 | Summary | A description: lanes, subtasks in view, the visible time span, the number of findings by kind, the key help (wording). |
| S7 | Glossary | **Active subtask** beside core's active node and the charts' Active point; an ADR only if S1/S5 diverge from ADR-0030. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The walk as a pure module | M |
| 02 | Tab stop, active subtask, focus ring | M |
| 03 | Reaching transports | M |
| 04 | Readout and summary | M |
| 05 | Editing by key | M |
| 06 | Final polish round | S |

## Testing

The walk as a pure module first (unit tests); jsdom for readout and summary;
Playwright interaction tests; axe clean; one screenshot per theme of a focused
schedule with an active subtask.

## Out of scope

Touch editing; a list view of the schedule as an alternative table (a later
spec, like the charts' data table).
