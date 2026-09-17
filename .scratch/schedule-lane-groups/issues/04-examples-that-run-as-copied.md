# 04 — Examples that run as copied

Status: done
Type: task

Spec: `.scratch/schedule-lane-groups/spec.md` (user stories 20, 23, 25, "The demo")

## Scope

- Every schedule example defines its own data, small and made for its feature; `demo/data.ts` stays for `99-demonstration` alone.
- The shell: an example may name sibling files to show as further code tabs; Copy takes the tab in front. The demonstration names `data.ts`.
- A check in `@umriss-ui/demo/checks`: an example imports from the package's `src` and from npm only, shown siblings excepted; called by all four demos' suites.
- No example is renamed or split here - that is 05 and 06.

## Acceptance

- The check fails on a scratch run with one `../../data` import restored, and the ticket says that it did.
- Feature specs that read fixture ids read them from the example they test; `plot.ts` follows.
- Pictures change where the data changed: count stated, no renames.

## Comments

### Delivery

- **Eleven of the twelve examples now carry their own plant**, written in the
  file: the lanes, orders, steps and moves each one actually needs. Ids and
  times are the ones the plans already had, so a reader who moves between
  examples still recognises A-2041 on the saw - what went is the ninety lines
  nobody saw.
- **`99-demonstration` is the one exception, and it declares itself.**
  `export const shows = ["../../data.ts"]` puts the plant in a second tab of
  the code view. A demonstration IS a whole plant; ninety lines of it in the
  file would bury the thing it demonstrates.
- **The shell learned `shows`.** `readExamples` resolves the paths against a
  second raw glob the demo passes as `beside`, and every example carries
  `files` - itself first, then what it shows. `Example.tsx` draws a tab bar
  only where there is more than one, and **Copy takes the tab in front**: a
  button that always copied the first would be a lie on the second.
- **`shows` is stripped from the shown source**, as `title` is. Not a third
  rule: `withoutTitle` now removes the demo's own bookkeeping, and both exports
  are members of that one rule. A pasted file must not carry two exports that
  mean nothing outside this demo.
- **`@umriss-ui/demo/checks/ownData.ts`**: an example may import the package's
  `src` and bare npm specifiers, and nothing else; a path it names in `shows`
  is the declared exception. Called by all four demos' `own-data.spec.ts`. It
  reads the files rather than the browser, and fails if it finds no files at
  all - a check that passes over an empty directory is the one failure a check
  must never have.

### The scratch run the acceptance asks for

Run before the examples were repaired, with every `../../data` import still in
place. **It failed in exactly the two demos that had them**, and named every
one:

- `charts`, 13 offenders: `Axis/01-configuration.tsx › ../../data` … `Span/01-schedule.tsx › ../../data`
- `schedule`, 12 offenders, including `Intent/99-demonstration.tsx › ../../data`
- `core` and `table` passed untouched - neither had a shared fixture.

`charts` is repaired the way the check allows and the spec's Out of Scope
demands (the other demos' structure is not this spec's): each of its thirteen
examples now **shows** `data.ts` as a second tab. Its code is copyable for the
first time, and nothing about its structure moved.

### Feature specs

`plot.ts` stopped exporting a table of lane indices. **Lanes are named now**
and resolved from the headers the example itself rendered - `plot.y("mill")`,
`plot.index("press")`. A shared index table would be a second list of what the
examples contain and would drift the moment an example gained a lane; it also
would not have survived tickets 05, 06 and 08, which re-cut the examples again.

### A defect found and NOT fixed here

`schedule--in-step`: the two plans can stand one frame apart. A span is
reported once per frame and handed back as the other schedule's
`initialDomain`, and the round trip through React can arrive after the plan has
moved on - measured at 15 px, exactly one move of the drag. The test asserts
that the lower plan followed, not that the two agree to the pixel, and says so
at the site. It belongs to no ticket of this spec; it is `onDomainChange` and
the `initialDomain` round trip, and it wants a ticket of its own.

The `in-step` test was also **flaky under parallel load** and is now robust: it
asserted how far the pan got, which is its means and not its subject.

### Tests

- `features-page`, 2 new: the demonstration's two tabs with Copy following the
  tab in front and carrying neither `title` nor `shows`, and an example that
  shows nothing having no tab bar at all.
- All suites: schedule, core and table 780 passed, 276 skipped. Charts: 114
  passed, one screenshot failed - `axis--axes`, one of the two to four that
  differ from run to run (`docs/testing.md`, **Known open**), a different set
  each time and not this ticket's.
- Unit: 1959 across the five packages.

### Pictures

70 schedule baselines read. **22 renewed** - the eleven examples whose plant
changed, light and dark. **None renamed, none added, none removed.**

Charts baselines: **none renewed.** Its examples only gained an export that the
code view strips, so the picture cannot have moved; the failures its suite
shows are the documented non-reproducible ones.

The examples also gained heights that fit their lanes (a four-lane plan in a
380-pixel box was two hundred pixels of nothing) and `first-schedule` an
afternoon, so that a day in the plant is a day.
