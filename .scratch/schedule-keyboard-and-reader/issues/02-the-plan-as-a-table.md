# 02 - The plan as a table, on demand

Status: ready-for-agent
Type: task
Size: M

Blocked by: `.scratch/root-contract/issues/06-the-schedules-ref-is-its-root.md` (the schedule's root, its props
and the hook's return), `.scratch/views-in-their-frame/issues/03-a-schedule-takes-loading.md` (the same root
and plot)
Spec: `.scratch/schedule-keyboard-and-reader/spec.md`

## What to build

A screen reader user opens the plan as a table and reads every subtask in view with the reader's table
keys. Read the chart's `DataTable` first, its key, its panel over the plot and its tests: it is the model.

- **The part.** `useSchedule` hands back `DataTable` beside the other parts. Placed inside a `Schedule`, it
  turns the table on. It takes no props, and outside a `Schedule` it renders nothing. Its JSDoc says what
  it is for, in the chart's words.
- **The key.** A disclosure button, "Show data" and "Hide data", with `aria-expanded` and `aria-controls`
  as the chart's. It stands in the corner cell beside the bottom time band, follows the plot in the tab
  order, and is in the server's markup, closed.
- **The panel.**
  - It covers the middle row, the lane headers and the plot, and the time bands stay visible.
  - While it is open, the headers and the plot are hidden from the eye and from a screen reader and leave
    the tab order.
  - The panel is a tab stop of its own and scrolls.
- **The table.**
  - One row per subtask whose occupied interval touches the span in view. The rows follow lane order (a
    folded group's lanes included) and run by start within a lane.
  - The columns are Lane (the header's own label), Task, Subtask (the row header), From and To (date and
    time each, in the readout's format), Duration (the main time's length, with lead-in and lead-out added
    where set, in the tooltip's words) and Findings (each in the tooltip's words, empty where none).
  - The caption says the span, in the words of the chart's table caption.
  - The table is written only while open, and anew when the data or the view changes.
- **Wording.** The key, the column heads and the caption are new entries in core's wording, in English and
  German. Every instant and duration goes through core's formats and the readout's duration words.
- **The demo.** One example on the schedule's tooltip page, passing the shell's page rules: a plan with a finding across midnight, with the table open by a click.
- **README.** One paragraph under reading and moving: the part, what the table lists, and that it is
  opt-in.
- **API.md** is regenerated.

## Acceptance criteria

- [ ] Unit tests through `useSchedule` in jsdom:
      - without the part, no key renders;
      - the key opens a table whose rows are the subtasks in view, in lane order, with dates, duration and
        findings in words;
      - a subtask outside the span is not listed; a lane in a folded group is;
      - while open, the plot carries no tab stop and is hidden from the accessibility tree;
      - a subtask across midnight shows both dates.
- [ ] The server-render test finds the closed key.
- [ ] Screenshots of the open table, light and dark, are compared by eye with the chart's open data table.
      The accessibility suite runs axe on the page with the table open, and it passes.
- [ ] `pnpm check schedule`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick schedule`
      pass.
- [ ] The changelogs note the part (schedule) and the new wording entries (core) under "Added".
