# 02 - ADR: validation and a layout editor are never, time zones are not yet

Status: ready-for-agent
Type: task
Size: S

Blocked by: 01
Spec: `.scratch/what-umriss-is-not-2/spec.md` - W1, W2, W4

## What to build

One ADR, the next free number, indexed in `docs/adr/README.md` (row and count),
area "scope", status `accepted, extends ADR-0032`, date `2026-10`. ADR-0032's
status line gains `; extended by ADR-NNNN` and nothing else in it changes.

**Title as a sentence:** Form validation and a dashboard a user arranges are never
built, and time zones are not yet.

**Opening.** Three questions had no document: `FormField` says in one comment that
validation is the caller's; `CONTEXT.md` says there is no layout grid, of a month in
a date picker; core's demo outline says "no time zones other than the browser's"
three times and nothing else says it. ADR-0032 is where a reader looks for "never,
or not yet?" and held only the first.

**Decision (bold):** **umriss validates no form and builds no editor for arranging a
dashboard: both are never. It shows the reader's time and offers no other zone: that
is not yet.**

**Never - validation.** *Reason:* every application has a form library of its own
(react-hook-form, Formik, a zod schema); a second place that decides what is valid
is a second truth (ADR-0023). *Instead:* `FormField` takes `error` and `required`
and shows them; the caller's library supplies the message. A table cell's `validate`
is the one exception and stays: a cell editor has no form of the caller's around it.
*Alternatives:* a `validate` prop on every field (the same rule twice); a schema
adapter (one per library, a foreign dependency); the browser's constraint validation
(pickers and the multi-select are not inputs).

**Never - a dashboard a user arranges.** *Reason:* dragging, resizing, collision,
responsive rules and a stored layout are a product of their own, and the stored
layout is the application's. `Dock` (ADR-0013) snaps among four places and is no
precedent. *Instead:* `Stack`, `Grid` and `Splitter` lay out what the developer
decided; for tiles a user arranges, a layout library around umriss components, the
layout stored by the application. *Alternatives:* a tile grid in core (a layout
editor, plus the foreign dependency such grids bring). Saved views (planned) are
views of one table or schedule, not an arrangement of tiles.

**Not yet - time zones.** Verbatim, here and wherever it also stands: **umriss shows
the reader's time.** Every instant is shown, ticked, snapped and parsed in the
browser's zone: axes, the schedule's raster, date fields, formats, the working-time
calendar. *Why not yet:* an option runs through all of those at once, the ambiguous
hour of a clock change in a zone the reader is not in included, and no case needs it
yet. *What an application does today:* (1) for a wall screen, set the machine's zone
to the plant's; (2) send and store instants as UTC or with an offset, so one moment
is meant for every reader (a time string without an offset is read as local, a bare
date as UTC); (3) write another zone into its own text with `Intl.DateTimeFormat` and
`timeZone`, where the label is the caller's. Not: shifting timestamps by an offset to
fake a zone, which gets the clock-change hour wrong. *Alternatives:* a `timeZone` on
the provider now (built without a case, it would be built wrong); "never" (a head
office reading a remote plant is a real reader).

**Consequences.** ADR-0032 stays the page a reader opens; this one stands beside it
on the site. Time zones leave "not yet" the day an application needs a zone other
than the reader's, by an ADR that supersedes this entry. Validation needs no code.

## Acceptance

- [ ] Title, bold decision, the three entries with reason, "instead" or "what an application does today", alternatives, and consequences.
- [ ] "umriss shows the reader's time." stands once, as written; ADR-0032 changes in its status line only.
