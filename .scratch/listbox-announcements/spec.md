# What VoiceOver does not say in a combobox

Status: ready-for-agent
Date:   2026-09-24
Origin: the library comparison of 24 Sep 2026 (notes in `docs/research/library-comparison-2026-09/`); order in `.scratch/comparison-roadmap/spec.md`.

## Problem

React Aria's published screen-reader work found that VoiceOver announces
`aria-activedescendant` options poorly - no count, no selected state - and fixed
it with a live announcer. umriss's `Combobox`, `MultiSelect` and
`CommandPalette` use exactly that pattern.

## Decisions

Taken on the user's standing trust ("I trust you fully to work out the topics
we really need"); each can be challenged before its ticket starts.

| # | Question | Decision |
| --- | --- | --- |
| B1 | Announcer | One shared polite live region in core (a small `announce(text)` beside the portal target), not one per component. |
| B2 | What is said | On open and on each filter change: the number of options ("12 options"); on moving: the option's label and "selected" where it is; on choosing in the MultiSelect: "added"/"removed". Wording EN/DE. |
| B3 | Pace | Debounced after typing rests, as the charts' readout (150 ms). |

## Solution

| Ticket | Scope | Size |
| --- | --- | --- |
| 01 | The shared announcer | S |
| 02 | Combobox, MultiSelect, CommandPalette | M |

## Testing

jsdom tests of the announced text; one manual VoiceOver pass recorded.

## Out of scope

`aria-hidden` outside the open list (React Aria's `ariaHideOutside`) - a
later decision, it touches every overlay.
