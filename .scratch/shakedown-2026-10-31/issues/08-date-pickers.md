# 08: The date pickers keep focus, say what was picked, read what is typed

Status:     ready-for-agent
Blocked by: 01

Spec: `../spec.md`. Sources: README 5 (Invalid Date), 8, 21, 36 (picked date), 38 (ar-EG/fa, Lord Howe);
earlier-runs-open P10-3, P10-5, P11-2, core D (32 px root).

- [ ] Arrow and Page keys that leave the month keep focus on the new active day (`Calendar.tsx:111-116` refocuses only while the grid contains the focus; the old button is gone by then). Repro: Oct 31 → PageUp; Nov 28 → ArrowDown.
- [ ] The picked date (and time, and range) is in the trigger's accessible name or description, and is announced on pick, in the wording's language.
- [ ] An Invalid Date as `value` shows empty with a DEV warning instead of throwing `RangeError`.
- [ ] Pasting into the hour or minute field ("30", "14", "14:30") sets that value; the time fields are `spinbutton`s with value, min and max.
- [ ] Tab out of an open panel closes it and moves on; focus never lands on `<body>`.
- [ ] Typed dates read Arabic-Indic and Persian digits: `readTypedDate` reads back its own placeholder output under ar-EG and fa (`../reds/p29-core/p29Dates.test.ts`).
- [ ] A 30-minute DST shift (Australia/Lord_Howe, 2026-04-05 01:45) is flagged ambiguous like a 1-hour one; `resolveLocalTime` (`time.ts`) probes by the zone's real offset change, not ±1 hour.
- [ ] At a 32 px root the panel's weekday heads stay apart and Sunday is not cut.
- [ ] `pnpm check core`; looked at as a user with the keyboard, light and dark.

## Comments
