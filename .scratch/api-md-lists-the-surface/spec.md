# `API.md` lists the surface

Status: ready-for-agent
Release: 0.57.0 (no break)

Takes from the map `.scratch/release-1-0/map.md`:
[The documents agree with the source](../release-1-0/issues/10-the-documents-agree-with-the-source.md)
(findings: `../release-1-0/research/10-the-documents-agree-with-the-source.md`, sections A and B7-B8) and
[What 1.0 promises](../release-1-0/issues/01-what-1-0-promises.md) (ADR-0083). The gaps per package stand in
the research files 04 (E1), 05 (A1-A2), 06 (D2), 07 (the head, points 1-4) and 08 (D2).

## Problem Statement

ADR-0083 makes a package's `API.md` the list of what `1.0.0` promises: every entry with its type and default.
The generated file cannot carry that. A reader who follows the rule "read `API.md` before saying what a
package can do" finds no props for `Table`, `Column`, `Action`, `Chart` and its ten parts, `Schedule` and its
parts, or `Dashboard`; no `exportAs`, no `TableRef.setFilter`, no `Scale.toPx`; no values for a union such as
`DependencyRoute`; 12 as the default size of every glyph where the code says 9, 10, 12 and 16; and no place
for what is `@experimental`. Beside it, an ADR's status stands twice, in the file and in the index, and
disagrees in sixteen.

## Solution

The generator writes the whole surface, and a guard keeps it whole:

- the props of a component a hook returns stand under that hook, as a table like any component's;
- a member written as a method is a member: in every table and in every bracketed member list;
- a union type shows its members;
- what is marked `@experimental` is listed apart, and a deprecated member stands last in its table;
- a glyph prints its own default size; a class is not filed under "Constants";
- an ADR's status is stated once as a fact and held equal wherever it is repeated.

No source of any library package changes its behaviour; only doc comments, the generator and the seven
regenerated `API.md` do.

## User Stories

1. As a caller, I want the props of `Table`, `Column` and `Action` in the table's `API.md`, so that I can
   write a table from that file alone.
2. As a caller, I want the props of `Chart`, the axes and the series parts in charts' `API.md`, so that I see
   `barWidth` or `timeZone` without opening the source.
3. As a caller, I want the props of `Schedule`, `Lane` and the other parts, and of `Dashboard`, for the same
   reason.
4. As a caller, I want `exportAs`, `setFilter`, the bulk action's `onSelect` and a scale's `toPx`, `fromPx`
   and `ticks` listed with their signatures, so that a member is not lost for how it was written.
5. As a caller, I want the values of a union (`"curve" | "straight" | "orthogonal"`) beside its name, so that
   I can write the option.
6. As a caller, I want everything `@experimental` under one heading, so that I know what a minor may change.
7. As a caller, I want a deprecated member last in its table, so that I read the current names first.
8. As a caller, I want each glyph's real default size, so that the printed number is the one I get.
9. As a maintainer, I want the generator's test to fail when a `*Props` type with members has no table, so
   that the gap cannot come back with the next hook.
10. As a maintainer, I want a test to fail when an ADR's status in the index differs from the file's, so that
    one fact stands once.
11. As an agent, I want the header of `API.md` to say what the file lists, so that I do not infer absence
    from what it never lists.

## Implementation Decisions

- **Where it changes.** The shared demo tooling (`@umriss-ui/demo`: the `API.md` writer, the syntax reader
  behind the props tables, the defaults reader). No library package's runtime source. The seven `API.md` are
  regenerated with `pnpm --filter @umriss-ui/<pkg> props`.
- **Returned components.** For a hook, every member of its returns whose type is a component (a function of
  one props type) gets a table `#### props of <Member> (<PropsType>)` under that hook, after the returns.
  The rule that a `*Props` type's members are left out of the "Types" index stays, and now holds: the writer
  itself fails (throws, so `props` and `check:site` fail) when an exported `*Props` type with members got no
  table. A props type that no component or hook reaches is tabled under a closing heading rather than dropped.
- **Methods.** The syntax reader keeps method signatures beside property signatures; a method prints as
  `name(parameters): result`. This reaches the demo's props tables as well, which is wanted. Index
  signatures stay out.
- **Unions.** A type alias whose body is a union prints its members after the sentence: literals as written,
  named types by name, an inline object member by its field names. Never cut to 80 characters.
- **`@experimental`.** Read like `@deprecated`. A marked export leaves its group and stands under
  `## Experimental`; a marked member stays in its table with `(experimental)` and is named again under that
  heading as `Type.member`. No source carries the mark in `0.57.0`; the fixture proves the path. The header
  line of `API.md` gains the sentence that the heading exists and what it means (ADR-0083).
- **Deprecated last.** Within a table, deprecated members follow the others, source order otherwise.
- **Glyphs.** Each glyph prints the default its own code applies. The shared `GlyphProps` comment no longer
  supplies a number that is wrong for most of them.
- **Classes.** A class is listed under a heading of its own ("Classes"), not under "Constants".
- **ADR status.** The fact is the `Status:` line of the ADR's file. The index (`docs/adr/README.md`) may
  repeat it, and a repo test holds the two equal, word for word after trimming. The sixteen that differ are
  set right in the file, taking the fuller of the two statements; the index's count of decisions goes.
- **Purity stays**: the same input gives the same bytes.

## Testing Decisions

- A good test hands the writer a small fixture source and reads the text it writes; it never reaches into
  the writer's helpers.
- The seam is the existing one: the writer's unit test with its fixtures in the demo package
  (`apiMd.test.ts`), the reader's (`propsReader.test.ts`). Each ticket adds a fixture case: a hook returning
  a component, a method member, a union alias, an `@experimental` export and member, a deprecated member, a
  class.
- The second seam is `pnpm check:site`: the checked-in `API.md` must equal the generated one.
- The ADR guard is a repo test beside the existing `*.repo.test.ts` in the demo package.
- No existing test is edited to make a change pass, except a snapshot-like expectation of the writer's
  output that the decided format changes; the worker names each such line in its report.

## Out of Scope

- Marking anything `@experimental` in a library package (specs 6-10).
- Types and defaults for the fields of plain interfaces in the "Types" index (names in brackets stay).
- A marker for `@experimental` on the demo site's tables.
- Missing `@default` doc tags in charts and elsewhere (spec 5, per package).
- `docs/llms-full.md`.

## Further Notes

Every later spec reads its change from `API.md`, so this one lands first and alone.
