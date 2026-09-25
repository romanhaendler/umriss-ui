# 06 - Final polish round

Status: done
Type: task

Spec: `.scratch/schedule-a11y/spec.md`

## Scope

The visible result goes to the user as a rendered before/after page (the
review page pattern of visuelle-wertigkeit 05): every surface of this spec in
light and dark, each decision a card. Spacing, tracking and optical corrections
are settled by the agent; new tokens or visibly new colours go as a card first.

## Acceptance

- The user has taken every card on the review page.
- Every moved screenshot baseline looked at individually, never rebuilt in bulk.

## Comments

**Taken on the review page (2026-09-25), carried out as chosen.**

- schedule-ring: the plot's focus ring takes the plan's corners
  (`--u-radius-md`, was `--u-radius-sm`); still the shared ring token, inside
  the plot, with the transparent outline forced colours need.
- schedule-brackets: `]`/`[` stay, and `t` / Shift+T are their equals - out
  and back - since a German keyboard reaches the brackets only with AltGr+8/9.
  Only bare: Ctrl+T and Alt+T stay the browser's and the system's. The key
  help (`scheduleKeyHelp`, English and German) names both, and with it the
  plot's description, which reads the summary and the key help as one.
  Tested at the scene (`keys.test.ts`) and in the browser
  (`features-keyboard.spec.ts`).
- Pictures: `keyboard-active-*` moved by the ring's four corners only
  (94 pixels, looked at in both themes); the forced-colour pictures are
  recorded in forced-colors 04.
