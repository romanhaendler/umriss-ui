# 14: formatsFor is public, and the calendars start the week at the formats' weekStart

**What to build:** A team adding French derives every format from a locale in one line: core exports `formatsFor(locale, timeZone?)` as it exists, and with a time zone it gives zoned instants the team can spread its own entries over. `Formats` gains `weekStart` (1 = Monday … 7 = Sunday, ISO numbering); the English and German sets carry Monday; `formatsFor` takes it from the locale's week info where the runtime offers it, else Monday. The month grid, its Home/End keys and the weekday heads of DatePicker, DateRangePicker and DateTimePicker rotate by it; the `weekdays` wording stays Monday-first by definition, so a Sunday-first week cannot mislabel a day. ADR-0019 and ADR-0024 get dated amendments. Spec: `../spec.md` ("Formats"); repro: `../personas/p13-third-language.md` 1 and 4.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A consumer test imports `formatsFor` from the built package; `formatsFor("fr-CH")` formats numbers and dates as fr-CH
- [ ] A component test: with `weekStart: 7` the calendar's first head is Sunday and 17 March 2026 stands under Tuesday; Home/End go to Sunday and Saturday
- [ ] With the default formats nothing moves (existing tests and visual suite green)
- [ ] `formatsFor("en-US")` gives Sunday where the runtime reports week info, Monday where it does not (test both through the seam)
- [ ] API.md regenerated; ADR-0019 and ADR-0024 amended
- [ ] Commit body: `Changelog core Added:` lines
