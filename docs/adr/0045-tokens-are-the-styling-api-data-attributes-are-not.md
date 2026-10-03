# Tokens are the styling API; data attributes are not

Status: accepted
Date:   2026-10

A developer who wanted umriss to look like their product could not see what
they were allowed to change. Core declares 116 `--u-…` tokens and the charts
29 `--uc-…` tokens; until the Theming page, none of them was listed, and 33
showed up on the site only inside example source. Beside them sit about 110
`data-*` attributes in the components' markup - 31 in core, 39 in the table,
21 in the schedule, 15 in the calculation, 4 in the charts - and seven of those
appeared on the site too, by the same accident. A developer who styles
`[data-verdict]` because it is the handle they found had no way of knowing whether
the next version keeps it (`.scratch/theming-and-wording-reference/spec.md`).

**The tokens are the public styling API; `data-*` attributes and class names
are internal.** The `--u-` tokens of core and the `--uc-` tokens of the charts,
every one listed on core's Theming page, change only with an entry in the
package's changelog: a renamed or removed token is a breaking change, a new one
a feature. The `data-*` attributes a component writes and the class names its
CSS modules generate carry state and structure for the library's own
stylesheets and tests; they may change in any version, a patch included, and
the site documents none of them. The Theming page says so in one sentence.

A wish to style something no token reaches is answered with a token - a new
one, or an existing one read in one more place - not with a documented
attribute or a stable class.

## Alternatives that were real

**Document the data attributes, as the headless libraries do.** Base UI and
Radix list `data-state`, `data-disabled`, `data-side` and their like on every
part, because a headless component has no other styling surface: the caller
writes all of its CSS, and the attributes are the contract that CSS is written
against. umriss is a styled 0.x system. Its attributes exist for its own
stylesheets - `data-verdict`, `data-place`, `data-edge` - and were named for what
the module needed that day; promising 110 of them would freeze the markup of
five packages for the sake of selectors nobody has asked for yet.

**A stable class per part** (`.u-button`, `.u-card-header`, the BEM surface of
Bootstrap or the `Mui…` classes). It invites exactly what the cascade layers
were built to make unnecessary: rules that win by specificity against the
library's own, which break when the library's rule gains a selector. A token
wins by the layer order whatever the specificity (ADR-0021).

**Say nothing and let usage decide.** It is the state this replaces: the
developer guesses from the markup, and the first rename is a silent break in
an application that did nothing wrong.

## Consequences

- The token table on the Theming page is generated from the stylesheets, and
  the build fails when a declared token has no row: the list a developer reads
  is the API, not a description of it.
- A change to a token is a changelog entry; a change to a `data-*` attribute or
  a class name is not, and no reviewer asks for one.
- The tests may keep selecting by `data-*` attributes: they are the library's
  own, and change with it.
- A region that needs a different look is themed by setting tokens on a
  container, and a token that names another (`--u-focus-ring` names the
  accent) is set there too: the Theming page says where that falls short.
- What the tokens cannot reach today - a component's inner spacing, its
  radius where it has none of its own - is a gap in the token set, filled when
  an application needs it, not a reason to publish a selector.
