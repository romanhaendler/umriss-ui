# Tokens and wording as surface - findings

Ticket: `issues/09-tokens-and-wording.md`. Read-only research at `553b4bd0`+worktree; nothing decided.
Sources: `packages/core/src/styles/tokens.css`, `touch-scale.css`, `packages/charts/src/styles/charts.css`,
`packages/core/src/lib/language/{wording,de}.ts`, `packages/charts/src/wording/{index,de}.ts`, every package's
`src`, `scripts/styles/own.module.css`, `docs/design-language.md`, ADR-0019, 0031, 0045, 0070, 0079.
Counts come from small scripts (regex over the sources; parsers for the two wording interfaces), so a count
is exact for what the pattern matches and says so where it is a lower bound.

"Breaks a caller" below means: the fix changes something an application may have written (a token name, a
wording key, a value it relied on). Marked **[BREAKS]**.

## 1. Counts

| What | Count |
|---|---|
| Core tokens declared on `:root` in `umriss.tokens` (`--u-*`) | 130 (ADR-0045 said 116) |
| Charts tokens declared on the chart root (`--uc-*`) | 33 (ADR-0045 said 29) |
| Core tokens no module, script or rule reads | 0 (one, `--u-duration-press`, is read only through `--u-transition-press`) |
| Charts tokens no rule reads | 0 (`--uc-series-1..6` are read by name built in `theme.ts:163`, `--uc-color-ok` at `theme.ts:172`) |
| Core tokens with exactly one reading stylesheet | 38 (11 with two, 80 with three or more) |
| Tokens declared, whose name is in `docs/design-language.md` | 19 of 163 (all 19 exist; none stale) |
| Tokens named in `docs/`, ADRs, READMEs or demo pages but declared nowhere and used nowhere in `src` | 0 live (the hits are `docs/journal.md`, frozen, and ADR-0079's rejected alternative `--u-touch-control-height`) |
| `--u-*` names read by `var()` but declared in no token sheet | 21 matches, 20 real names, see 2.1 |
| Deprecated tokens alive | 0. `warnDeprecatedTokens` exists in `core/src/lib/dev.ts:110` and `charts/src/dev.ts:100` and is called from nowhere in `src`; no `@deprecated` tag in any `src` |
| Core tokens in `px` / in `rem` | 31 / 11 (text sizes, `label-width`, three control heights are rem; space, radius, icon, button padding, widths are px) |
| `var(--u-space-N)` reads | 574 (452 in the stylesheets of the seven packages) |
| Literal px in padding, margin, gap or inset that equal a space step (outside `calc` chains and the demo) | 6 sites: Modal `24px` x4 (inside `max(..., env(safe-area-inset-*))`), ColorPicker `gap: 4px`, CommandPalette `padding: 0 4px`, Table `margin-right: 4px` x2 |
| Literal `font-size` where no token has the value | 2: `0.71875rem` in `DataViz.module.css` and `NumberInput.module.css` (core has `--u-text-xs` 0.6875rem and `-sm` 0.8125rem; 0.71875rem is `--uc-size-tick`'s value) |
| Literal colours in the packages' module stylesheets | 0 |
| Wording keys of core's `Wording` | 443 (312 text, 131 functions) |
| German keys (`GERMAN_WORDING`) | 443; in interface not German: 0; German not in interface: 0 |
| Charts' `ChartsWording` keys / German keys | 36 / 36, none missing either way |
| Keys that equal in English and German | core 20, charts 4; each checked, all legitimate (symbols, "Esc", "Hex", "Minimum", "Alarm", "n", "Median") |
| Core wording keys named in no package source | 1: `qualityGood` |
| Keys by area (first word) | alarm 51, dashboard 47, schedule 31, calculation 24, color 23, date 12, palette 11, filter 10, footer 10, rest below 10 each |
| Sites that build a sentence by joining a wording text with other text (lower bound, regex) | 17 in 9 files, listed in 3.3 |
| German identifiers in the interface (parameter names) | 7: `beschriftung`, `gewaehlt`, `feld`, `teile`, `versatz`, `aktion`, `betrag` |

German coverage is complete by construction: `GERMAN_WORDING` and `GERMAN_CHARTS_WORDING` are typed as the
full interface, so a forgotten key is a compile error (`de.ts` head comment, ADR-0019). Table, schedule,
calculation, dashboard and alarms have no wording of their own: their 153+ texts live in core's `Wording`
(each package's `wordingGuard` test checks no German word is hardcoded). Only the charts have a separate
register (ADR-0031).

## 2. Tokens

### 2.1 Findings

**T1. `--u-color-border` is read and never declared.** `packages/alarms/src/AlarmBanner.module.css:12`
(`border: 1px solid var(--u-color-border)`). No sheet, doc or test declares it. A `var()` with no value and no
fallback makes the declaration invalid at computed-value time, so the shorthand falls back to its initial
values: the banner most likely has no border at all. Why at 1.0: it is a bug, not a surface; the fix costs no
major. Smallest change: read `--u-edge` as a box-shadow or `--u-edge-color` as the border colour, as the other
components do. Size S. Not breaking (the banner gains the edge it was written to have; check by screenshot).

**T2. Three package hooks sit in core's `--u-` namespace and are on no Theming list.**
`--u-dashboard-row` (default `round(max(50px, 3.125rem), 1px)`), `--u-dashboard-gap` (12px),
`--u-dashboard-max-width` (1560px), read at `packages/dashboard/src/Dashboard.module.css:22,23,42,149`. They are
real hooks (the dashboard's changelog names them) but ADR-0045's table is generated from core's and the
charts' sheets only (`packages/demo/src/tooling/tokens.ts`), so these three are a promise nobody can read.
And ADR-0045 says the `--u-` tokens "of core" are the API. Smallest change: declare them in the dashboard's
own stylesheet on its root and add the dashboard to the generated table (as the charts are), or decide they
are not API and rename them to `--_`. Size S-M. Keeping the names is not breaking; renaming is **[BREAKS]**
for whoever set them.

**T3. Eleven internal custom properties use the public prefix.** The table writes `--u-table-pin-start`,
`-end`, `-pin-start-N`, `-pin-end-N`, `--u-table-view`, `--u-table-head`, `--u-table-head-group-row`,
`--u-table-group-header` (inline, from `scrollArea.tsx:51-98`, `frameEffects.ts:28-32`, `pinned.ts`) and
`--u-header-level(s)` (`frame.tsx:300`, `groupLines.tsx:314`). They are measurements the table sets on itself,
not tokens, but they look like tokens, collide with ADR-0045's rule ("every `--u-` token is listed") and the
table's own `--_table-*` convention shows the private spelling. Smallest change: rename to `--_table-*`
(inline styles can carry them). Size S. Not breaking unless an application read them (no doc names them).

**T4. The chart palette `--u-chart-1..6` is a documented hook that core does not declare.**
`charts.css:1-5` says so; `core/README.md:212-217` shows a brand file that sets them; `charts.css:41-46` reads
them with literal fallbacks. It works, but it is the one token family with a `--u-` name and no declaration,
so ADR-0045's "the build fails when a declared token has no row" cannot see it. Why at 1.0: renaming later is
a break. Smallest change: leave the names, say in ADR-0045's amendment that the family is declared by the
charts' README, or declare empty in core. Size S. Keeping: not breaking.

**T5. The names follow no single scheme.** Core: `--u-edge-color`, `--u-edge-color-strong` (colour last) but
`--u-color-edge-hover` (colour first), `--u-focus-row-color` (colour last), `--u-hairline`,
`--u-hairline-strong` (no word for colour at all), and `--u-shadow-sticky` which holds a colour, not a shadow.
`--u-text-xs..2xl` and `--u-text-mono` are font sizes while `--u-color-text*` are colours and `--u-label-size`
and `--u-icon-size` put "size" last. `--u-color-primary-bg/-fg` but `--u-color-on-accent/-danger/-priority`
for the same job (type on a fill). `--u-color-accent` has `-hover`, `-subtle`, `-subtle-pressed`, `-text`,
`-on-`; `success` and `warning` have only `-subtle`. Charts: `--uc-color-alarm`/`-ok` take core's `danger`/
`success`; `--uc-radius-chip`, `--uc-fade`, `--uc-silhouette`, `--uc-transition-state` against
`--uc-transition` are named for the module that needed them (the ADR-0045 text itself says so of data
attributes). Why at 1.0: every one is a rename later, **[BREAKS]** every application that set it (counting
needs a caller; inside the repo the README brand file and `docs` set a handful). Smallest change: do not
rename wholesale. Decide the scheme for new names, rename only the three that are plain wrong
(`--u-shadow-sticky` to `--u-color-shadow-sticky`, `--u-color-edge-hover` next to its siblings, `--u-focus-row-color`),
list the rest as "frozen as they stand". Size M for the three, S for a policy sentence. **[BREAKS]**.

**T6. Space tokens are px; the type and control tokens are rem.** See section 4.

**T7. Values written out where a token exists or is missing.** Six px literals equal to a space step (counts
above); two font sizes of 0.71875rem that equal no core token, the same value as the charts' tick size
(`--uc-size-tick`), so a step between `--u-text-xs` and `--u-text-sm` is in use and unnamed. Smallest change:
the space sites become `var(--u-space-1)`/`--u-space-6` (the Modal's `max(var(--u-space-6), env(...))`);
the font size either becomes a token or is declared the design (`--u-text-2xs`, M, a feature, not a break). S.
Not breaking.

**T8. ADR-0045's numbers and promise are stale.** It says 116 and 29 tokens; they are 130 and 33. Its promise
"a renamed or removed token is a breaking change, a new one a feature" is correct for 1.0 and needs one
sentence more: a changed value is allowed in a minor except for the measures (section 3). Size S, docs.

**T9. `Layout`'s `gap` prop is typed by the space step numbers 1 to 8** (`Layout.tsx:7,10,22,33,77`), so the
step names `--u-space-1..8` are API twice: as token names and as the numbers a caller writes in `gap={3}`.
A ninth step is a minor; renumbering, e.g. a rem scale named by size, is **[BREAKS]**. Size S (only a
statement).

### 2.2 What is sound

- No token is dead; no documented token is missing; no token is deprecated; `design-language.md` names none
  that is gone.
- The generated Theming table fails the build on an undocumented declared core or charts token
  (`packages/demo/src/tooling/tokens.ts`, `tokens.test.ts`), so drift cannot start from those two sheets.
- Literal colours do not occur in module stylesheets (0); colours and measures flow from the two sheets.
- The deprecation mechanism (`warnDeprecatedTokens`) is in place for the first rename, though unused.

## 3. Measures a layout hangs on (change only in a major from 1.0)

A token counts as a measure when a caller's layout depends on its value: a box's size, the room between boxes,
the width a column or sheet takes, or the layering. Everything else (a colour, a shadow, a radius, a motion
duration, a weight) may change in a minor. Classified from the readers, not from the names.

**Measures, core: 39 tokens**

| Group | Tokens | Why a layout hangs on it |
|---|---|---|
| Space scale (8) | `--u-space-1..8` | 574 reads; `Stack`/`Grid` `gap` is typed by the step (T9); the table row pitch uses `space-1`/`space-2` (`Table.module.css:118-119`, `fit.ts:65`) |
| Control heights (3) | `--u-control-height`, `-sm`, `-xs` | every field and button; the table's compact row pitch is `max(line + 2 pad, control-height-sm + 2 space-1) + 1px`; `touch-scale.css` overrides the first two |
| Type sizes (8) | `--u-text-xs`, `-sm`, `-md`, `-lg`, `-xl`, `-2xl`, `--u-text-mono`, `--u-label-size` | the table's row line is `1.46 x --u-text-sm` rounded up (`Table.module.css:108-116`, the virtual-scroll row height follows); label and field heights |
| Leading (3) | `--u-leading-none`, `-tight`, `-normal` | a box as tall as its type; Checkbox/RadioGroup alignment arithmetic reads `leading-tight` |
| Icon and button (4) | `--u-icon-size`, `-sm`, `--u-button-padding`, `-sm` | button width and height |
| Widths and insets (10) | `--u-label-width`, `--u-drawer-width`, `--u-modal-width-sm/-md/-lg`, `--u-toast-width`, `--u-toast-inset-top/-bottom/-start/-end` | the columns and sheets an application sizes around |
| Layering (3) | `--u-z-popover`, `--u-z-toast`, `--u-z-tooltip` | an application's own z-indexes are chosen against 900/1000/1100 |

**Measures, other packages: 9 tokens.** Charts: `--uc-size-tick`, `-title`, `-legend`, `-tooltip` and
`--uc-leading-label`, `-text` (the tick size is read in JS, `theme.ts:90`, to measure the axis, so it moves the
plot rectangle; the others move label boxes). Dashboard: `--u-dashboard-row`, `-gap`, `-max-width` (T2).

**Grey zone, change in a minor but with a changelog line:** `--u-font-sans`/`-mono` (text widths and wraps),
`--u-tracking-*` (4), `--u-weight-*` (3), `--u-transform-caps`. They change widths, not boxes; decide.

**Not measures:** all colours, edges, shadows, radii (6), focus ring, material blur and scrim, easings, durations
and delays (motion only), `--uc-font*`.

The table has **no row-height token**; its pitch is derived (a private `--_table-pitch`). So the measure
that matters most to a caller, the row height, is frozen only through the five tokens it is derived from
(`--u-text-sm`, `--u-text-xs`, `--u-space-1`, `--u-space-2`, `--u-control-height-sm`) and the factors 1.46
and 1.63 in the stylesheet. A later change to those factors is a major by the same rule; say so in the ADR.

## 4. Do the space tokens follow the root font size? (`.scratch/straighten-0-49/spec.md:301-302`)

**Today: no.** `--u-space-1..8` are `4px 8px 12px 16px 20px 24px 32px 40px` (`tokens.css:187-194`). They stay
the same at any root font size or text zoom. The tokens beside them do follow it: the six type sizes, the
mono size, `--u-label-width` and the three control heights are rem (11 tokens), and the table line and pitch
are computed from rem tokens ("It grows with the type tokens and the reader's root font size",
`Table.module.css`). So at a 20px root the row's text and the controls grow 25% and the row padding
(`space-2`, 8px) does not: the mix the straighten spec records. The same px stands for the radii (6), the
icon sizes, button padding, modal, drawer and toast widths (31 px tokens in all, 12 of them lengths a layout
uses). The charts' sizes are rem (`--uc-size-*`) and `theme.ts:91` converts them with the root size.
`touch-scale.css` writes the control heights in rem on purpose ("so they follow the root font size").

**What changing it after 1.0 costs.** Writing `--u-space-1: 0.25rem` and the rest is identical at the 16px
default and different at every other root:

- An application that sets `html { font-size: 62.5% }` (a common idiom, 10px root) would see all 574
  space reads shrink to 62.5%; one at 14px, 87.5%; one at 20px, 125%. Row heights, toolbar gaps and card
  paddings move in all of them. That is a layout change for every such caller: **it is a major by the rule
  just made**, not a minor, however innocent the 16px diff looks.
- Visual baselines are taken at 16px, so no test fails; the cost is silent.
- The `gap` step numbers stay valid (T9), so no code changes in callers; only pixels move.
- The reverse, rem now and px later, has the same cost.
- Mixed solutions (rem for `space-*`, px for radii, widths) leave the system with three rules instead of
  two; the straighten spec's remark that row padding "grows with the controls but not with the root font"
  is exactly this mixed state.
- Hit areas (24 x 24 px, WCAG 2.5.8) are in px by design and do not move either way.

**So it is cheaper to decide before 1.0**: one line per token in `tokens.css` plus the `calc` sites that add a px
literal to a step (`Select.module.css`, `Table.module.css`, two in the demo), no API change, plus a migration line ("the space
scale follows the root font size; at a 16px root nothing moves"). Whichever way it is decided, say it in
ADR-0045's amendment, and say it for the rest of the px tokens (widths, icons, radii). Size S to change;
**[BREAKS]** layouts of callers with a root other than 16px.

## 5. Wording

### 5.1 Findings

**W1. One required-key interface is frozen at 443 keys.** Callers pass `Partial` (`index.tsx:32`), so adding a
key is non-breaking for them, and `useWording()` returns the full object, so reading is safe. A caller who
writes a complete `Wording` object (`const w: Wording = {...}`, the documented "hand in a whole object") gets a
compile error with every added key, and 1.0's promise ("a new key is a minor") would be false for them.
Smallest change: decide and write down, either "a whole-object caller spreads `DEFAULT_WORDING`" or type the
public input `Partial<Wording>` only (it already is) and keep `Wording` read-only. Size S, a policy sentence in
ADR-0019. Not breaking now.

**W2. Keys are prefixed by package for the four young packages and unprefixed for the table.** 153 keys carry
`alarm`/`dashboard`/`schedule`/`calculation`; the table's and core's keys do not: `rows`, `columns`, `fit`,
`entries`, `target`, `show`, `hide`, `options`, `today`, `now`, `days`, `grouping`, `filterColumn` all sit
beside `exportLabel`, `tableSearchLabel` and `tableSelectedCount` (only three table keys carry `table`). A word
like `entries` or `target` reads as core's but is the table's or the stat's. Why at 1.0: renaming is
**[BREAKS]** for every application that overrides it (the German wording ships all of them). Smallest change:
freeze as is and say in the contributor docs that new keys of a package carry its prefix; or prefix the
table's ~110 keys (L, breaking). Recommended for the maintainer: freeze.

**W3. The same action has two verbs.** `foldGroup`/`unfoldGroup`/`foldBranch`/`unfoldBranch`/`foldAll`/
`unfoldAll`/`scheduleFoldGroup`/`breadcrumbFolded` against `expandRowNamed`/`collapseRowNamed`
(`row.tsx:192`); `groupFolded`/`groupOpened`; also `remove`, `removeTag`, `removeFile` against `clearInput`,
`clearSelection`, `dateClear`, `clear`. Names only; the texts need not agree. Smallest change: rename
`expandRowNamed`/`collapseRowNamed` to `unfoldRow`/`foldRow` (or the reverse), **[BREAKS]**, size S for two
keys; leave the clear/remove pairs (the distinction is real: clear empties, remove takes one away).

**W4. `Named` and `Many` suffixes are inconsistent.** `expandRowNamed`, `collapseRowNamed`,
`removeConditionNamed`, `editConditionNamed` carry `Named` for "a label is passed"; `filterColumn(label)`,
`selectRow(name)`, `pinColumnToStart(label)` take a label with no suffix. `Many` marks the plural form in
`alarmAcknowledgeMany`, `alarmSnoozeMany`, `alarmUnsnoozeMany` where `entries` and `selectedCount` take the
count in a function. Smallest change: none needed for 1.0 beyond freezing; the four `Named` keys are the
only suffix of their kind. **[BREAKS]** if renamed. Size S.

**W5. Schedule repeats the charts' wording.** `scheduleShowData`/`scheduleHideData`/`scheduleTableCaption`/
`scheduleVisibleRange`/`scheduleRoleDescription` mirror `ChartsWording.showData`/`hideData`/`tableCaption`/
`visibleRange`/`roleDescription`: two registers, two German texts, two override points for the same sentences
(the schedule is built on the charts, ADR-0022). A caller who wants both in the same words sets both.
Smallest change: let the schedule read the charts' register for those five, or document that they are two.
Size M to share, **[BREAKS]** for callers who set the schedule's. Frozen as it stands costs nothing at 1.0.

**W6. Seven parameter names are German** (`beschriftung` `wording.ts:56`, `gewaehlt` :61, `teile` :225, `feld`
:208-209, `versatz` :235-236, `aktion` :344, `betrag` :492-493) in an interface otherwise English by ADR-0018.
Parameter names are not API (a caller's function names its own), so renaming is **not breaking**. Size S.
Take it before 1.0: it is the last German in the identifiers of the type.

**W7. Texts are built by joining in 17 places**, so the order and the separators are the library's, not the
language's (the point of "parameterised entries are functions", `wording.ts:17-19`). Sites: Toast
`Toast.tsx:432` (`${closeToast}: ${title}`), Schedule `Schedule.tsx:556` (`${fold}: ${label}`) and `:717`
(summary + zone + key help), `ScheduleTooltip.tsx:29,36,71,99,100`, schedule `DataTable.tsx:88-89`,
`AlarmBanner.tsx:77,100`, `calculation/present.ts:195,226`, `table/headFoot.tsx:204,216` (`(${...})`),
`table/toolbar.tsx:123` (`${label} (${ofSelected})`), `rowlessParts.tsx:503` (the export file name from a
wording plus an extension). German reads fine in all today; a language with another order or no space cannot reorder. Why at 1.0: moving a join into a key adds keys
(minor) and removes none, so it is **not breaking** unless the old key's meaning changes (`closeToast` becomes
a function), which is **[BREAKS]**. Smallest change: leave; list the 17 as known limits in ADR-0019. Size
S to document, M to fix.

**W8. `qualityGood` is read nowhere.** `wording.ts:503`: the "good" quality is silent in `Stat.tsx:131-132`
(only bad and uncertain are spoken). The key and its German text are shipped and translatable but never
shown; a caller who overrides it sees no effect. Smallest change: remove (**[BREAKS]** a type error for whoever
overrides it) or keep it as the documented symmetric word. Size S.

**W9. Charts and core format differently.** `ChartsWording.locale` (default `"en-GB"`, charts) is a locale
inside a wording, and core's formats are a separate register (`GERMAN_FORMATS`); one German import line
for core, another for charts (`@umriss-ui/charts/wording/de`) and the schedule/dashboard that embed charts
take core's wording and the charts' separately (the provider note, `WordingProvider.tsx:17`). A reader must
know to import two. Not a break; one line in the guide. Size S.

### 5.2 What is sound

- German covers every key of both registers (443/443, 36/36), by the type, not by a test.
- Key names say what they label, not what they say (`wording.ts` head), and the four young packages share
  one prefix scheme within themselves.
- A hardcoded German word in any package's JSX fails a test (`wordingGuard`, 0 exceptions).
- No deprecated wording key exists.

## 6. For the decision tickets: what breaks a caller

| # | Candidate | Breaks | Size |
|---|---|---|---|
| T5 | rename the three token names that are plain wrong | yes | M |
| T2 (rename) | dashboard hooks renamed to `--_` | yes | S |
| T6/section 4 | space tokens px to rem | layouts at a root other than 16px | S |
| T9 | renumber the space steps | yes | S |
| W2 | prefix the table's wording keys | yes | L |
| W3 | `expandRowNamed`/`collapseRowNamed` to the fold pair | yes | S |
| W4 | drop the `Named` suffix | yes | S |
| W5 | schedule reads the charts' five texts | yes for those who set them | M |
| W7 | `closeToast` etc. become functions | yes | M |
| W8 | remove `qualityGood` | type error for overriders | S |
| T1, T3, T4 (keep), T7, W6 | bug, private rename, document, literals, parameter names | no | S |
| T8, W1 | amend ADR-0045 and ADR-0019 in words | no | S |

Nothing here needs a capability; all of it is naming, documentation and freezing.
