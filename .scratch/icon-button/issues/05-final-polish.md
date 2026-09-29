# 05 — Final polish round

Status: done
Type: task

Blocked by: 04
Spec: `.scratch/icon-button/spec.md`

## Scope

Every page with a button looked at rendered, light and dark, hover and focus,
narrow and wide. The user delegated the acceptance to the agent ("Ich werde
dich nicht kontrollieren").

## Acceptance

- Every moved screenshot baseline looked at on its own, never rebuilt in bulk.

## Comments

Checked by the agent, the acceptance delegated by the user: all 257 moved or new
screenshots of the first run, expected beside actual, one by one (65 sheets,
light and dark, all five demos); the open Modal by pointer and by keyboard, the
calendar with its paging hovered, an IconButton hovered and focused in both
themes, a row's menu opened from its `IconButton` and closed with Escape, the
MultiSelect panel. No page error. Two baselines were stale before this work and
are renewed with it: the table's "a key that is no column" still showed
unrounded averages, the toast's "show a toast" an older lead.
