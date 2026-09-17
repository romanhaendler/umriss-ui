# The formats are English, and German is freight

Status: accepted
Date:   2026-09

ADR-0019 made the wording English and left a sentence standing that has been
read as an open question ever since: *"The formats did not move. They are a
register of their own, and `DEFAULT_FORMATS` writes dates, numbers and
durations in `de-DE` whatever the wording says … the locale of the formats is a
decision about a different object and deserves its own."* This is that
decision.

**`DEFAULT_FORMATS` is English (`en-GB`), and the German formats ship as
`GERMAN_FORMATS` behind `@umriss-ui/core/wording/de`** — the subpath that
already carries the German wording, so that a German application takes both
halves of its language in one import line.

The mixture ADR-0019 accepted was visible in every demo: an English library
writing "43 of 1.204" and labelling a chart's axis 17.03.2026. It is not a
defect of either register but of the pair, and the pair is what a reader sees.

## Why `en-GB` and not `en-US`

**The clock.** A plant screen that writes 3 pm where 15:00 was meant is read
wrongly once and distrusted afterwards; `en-US` writes it that way by default.
The 24-hour clock is set explicitly all the same (`hourCycle: "h23"`), because
the clock is this product's decision and not the locale's — the German set
writes it identically, and always did.

**The date order.** `17/03/2026` keeps the day first, as `17.03.2026` did. An
American order would have swapped two numbers in every operations screen that
exists, which is the one change no reader notices until it is wrong.

## What follows for a caller

A caller who wants German writes one line more than before:

```tsx
import { GERMAN_WORDING, GERMAN_FORMATS } from "@umriss-ui/core/wording/de";

<UmrissProvider language={{ wording: GERMAN_WORDING, formats: GERMAN_FORMATS }}>
```

Nothing else moves: `Formats` is unchanged as a type, an application may still
replace single entries, and every component goes on reading `useFormats()`.

## The number field reads what it writes

`NumberInput` parsed German notation by hand — a dot was a thousands separator,
a comma the decimal point. Under an English default it would have read its own
output wrongly, which is worse than writing the wrong comma. The separators are
therefore no longer declared anywhere but **measured** off the formats
(`separatorsOf`): one number with one decimal place, digits struck out, and what
remains is the notation's punctuation. That also holds for an application that
replaced `number` with something the library has never seen.

## What deliberately did not move

**The CSV export of `@umriss-ui/table`** keeps its decimal comma and its
semicolon. It is a machine format for a spreadsheet, argued at its site
(`model/csv.ts`), and it never read the display formats; an English default
says nothing about which dialect of CSV a spreadsheet expects. Whether that
should follow the locale too is a question about a third object, and it is left
open here on purpose — as ADR-0019 left this one.

**The German test fixtures** that measure a property *of* German stay German
(`docs/testing.md`, "German that is the subject and not a leftover"): a test
that shows German collation files Ä with A checks nothing in English.

## Consequences

- Every picture that shows a date, a time or a grouped number moved once, in
  all four demos. The delivery states the count
  (`.scratch/schedule-legibility/issues/01-english-formats.md`).
- The characterisation test of the formats was rewritten once and now pins both
  sets against one fixed instant. That file is the only place where this change
  is visible as a diff rather than as a surprise in some component's test.
- A German application now depends on the subpath for its notation as well. It
  was already depending on it for its words.
