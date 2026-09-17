# Props are English, identifiers are German

Status: superseded by ADR-0018
Date:   2026-09

`CONTEXT.md` fixed two languages: identifiers German, prose English. It said
nothing about props, which are both — an identifier in the component's source
and an attribute in the caller's JSX. So each component decided alone. The Dock
and the command palette wrote "English outside" into their file headers; the
charts instruments, landing in the same month, chose German — `zustaende`,
`spurVon`, `hoehe`, `faerbung`, `ton`, `rolle`, `imBereich` — next to the
`strokeWidth`, `barWidth` and `markers` of the four original series. `Stat` and
`AlarmList` mixed the two inside one interface. Both choices were defensible.
Having both is not, because the next author has to choose again and the reader
has to guess.

**A component prop is English: its name and its literal values.** Inside the
component everything stays German, the way every other identifier is. The
boundary is the destructuring pattern: `{ states: zustaende }` is where one
language ends and the other begins.

The reason is where a prop is read. It sits in the caller's JSX next to
`className`, `disabled`, `aria-label` and `onChange` — next to HTML, which is
English — and a consumer reads props far more often than the library's source.
The existing surface had already voted: the original series, the whole form
layer and every inherited DOM attribute are English, and the German props are
the recent minority.

German outside was the alternative, and it has a real case: one language from
glossary to call site, no translation at the destructuring pattern, and the
German word is the one `CONTEXT.md` tells you to grep for. It was rejected
because it cannot be made consistent — `aria-*`, `on*` and every DOM prop stay
English whatever this library decides — so it would only move the seam from the
destructuring pattern into the middle of every props interface.

**The accessible name is spelled `aria-label` wherever the named element is the
component's root**, because that is the native spelling, it already arrives
through `...rest` on every component that spreads it, and a second spelling of
the same attribute is a second thing to know. `ariaLabel` survives only where
the named element is not the root — `Popover`, whose panel is portalled away
from where the component is written. `label` is not an accessible name: on
`Meter` it says what is measured and on `TableFilter` what is filtered, and
feeding the name from it is the component's business.

The alternatives were one camelCase `ariaLabel` everywhere, which is uniform but
fights `...rest` on every component that forwards it, and `label` everywhere,
which conflates a visible caption with an accessible name.

## Scope

Component props, and the string literals a prop takes directly
(`severity="warning"`). Not exported functions, hooks and the option objects
they take — `pareto`, `useBaum`, `meldeModell` read like the rest of the code
and stay German like any identifier. Not type names, and not the keys of an
object a prop takes (`origin={{ art: "vorgegeben", … }}`), which are a type's
fields. This line was drawn to keep the renames finite; if a hook's options or
an object-valued prop turn out to be read like props, it can be moved.

## Consequences

The renames are listed in `.scratch/library-audit/issues/09-the-renames.md`.
Each ships with the old name as a deprecated alias for one minor version and a
`Geändert` entry in the package's changelog, so an upgrade never breaks a
caller silently.

A new component does not choose. Its props are English; the German word from
the glossary appears one line below, in the destructuring pattern.

The seam costs a line per prop, and a prop whose English word differs from the
glossary's German one — `asOf` for `stand`, `severity` for `stufe` — has to be
looked up once. The glossary already carries both words for every term, which is
what makes the lookup possible.
