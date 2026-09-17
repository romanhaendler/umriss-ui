# Two wordings ship, and English is the default

Status: accepted
Date:   2026-09

The wording is a register and not a translation call: every entry is named after
what it labels rather than after what it says, and a caller who omits one gets
the default instead of a key echoed back at a user. That much is unchanged and
is why the register survived becoming bilingual at all.

What the register claimed about language is what changed. Its header, and the
glossary entry beside it, said that German was the default and the only shipped
language, because there was no second one.

There is a second one now. **`DEFAULT_WORDING` is English, and it is what every
component renders without a provider. German ships as `GERMAN_WORDING` behind
the subpath export `@umriss-ui/core/wording/de`.**

## Why a subpath and not a named export

A named export from the main entry was the alternative. The subpath was chosen
because it says without explanation that this is freight you take on purpose. An
application that never imports it never pays for it; one that does has written
the language it wants into an import line, which is the first place the next
reader of that file looks. In the main barrel it would have been one more name
among a hundred — and the one name whose weight is a whole language most callers
will never render.

## The completeness guarantee is the type

Both objects are typed `Wording`. An entry added to the interface and forgotten
in either one is a compile error before it can become a missing label on a
screen. No test checks this and none should: it would only re-ask what `tsc`
already refuses, and it would be one more thing to maintain every time the
interface grows.

**The drift between the two is accepted.** Nothing can catch a German entry that
has come to say something other than its English counterpart. They are two
texts, not a translation of one another, and neither a type nor a test reaches
the meaning of a string. What is caught is the one failure that silently
degrades a screen — an entry that is not there at all. The rest is review, and
that is the price of shipping two.

One unit test per package mounts a component under the German wording and
asserts a single string. It is deliberately not a conformance check over the
register; it is a wire. It holds the subpath resolved from `core` itself and
from a consumer's import in `@umriss-ui/table`, so that a later entry, an alias
or a build configuration cannot break the export quietly. German is tested
rather than photographed a second time: the baselines stay English.

## Consequences

**A third language is an application's business.** The seam takes any object
typed `Wording`, entry by entry or whole, and the library neither selects a
language nor knows what one is. Two ship because the second was already written,
not because shipping languages is something this library does.

**The formats did not move.** They are a register of their own, and
`DEFAULT_FORMATS` writes dates, numbers and durations in `de-DE` whatever the
wording says. The mixture is visible — an English default wording over German
number notation renders "43 of 1.204" — and it is left standing here rather than
folded into this decision, because the locale of the formats is a decision about
a different object and deserves its own.
