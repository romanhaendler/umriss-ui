# Every export has a place on the site

Status: accepted
Date:   2026-10

A developer who needed a hook or a function could not read its signature
anywhere on the site. Of the 16 hooks and 91 functions the five packages
export, not one had its parameters and its return value on a page: what
`useToast` returns was learned from an example or the source, and the
schedule's editing model - `applyIntent`, `ripple`, `findings`, `snapTime` -
was named on its pages and defined on none. That was decided, not overlooked:
`demo-as-documentation` gave hooks and lib modules no pages, because they are
"a second piece of documentation with a different shape", and inventing that
shape then would have been one thing too many. The shape exists now. The
generator already emitted every export's declaration, JSDoc included, for the
llms appendix "The rest of the API" - for agents only, and only for what no
page named. A person on the site had no list of what a package exports at all
(`.scratch/api-index/spec.md`).

**Every name a package exports has exactly one canonical place on the site:
its component page, a props table, or its entry on the package's API index.**
The API index is one page per package at `/<package>/api/`, alone in the last
rubric of its sidebar, and it is **generated, never written**: from the
entries the package's build names, the main one and every subpath. It groups
the exports by what they are - Components, Hooks, Functions, Constants, Types,
then each subpath under its import path - alphabetical within a group. A
component with a page links there and copies none of its props; a hook, a
function, a constant and a component without a page show their JSDoc and their
declaration as the `.d.ts` has it, the library's types in it linked; a type
links to its table or is defined as "Types on this page" defines it. Each entry
names the pages that use it. Values are anchored at `#<name>`, types at
`#type-<Name>`.

**Every export carries JSDoc, and the gate says so.** The gate that stops at a
prop without a comment stops at an export without one: the index never shows a
bare signature.

**The llms appendix goes.** The index is a page of the outline, so its text is
in `llms-full` and its Markdown twin like every page's, and the completeness
guard - every export appears in the text - holds through it.

## Alternatives that were real

**Hand-written hook pages, as Mantine has them.** A page for `useToast`, one
for `useTree`, prose and examples around each. It is the shape that explains
best, and the one that drifts first: 107 hooks and functions, each a page
someone must remember to write when the export appears and to fix when its
signature changes. A hook whose use needs explaining is explained on the
component page that uses it, as today.

**A page per export, TypeDoc-style.** Every name its own address. Some three
hundred and fifty pages of mostly one signature each, a sidebar no reader can
scan, and a search that finds the page but not the neighbourhood. One page per
package keeps the whole surface in view; its on-this-page list names the
groups, and the search reaches every entry.

**Keep the appendix, for agents only.** It was there and cost nothing. But it
listed only what no page named - exactly the names a reader came looking for
after seeing them on a page - and a person never saw it.

## Consequences

- A new export is documented the moment it carries a comment: the index
  lists it without anyone editing an outline.
- The gate grows by one class: an export without JSDoc fails `props`, and so
  `dev`, `build:demo` and `typecheck`.
- The built site's guard checks that every name of every entry has an element
  with its anchor on its package's index; a page that loses one fails the
  build.
- Core's index is long - some two hundred and fifty entries. Its on-this-page
  list holds the groups, not the entries.
- A constant shows its type, never its value: a 288-entry wording object
  would fill the page. Where a constant is a wording or a format directory,
  the index points at the table that explains its values.
- The index is not photographed: its content is text, which the guards hold.
