# A control room: every package on one page

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.
Blocked by: `.scratch/alarm-standards/` tickets 01-02 (the list shows the new states); best after `core-foundations` (Drawer, ProgressBar appear on the page).

## Problem

The moat is not one component but the shared vocabulary across all five
packages - and nothing shows it at a glance. No open library has an OEE or
shift view; iX, MUI and Mantine have no page like it. A reference page that
joins a `Stat` with freshness, a trend with a limit band, a `ControlChart`, the
`AlarmList`, the schedule and an OEE `Calculation` makes the case in one look.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| R1 | Where | A page in the core demo's shell as its own rubric "Control room" - the one demo that may import every package, as a consumer would. Not a sixth demo. |
| R2 | Data | One simulated plant in a pure generator (a kiln line over a shift): the same readings feed every part, so a limit crossed in the trend is the alarm in the list and the verdict on the tile. |
| R3 | Live | A simulated clock advancing on a timer, paused under `prefers-reduced-motion` and in screenshots (the fixed clock). |
| R4 | Accessibility | Every part keeps its own keyboard model; the page adds landmarks and a skip link per region. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The plant generator | M |
| 02 | The control room page | L |
| 03 | Final polish round | S |

## Testing

The generator's determinism; screenshots; axe.

## Out of scope

A real data connection (OPC UA, MQTT); layout persistence.
