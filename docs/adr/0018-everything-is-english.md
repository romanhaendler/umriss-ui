# Everything is English

Status: accepted — supersedes ADR-0015
Date:   2026-09

ADR-0015 settled a real disagreement. `CONTEXT.md` had fixed two languages —
identifiers German, prose English — and said nothing about props, which are
both, so each component had decided alone: the Dock and the command palette
wrote "English outside" into their headers, the charts instruments landing in
the same month chose `zustaende`, `spurVon` and `faerbung`. ADR-0015 drew the
seam at the destructuring pattern, `{ states: zustaende }`, and the library
followed it.

**That decision is reversed. The workspace is English throughout**: identifiers,
file and directory names, comments, the long prose headers that carry the design
reasoning, the demo artefacts, and the text the library ships. Nothing stands on
the far side of ADR-0015's seam any more, so the seam goes with it.

Three things changed, none of which existed when ADR-0015 was written.

**The packages have their names.** The npm org `umriss-ui` has been secured, and
what stands after the scope is English: `@umriss-ui/core`, `@umriss-ui/table` and
`@umriss-ui/charts`. `umriss` is the library's proper name, not a word of its
vocabulary, and is not translated. A package whose names and props are English and whose
every internal identifier is German asks its reader to change language once a
line. That is the complaint ADR-0015 was written to settle, moved one level
inwards rather than answered.

**The audience is not German-speaking.** The library ships user-facing text by
design, and the register holding it was 562 lines of German whose own header
gave the reason: German was "die Voreinstellung und die einzige mitgelieferte
Sprache" because there was no second one. Published to that audience it
is a product defect and not a question of style. ADR-0019 records what replaced
it.

**Nothing has been published.** `@umriss-ui/core`, `@umriss-ui/charts` and
`@umriss-ui/table` all return 404 from the registry. There is no consumer to
break, no deprecation window to run and no alias to keep, so every cost this
change would normally carry is currently zero — and it will not be zero again.
Deprecated aliases are what ADR-0015 itself did for the prop renames, and they
were right there, because there were callers. Here they would buy nothing but a
cleanup ticket.

## What stands from ADR-0015

The spelling of the accessible name. `aria-label` wherever the named element is
the component's root, because that is the native spelling and it already arrives
through `...rest`; `ariaLabel` only where the named element is not the root, as
on `Popover`, whose panel is portalled away from where the component is written.
`label` is still not an accessible name.

ADR-0015 is superseded and kept, not deleted or rewritten. Its reasoning — why a
prop is read in the caller's JSX beside `className`, `disabled` and `onChange`,
and why German-outside could not be made consistent while `aria-*` and `on*`
stay English whatever this library decides — is what should stop a third reader
reopening the question. The German identifiers it quotes stay exactly as they
stand: they are quotation of what was, not references to anything live.

## Consequences

One thing stays German, and it is not a name this library chose: **the German
wording**, which is no longer the default but is still shipped — as freight a
caller now takes on purpose (ADR-0019).

## Amended: the two shapes did not stay

This decision first exempted two more things, each "a shape two parties agree on
rather than a word one party chose": the limit model's field names with their
`"warnung"`, `"oben"` and `"frisch"` literals, and `DateRange` as `{ von, bis }`
with `RangePreset` as `{ label, bereich }`. Both have since moved, and the
exemption was wrong in the same way twice.

What the argument actually establishes is **who has to move with a name** — for
the limit model, `core`, `charts`, the shared case table and the runtime
conformance test, in one commit; for the range, `core` and `@umriss-ui/table`.
It says nothing about whether the name may stay. And the thing it describes — a
field a caller has to type, a value that stands in the DOM and in a selector —
is the *first* place a second language shows, not a private corner where one
might be tolerated. Agreement is the reason to translate carefully, not the
reason not to.

The same mistake had been made once more, and in the same words: the dock's four
resting places `"oben"`, `"rechts"`, `"unten"`, `"links"` were kept because they
are public and stand in eight baseline file names. Public is why they had to go.

What remains true from the original reasoning is the discipline it implies. Each
of these sets moved with every consumer in a single commit, and the conformance
test stayed green at every boundary rather than being adjusted afterwards.

## Consequences for the baselines

Every screenshot baseline whose picture contains a word moves, because the
visible text changed. That is the purpose of the change and not a regression,
and the baselines are rebuilt with review rather than in bulk, which
`CONTEXT.md` forbids in any case.
