# Form validation and a dashboard a user arranges are never built, and time zones are not yet

Status: accepted, extends ADR-0032; superseded in one point by ADR-0064 (a dashboard a user arranges is built)
Date:   2026-10

Three questions had no document. `FormField` says in one comment that
validation is the caller's; `CONTEXT.md` says there is no layout grid, of a
month in a date picker; core's demo outline says "no time zones other than the
browser's" three times and nothing else says it. ADR-0032 is where a reader
looks for "never, or not yet?", and it held only the first.

**umriss validates no form and builds no editor for arranging a dashboard: both
are never. It shows the reader's time and offers no other zone: that is not
yet.**

## Never: validation

*Reason.* Every application has a form library of its own (react-hook-form,
Formik, a zod schema); a second place that decides what is valid is a second
truth (ADR-0023). *Instead.* `FormField` takes `error` and `required` and shows
them; the caller's library supplies the message. A table cell's `validate` is
the one exception and stays: a cell editor has no form of the caller's around
it.

## Never: a dashboard a user arranges

*Reason.* Dragging, resizing, collision, responsive rules and a stored layout
are a product of their own, and the stored layout is the application's. `Dock`
(ADR-0013) snaps among four places and is no precedent. *Instead.* `Stack`,
`Grid` and `Splitter` lay out what the developer decided; for tiles a user
arranges, a layout library around umriss components, the layout stored by the
application. Saved views (planned) are views of one table or schedule, not an
arrangement of tiles.

## Not yet: time zones

**umriss shows the reader's time.** Every instant is shown, ticked, snapped and
parsed in the browser's zone: axes, the schedule's raster, date fields,
formats, the working-time calendar.

*Why not yet.* An option runs through all of those at once, the ambiguous hour
of a clock change in a zone the reader is not in included, and no case needs it
yet.

*What an application does today.*

1. For a wall screen, set the machine's zone to the plant's.
2. Send and store instants as UTC or with an offset, so one moment is meant for
   every reader (a time string without an offset is read as local, a bare date
   as UTC).
3. Write another zone into its own text with `Intl.DateTimeFormat` and
   `timeZone`, where the label is the caller's.

Not: shifting timestamps by an offset to fake a zone, which gets the
clock-change hour wrong.

*Amended 2026-10-25:* on a server, umriss shows no instant. The reader's zone is known only in the
browser, so a time written on the server is a guess. Under a server in another zone that guess differs
from the browser's and raises React's hydration error #418. Core's formats therefore write an instant
once the page has hydrated, and an empty text before; an app that renders only in the browser sees no
difference. A zone the application names would let the server write instants again. That is the "not
yet" above.

## Considered Options

- **A `validate` prop on every field.** The same rule twice.
- **A schema adapter.** One per library, and a foreign dependency.
- **The browser's constraint validation.** The pickers and the multi-select are
  not inputs.
- **A tile grid in core.** A layout editor, plus the foreign dependency such
  grids bring.
- **A `timeZone` on the provider now.** Built without a case, it would be built
  wrong.
- **"Never" for time zones.** A head office reading a remote plant is a real
  reader.

## Consequences

- ADR-0032 stays the page a reader opens; this one stands beside it on the site.
- Time zones leave "not yet" the day an application needs a zone other than the
  reader's, by an ADR that supersedes this entry.
- Validation needs no code.
