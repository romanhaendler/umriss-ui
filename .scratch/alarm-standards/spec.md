# Alarms and colours by the standards (ISA-18.2, ISA-101)

Status: done
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

umriss's plant vocabulary is its moat - one `assess()`, four verdicts,
freshness as a second axis - but it does not yet name the standards it is close
to. ISA-18.2 knows, beside the lifecycle umriss models (standing/cleared ×
acknowledged/unacknowledged), the special states **Shelved**, **Suppressed by
design** and **Out of service**, reachable from any state. ISA-101 reserves
colour for abnormal states on a grey base; umriss's design language ("no colour
without a verdict") is near it and says nothing of it. Siemens iX, the one open
industrial system, models neither.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| I1 | How the special states enter | A second field beside the lifecycle: `availability: "in-service" | "shelved" | "suppressed-by-design" | "out-of-service"`, never merged into the four lifecycle values - the model's own rule that one state is one field (alarmModel.ts). Shelved carries `until` and who shelved it. |
| I2 | Visible, never hidden | The model still suppresses nothing: shelved and out-of-service alarms stay in the list, drawn neutrally with their state as a word, and a view ("Hidden from operation") counts them - "not absent, only deliberately hidden" (ISA-101 practice). |
| I3 | Transitions | Pure: `shelve(until)`, `unshelve`, `takeOutOfService`, `returnToService`; the application performs them, the model never does (as with acknowledging). A shelf that expires returns by the model's clock, not by a timer. |
| I4 | ISA-101 in the design language | A section in `docs/design-language.md` naming the rule (grey base, colour only for abnormal, redundancy by word or glyph) and a check that no verdict colour appears without its word or glyph in the library's own components. |
| I5 | The standards document | `docs/standards.md`: what umriss follows from ISA-18.2 and ISA-101, what it deliberately does not, and the sources (the norm texts are paywalled; secondary sources named as such). Written only after I1-I4 are delivered - the claim follows the work. |
| I6 | Glossary | **Availability**, **Shelved**, **Out of service**, **Suppressed by design** in `CONTEXT.md`. |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | Availability in the alarm model | M |
| 02 | Shown in the AlarmList | M |
| 03 | ISA-101 in the design language | S |
| 04 | The standards document | S |
| 05 | Final polish round | S |

## Testing

Pure transition tests first; the AlarmList at its interface; screenshots.

## Out of scope

Alarm generation (the model never raises alarms); flood suppression by rule;
an alarm server protocol.
