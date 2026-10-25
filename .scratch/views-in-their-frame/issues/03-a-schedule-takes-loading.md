# 03 - A schedule takes `loading`, as the chart does

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-a-schedule-fills-its-frame.md` (the same component's root and props)
Spec: `.scratch/views-in-their-frame/spec.md`

## What to build

The schedule's `loading`, on the rule the table and the chart share (ADR-0042). Read the chart's `loading`
first, its prop, its stale state and `loading.jsdom.test.tsx`: it is the model.

- **The prop.** `loading?: boolean`, default `false`, documented as the chart's is: the plan is on its way.
- **Over a plan.** The plan is drawn as before and marked stale. After the core token `--u-delay-stale` it
  dims, as the chart's course does, and it takes no pointer:
  - no new drag starts, and no hover tooltip opens;
  - no key press reports an intent (a move or a stretch by key);
  - a drag that began before `loading` turned on finishes and reports its intent as usual;
  - walking the plan with the keyboard and the readout stay.
- **Over nothing.** When there are no lanes, the lane column holds placeholder lines at the lane pitch, as
  many as the plot holds, drawn with core's `Skeleton`. The plot stays empty; the bands show the time axis.
  With lanes, there are no placeholders.
- **Busy.** The plot carries `aria-busy` while `loading` is on, also in the server's markup.
- **No `empty` and no wording.**
- **An example** in the schedule's demo: a plan with a switch that reloads it, and an empty schedule that is
  loading. It passes the shell's page rules.
- **ADR-0042**'s paragraph on the chart's `loading` gets a sentence: the schedule's `loading` follows the
  same rule; over nothing, placeholder lines stand in the lane column.

## Acceptance criteria

- [ ] A unit test drives the scene in jsdom, as `gestures` and `keys` do, and asserts:
  - with `loading`, the plot is busy and marked stale;
  - a drag begun before the reload reports its intent;
  - a drag begun during the reload reports none, and neither does a move by key;
  - placeholders stand with no lanes and not with lanes.
- [ ] The server-render test finds the busy plot in the markup.
- [ ] Two screenshots, a loading plan and a loading empty schedule, light and dark, compared by eye with the
      chart's and the table's loading.
- [ ] `pnpm check schedule`, `pnpm check:site` and `pnpm test:visual:quick schedule` pass, and `API.md` is
      regenerated if the gate asks.
- [ ] The changelog notes the new prop.
