# 05 - The banner

Status: ready-for-agent
Type: task
Size: M

Blocked by: `04-shelving-in-isas-words.md`
Spec: `.scratch/alarms/spec.md`

## What to build

`AlarmBanner`, end to end: the worst unacknowledged alarm on every screen, the counts per priority, one tap to
the list or to acknowledge, an interruption only when it matters, and the cue for the application's horn.

- **Input.**
  - `view`: the projection of an `alarmModel` call without a filter. Its JSDoc says why: a filter in the list
    must never hide the worst alarm from the banner.
  - `asOf` and `freshness`, as the list takes them.
- **What it shows**, in one line that wraps at narrow widths:
  - the worst active, unacknowledged alarm in service, first in the default order: its `PriorityMark`, its
    type's label, and its raise time;
  - the count of such alarms per priority, each with its mark;
  - "n more";
  - the flood, when one is marked;
  - the freshness, when given.

  Without such alarms it says "No unacknowledged alarms". With a lost source it says that the connection is
  down instead, and never "No alarms" (the list's rule).
- **The projection** gains a count per priority of active, unacknowledged alarms in service. It is counted
  over the filtered set, like `activeUnacknowledged`, and the banner reads it.
- **Intents.**
  - "Acknowledge" reports the shown alarm through `onAcknowledge([id])`.
  - "Open list" calls `onOpen()`.
  - Each button stands only with its handler. The banner applies nothing.
- **Landmark and speech** (A6.9).
  - The banner is one named region ("Alarms").
  - A visually hidden element with `role="alert"` gets a text only when a new active, unacknowledged alarm in
    service has a higher priority than the one shown before. The text is its priority and label.
  - A count change, an acknowledgement or a re-sort never sets it.
  - The first render sets nothing.
- **`onAnnunciate(event)`**, the cue for sound.
  - `{ kind: "new", priority }` when one or more alarms are active, unacknowledged and in service that were
    not so in the previous projection. It carries the highest priority among them. A shelve that ran out
    (ticket 04) counts as new.
  - `{ kind: "cleared" }` when the last such alarm is gone.
  - The banner derives both by comparing the ids of one projection with the last. There is no timer; the
    first render fires nothing.
  - The JSDoc says that the horn, its repetition and a silence button are the application's.
- **Placement.** Sticky placement is the host's layout; the README shows it in one line of CSS.
- **Stale source** (A6.7). With a stale or lost freshness, every alarm stays shown and counted.
- **Wording**, English and German, with the prefix `alarm`: the region's name, "No unacknowledged alarms",
  the connection-down sentence, "n more", "Open list", and the alert's sentence.
- **The demo.**
  - A page `AlarmBanner`: one example over the list, sharing its alarms, where acknowledging in either one
    changes both.
  - One example where a button adds a critical alarm while a row of the list has focus. The banner changes,
    and focus stays where it was (A6.5).

## Acceptance criteria

- [ ] With alarms of every priority, the banner shows the critical one first and the counts per priority, and
      a filter that hides the critical alarm from the list does not hide it from the banner.
- [ ] `role="alert"` gets text on a new alarm of higher priority, and not on a new alarm of equal or lower
      priority, on an acknowledgement, or on the first render. Asserted by sequence of projections.
- [ ] `onAnnunciate` fires `new` with the highest new priority, once per projection that adds one; `cleared`
      when the last unacknowledged alarm is acknowledged, returns or is shelved; nothing on the first render.
- [ ] With a lost source and no alarms, the banner says the connection is down.
- [ ] In the demo, adding a critical alarm while a list row has focus keeps focus on that row, which a
      component test asserts.
- [ ] `pnpm check alarms`, `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick alarms` pass, and
      the accessibility check of the shell passes on the banner's page.
