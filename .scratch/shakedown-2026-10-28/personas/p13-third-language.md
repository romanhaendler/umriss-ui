# P13 Third-language team (fr-CH) - 2026-10-28, 0.48.0 (first run)
Host: p13-third-language (Vite 7.3, React 19, TS strict exactOptionalPropertyTypes, skipLibCheck false; all seven tarballs; Chromium). Wording = English through pseudo-localiser ("FR·" prefix, +35 %), hand-built fr-CH 12h Formats, own ChartsWording.
Not covered: WebKit, dark, real French copy, SSR.

Findings (unverified until ✓):
1. Trap: Sunday-first weekdays array silently mislabels the calendar - grid hard-coded Monday-first ("DI" over Monday). core DatePicker/grid.ts. documented "weeks begin on Monday", no warning. probe.mjs, shots/probe-sunday.png.
2. Trap: NumberInput fr-CH: typed "." dropped -> 1234.5 becomes 12345 (10x), "1'234.5" -> 12345, no error. number.ts.
3. Misfit: 12-hour clock stops at the field - DateTimePicker panel spinners 24h; charts 24h. documented ADR-0024.
4. Trap: formatsFor not exported -> third language hand-writes all ~20 Formats; a full custom set + timeZone "Pacific/Auckland" silently not re-zoned (shows reader's New York; useTimeZoneLabel "New York"). language/index.tsx:70-80 mergeFormats. partly documented.
5. Look: long wording clips AlarmList state cell mid-word, no ellipsis (440 px text in 320 px at 1440; EN clips at 375 too). clip.mjs, shots/alarms-1440.png.
6. Look: AlarmBanner time wraps at 375 ("10:27:00 / AM").
7. Misfit: schedule README "smallest schedule" logs false dependency warning twice (= p1-lena 1 ✓).
8. Misfit: charts wording per chart, no provider; chart in dashboard widget falls back to English (known composed-app 4, ADR-0031).
9. Minor: CSV booleans lowercase; instants as ISO UTC. documented.

Wishes: export formatsFor(locale, tz) (unlisted; ADR-0019 "third language is the app's business"); weekStart 0-6 for calendar/range/schedule (unlisted); hourCycle in Formats reaching picker panel + charts (unlisted, ADR-0024); one chart wording provider (unlisted).
Held up: Wording typed against English - tsc names every missing key (302 keys); no English leak anywhere (popups, menus, data tables, aria, live regions, CSV filenames, ~20 states); fr-CH numbers/dates, CSV ";"; no page overflow 375/1440; French dateLong/monthName in calendar + schedule; table dev warnings; alarm badges hold under +35 %.

Verified by coordinator: 2 ✓ (NumberInput/number.ts:59-68 filterInput allows only digits + the formats' group/decimal; "." is neither under fr-CH and is dropped silently), 7 ✓ (p1-lena 1).
