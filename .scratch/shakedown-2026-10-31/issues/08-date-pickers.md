# 08: The date pickers keep focus, say what was picked, read what is typed

Status:     done
Blocked by: 01

Spec: `../spec.md`. Sources: README 5 (Invalid Date), 8, 21, 36 (picked date), 38 (ar-EG/fa, Lord Howe);
earlier-runs-open P10-3, P10-5, P11-2, core D (32 px root).

- [x] Arrow and Page keys that leave the month keep focus on the new active day (`Calendar.tsx:111-116` refocuses only while the grid contains the focus; the old button is gone by then). Repro: Oct 31 → PageUp; Nov 28 → ArrowDown.
- [x] The picked date (and time, and range) is in the trigger's accessible name or description, and is announced on pick, in the wording's language.
- [x] An Invalid Date as `value` shows empty with a DEV warning instead of throwing `RangeError`.
- [x] Pasting into the hour or minute field ("30", "14", "14:30") sets that value; the time fields are `spinbutton`s with value, min and max.
- [x] Tab out of an open panel closes it and moves on; focus never lands on `<body>`.
- [x] Typed dates read Arabic-Indic and Persian digits: `readTypedDate` reads back its own placeholder output under ar-EG and fa (`../reds/p29-core/p29Dates.test.ts`).
- [x] A 30-minute DST shift (Australia/Lord_Howe, 2026-04-05 01:45) is flagged ambiguous like a 1-hour one; `resolveLocalTime` (`time.ts`) probes by the zone's real offset change, not ±1 hour.
- [x] At a 32 px root the panel's weekday heads stay apart and Sunday is not cut.
- [x] `pnpm check core`; looked at as a user with the keyboard, light and dark.

## Comments

**Delivered (2026-10-31, run coordinator).** The calendar refocuses the new active day when a key leaves the
month (Oct 31 → PageUp lands on a day button - checked in Chromium); the picked value describes a named
trigger and is announced (`pickerPicked`); an Invalid Date shows empty and warns (all four pickers); time
fields are spinbuttons and take a paste ("14:30" → 14 and 30); Tab past the panel's last stop closes it
(`Popover` `closeOnTabOut`, `lastTabStop`); Arabic-Indic and Persian digits read; Lord Howe's 30-minute
change; the month width follows a 32 px root (looked at: weekday heads fit, day rows tight but clear).
Decided: `formats` writes dates in the Gregorian calendar for every locale - the grid is Gregorian, and a
Persian-calendar year typed back could not be read; this changes `fa` display in table date columns too.
The description only on a named trigger, so an unnamed one is not read twice.
