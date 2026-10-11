# A snooze's reason, shown where the list explains the snooze

Status: ready-for-agent
Date:   2026-10-11
Origin: roadmap `.scratch/open-points-roadmap/spec.md`, row T8; the fact sheet
`docs/research/open-points-2026-10/export_copy_and_wording.md`, section 5.
Follows `.scratch/alarm-list-snooze/spec.md`, whose last comment stored the
reason and left it unshown because `availabilitySnoozed(end, by)` had no place
for it.

## Problem Statement

An operator snoozes an alarm and gives a reason ("valve being replaced, back
at 14:00"). `snooze()` keeps it as `Snooze.reason`. The next operator opens the
list, sees "Snoozed", hovers for the tooltip and reads "Snoozed until 14:00 by
M. Weber" - and not why. The reason was asked for and written down, and the
screen throws it away. A screen reader hears the same sentence as the tooltip,
so the reader without a pointer misses it too.

## Solution

The sentence the list already builds for a snoozed alarm gets the reason when
there is one: "Snoozed until 14:00 by M. Weber: valve being replaced". The
badge stays the one word "Snoozed". Tooltip and screen reader follow, because
both already read the same sentence.

## Decisions

| Decision | Choice | By |
|---|---|---|
| Where it shows | The tip and what a screen reader hears; the badge stays "Snoozed" | roadmap T8 |
| How the wording takes it | `availabilitySnoozed(until, by, reason?)`: a third, optional argument | roadmap T8 |
| A caller's own wording | A two-parameter function still fits the type and keeps working; their sentence simply has no reason | roadmap T8 |
| The sentence, English | `Snoozed until ${until} by ${by}`, and with a reason `: ${reason}` appended | decided |
| The sentence, German | `Zurückgestellt bis ${until} von ${by}`, and `: ${reason}` appended | decided |
| Blank is none | The list passes the reason trimmed, `undefined` when nothing is left; the wording appends only for a non-empty string | decided |
| No new key | The sentence is the key's; `availabilitySnoozedShort` is untouched | decided |
| Long reasons | Not shortened by the library. The field is a one-line input, so a reason is short by construction | decided |
| `alarmModel.ts` | The comment on `Snooze.reason` ("The list does not show it") is rewritten to say where it shows | roadmap T8 |

## User stories

1. As an operator, I read why an alarm was snoozed in the tooltip of its badge.
2. As an operator on a screen reader, I hear the reason in the same sentence as the end and the name.
3. As a developer with my own wording, my two-parameter `availabilitySnoozed` still compiles and works.
4. As a maintainer, I find the comment on `Snooze.reason` true.

## Out of scope

- Showing the reason in the badge, in a column or in the row.
- A reason on unsnooze, preset reasons, a multi-line reason (named "not built" by the snooze spec).

## Testing decisions

- AlarmList mounted test: a snoozed alarm with a reason has it in the tooltip and in the visually hidden sentence; without a reason (or with blanks) the sentence is exactly the old one. English and with `GERMAN_WORDING`.
- Wording unit test (where the wording's other functions are pinned): the three-argument call in both languages, and the call with two.
- A type test: an object with a two-parameter `availabilitySnoozed` is assignable to the provider's `wording` prop.
- No screenshot change is expected (the badge is unchanged); the demo's smoke test passes.

## Decided while writing

- The reason is appended after a colon in both languages; blank means none; no new wording key.

## Comments
