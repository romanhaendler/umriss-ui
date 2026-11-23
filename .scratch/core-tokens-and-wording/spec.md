# Core, tokens and wording

Status: ready-for-agent
Release: 0.58.0 (the candidate)

Takes from the map `.scratch/release-1-0/map.md`:
[What of core's surface changes before 1.0](../release-1-0/issues/16-what-of-cores-surface-changes-before-1-0.md)
(findings `../release-1-0/research/04-the-surface-of-core.md`, by the letters in brackets),
[What of the tokens and the wording changes before 1.0](../release-1-0/issues/20-what-of-the-tokens-and-the-wording-changes-before-1-0.md)
(findings `../release-1-0/research/09-tokens-and-wording.md`, by T and W numbers) and
[The acceptance criteria](../release-1-0/issues/03-the-acceptance-criteria.md) (condition 7; findings
`../release-1-0/research/12-accessibility-and-browsers-claimed-and-checked.md`).
The mechanism of a rename is ADR-0066; what `1.0.0` promises is ADR-0083.

## Problem Statement

Core's surface is about to be frozen, and it still says the same thing in two ways: density has two words,
a meter shows a "label" that is its value, the command palette "chooses" where everything else "selects", a
menu item's quiet tone is "default" where every other component says "neutral", four type names are too
plain to stand beside those of other packages. `Wording` must be handed in whole, so every new key would
break a translator. A cross that is called `clearable` does not clear an uncontrolled field's report. Six
exports are internals. What sizes with the text is partly px, so an application with a larger root font
gets type that grows inside spacing that does not. The muted text misses 4.5:1 on its surface.

## Solution

One minor, the candidate, carries every decided change of core. A caller moves at its own pace: each
renamed prop, value, type and token keeps its old name for this minor and warns once in development; each
change that cannot keep an old form stands under "Changed" with a migration line. After it the surface is
what `API.md`, the token list and the wording keys say, and `1.0.0` only drops the old names.

## User Stories

1. As a caller, I want `density` to be `"regular" | "compact"` in core as in the table, the calculation and
   the alarms, so that I pass one value through my application.
2. As a caller, I want `useDensity()` to tell me when nobody set a density, so that my component can keep
   its own default.
3. As a translator, I want to hand in only the keys I override, so that a new key in a minor does not break
   my build.
4. As a caller, I want the cross of a `clearable` field to clear it and report through `onValueChange`,
   controlled or not, so that I wire one callback.
5. As a caller, I want `showValue`, `onSelect` and the tone `"neutral"`, so that the same thing has the same
   name on every component.
6. As a caller, I want `TreeKey`, `LimitSide`, `TreeDirection` and `PopoverAlign`, so that an import beside
   another package's `Key` or `Side` does not collide.
7. As a caller, I want my old names to keep working for this minor with a warning that names the new one,
   so that I migrate file by file.
8. As a caller, I want `Input`, `Textarea` and `Select` to say what value they take, so that `null` means
   "no value" by type.
9. As a caller, I want what may still change marked `@experimental`, so that I know what a minor can move.
10. As a caller with a root font that is not 16px, I want spacing, icons and the widths of modal, drawer
    and toast to grow with the text.
11. As a caller who themes, I want the token list to say which tokens are measures and how a new token is
    named.
12. As a reader with low vision, I want muted text at 4.5:1 on every surface it stands on.
13. As the maintainer, I want to see the muted text before and after, on every demo, before it reaches
    `main`.

## Implementation Decisions

- **A rename keeps its old name for this minor** (ADR-0066): the old prop, value, type or export is marked
  `@deprecated since 0.58 - use <new>.`, stands last, works exactly as before, and warns once in development
  through core's existing `warnDeprecated*`. `check:dist` holds the marker's form. A renamed token keeps its
  old name as an alias in the tokens layer, as the existing alias test expects. Every internal caller in the
  seven packages and their demos moves to the new name in the same ticket, so that umriss itself warns
  nowhere.
- **Density** (A1): core's `Density` is `"regular" | "compact"`; `"comfortable"` is accepted for this minor
  as the old word for `"regular"` and warns. `useDensity()` returns `undefined` where no provider or parent
  set one; the components that read it apply their own default as before, so nothing looks different. The
  packages that mapped core's word to their own drop the mapping. `CONTEXT.md`'s entry follows.
- **`Wording`** (D4, C5): the interface stays one; what a caller hands in (`UmrissProvider`'s language, a
  component's own `wording` where one exists) is typed `Partial<Wording>` and merged over the default.
  umriss's own language files stay complete, held by their existing tests. ADR-0019 gets the sentence, and
  the seventeen joined sentences as a known limit (W7). **`qualityGood` goes** (W8): removed from the
  interface and both language files, under "Changed".
- **Six exports go** (D1): `hasWarned`, `mergeLanguage`, `scrollForRow`, `RowPlacement`, `WindowInput`,
  `PressPoint` leave the index; whatever inside the workspace imports them from the index imports from the
  module. A removal stands under "Changed" with its line; no alias.
- **`clearable`** (B1): on `Input`, `Select` and `TreeSearch` the cross clears the field, controlled or not,
  and reports the empty value through `onValueChange`. `onClear` keeps working for this minor (called as
  well, with a warning).
- **Names** (A2 to A5): `showLabel` to `showValue` on `Meter` and `ProgressBar`; `CommandPalette.onChoose`
  to `onSelect`; `MenuItem`'s tone `"default"` to `"neutral"`; the types `Key` to `TreeKey`, `Side` to
  `LimitSide`, `Direction` to `TreeDirection`, `Align` to `PopoverAlign`. Old and new both work; where both
  are given the new one wins.
- **Narrower values** (C1, C2): `Input` and `Textarea` take `string | null` as value; `Select` gives up the
  native `multiple` and its value is `T | null`. No old form can be kept: "Changed", with migration lines.
  The worker reads the finding for the exact present types before changing them, and reports any caller in
  the workspace that relied on the wider form.
- **`@experimental`** (E5, D2): `revealCount` in `useTree`'s return; `Popover`'s `focusRef`, `insideRefs`,
  `closeOnTabOut`, `onBlur`. Marked in the doc comment; `API.md` lists them apart.
- **Tokens** (T2, T4, T5, T6, D5): the space scale `--u-space-1..8`, the icon sizes, the buttons' paddings
  and the widths of modal, drawer and toast are rem, each equal to its px value at a 16px root; radii,
  hairlines and hit areas stay px. `--u-control-height-xs` goes. `--u-shadow-sticky` becomes
  `--u-color-shadow-sticky` and `--u-color-edge-hover` becomes `--u-edge-color-hover`, each with its alias.
  The design language names the measures (39 in core, 6 in charts, 3 in the dashboard, the table's two
  factors: section 3 of the findings), says that fonts, tracking, weights and `--u-transform-caps` are not
  measures, writes down the scheme for a new token's name, and lists the dashboard's three tokens and
  `--u-chart-1..6` with the tokens.
- **The muted text** (condition 7): the muted text token reaches 4.5:1 against every surface it stands on,
  light and dark, and the list of tolerated colour pairs in the accessibility check is empty. The change is
  made on its own commit, last, and is **not merged until the maintainer has seen the screenshots before
  and after**; `CONTRIBUTING.md` and the README's accessibility paragraph then say the list is empty.

## Testing Decisions

- A good test renders the component through its props and reads what a user or a caller gets; it does not
  reach into the module.
- Each rename gets a case at the component's existing unit test: the new name works, the old name works
  and warns once, the new one wins where both stand. Prior art: the tests of the earlier renames that
  ADR-0066 names, and `warnDeprecated*`'s own.
- `clearable`: controlled and uncontrolled, `onValueChange` called once with the empty value.
- Types: the packages' `*.test-d.tsx` files hold the narrowed values and that `Partial<Wording>` is
  accepted and a complete one still is.
- Tokens: the existing alias test and the stylesheet guards in core (`stylesheets.test.ts`); a test that
  every rem token equals its former px value at 16px. The full visual suite must show **no** difference at a
  16px root for the rem ticket; any is a defect.
- The muted text: the axe specs with an empty tolerated list, and the full visual suite, whose every changed
  baseline is the before-and-after the maintainer sees.
- An existing expectation changes only where this spec decides the behaviour changes; the worker lists each.

## Out of Scope

- The table, charts, the schedule and the young packages' own changes (specs 7 to 10); they follow
  density's word and `Wording`'s shape after this spec is in.
- A controlled `Menu`; keys that let a language reorder the joined sentences; a wording per package.
- Removing any old name (that is `1.0.0`).

## Further Notes

Blast radius: the renames touch call sites in all seven packages and their demos. Each is sequenced as
expand (the new name beside the old), migrate (the workspace's own callers, by script where one rule covers
many files), and at `1.0.0` contract.
