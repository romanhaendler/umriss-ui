# 08 - The control room in plant time

Status: ready-for-agent
Type: task
Size: S

Blocked by: `05-a-chart-in-a-named-time-zone.md`, `06-the-schedule-plans-in-the-zone.md`
Spec: `.scratch/plant-time-zone/spec.md`

## What to build

The promise, shown on one page and held by a picture. The control room is core's scenario "Watch a kiln
line", the page that already reaches the other packages. It runs in a named plant zone, with a switch between
plant time and the reader's time. A visual test reads it as a head office would.

- **The example.** The scenario names `Europe/Berlin` in its formats. A segmented control switches the
  formats between the plant's zone and none, with one memo: this is the recipe the README points at for an
  application that wants the switch. Its trends pass `useFormats().timeZone` to `Chart`. Its alarm table and
  its schedule follow by themselves.
- **The docs.** Core's "Time zone" README part (03) links the example and shows the switch's few lines.
- **The visual test.**
  - Under Playwright's `timezoneId: "America/New_York"`, the page shows the label on the trend's time axis,
    the alarm table's time column and the schedule's axis, and Berlin times in all of them. The pickers'
    label is 04's and is pinned there.
  - Under `timezoneId: "Europe/Berlin"` it shows no label.
  - The prerendered page (ADR-0037) hydrates without a console error in both.

## Acceptance criteria

- [ ] The example passes the shell page rules, and its switch changes every time on the page at once.
- [ ] The visual test is tagged `@quick` for the New York case and passes in Chromium and WebKit.
- [ ] No console error and no hydration warning under either zone.
- [ ] `pnpm check demo`, `pnpm check:site` and `pnpm test:visual:quick core` pass.
