# 03 - A stale series says so

Status: ready-for-agent
Type: task
Size: S

Blocked by: None (can start immediately)
Spec: `.scratch/dev-warnings/spec.md`

## What to build

A line `value={(d) => d.duration * factor}` keeps its old course after a unit toggle changes `factor`, as it
does today. In development the chart now logs one warning. The warning names the series, says that its
function reads a value from outside the row that has changed, and gives the two ways out: carry the value
in the rows, or give the series a `key` that changes with it.

- **The probe.** It runs where the series comparison finds two functions equal by text: the `value`, the
  baseline, a box's further channels, and the control chart's accessor. Only in DEV, when identity
  differs:
  - call both on at most the first 1,000 of the rows the series reads;
  - compare the results: primitives by `Object.is`, Dates by time; any other result is not compared;
  - warn once per series name on the first difference.

  Materialisation and everything else stay as they are.
- `tickFormat` and the tooltip's `render` are not probed. Their documented limit stays.
- **The documents.** The scene's comment on the known limit, the series documentation and the charts'
  capabilities record name the two ways out and the warning. The series documentation is the demo's, and
  so `llms-full.md`.

## Acceptance criteria

- [ ] A series whose `value` closes over a changed factor warns once in DEV, naming the series.
- [ ] The same for a baseline and for a control chart's accessor.
- [ ] An unchanged closure, a field name and a native function stay silent.
- [ ] With the factor in a changing `key` on the series, the chart draws the new course.
- [ ] The probe calls an accessor at most 1,000 times per side per comparison.
- [ ] `pnpm check charts` and `pnpm check:site` pass.
- [ ] The changelog notes the warning under "Added".
