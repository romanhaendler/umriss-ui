# What of the tokens and the wording changes before 1.0

Type:   grilling
Status: resolved

## Question

"Tokens and wording as surface" returned candidates whose change breaks a caller
(`.scratch/release-1-0/research/09-tokens-and-wording.md`). For each: before 1.0, or frozen as it stands?

- **The space tokens in px beside type and controls in rem**: do the space tokens follow the root font size?
  One line per token before 1.0, a major after.
- **The tokens that are measures** (about 48, listed in the findings): is that the list ADR-0083 means, and
  where do fonts, tracking, weights and `--u-transform-caps` fall?
- **Token names**: frozen as they are with a scheme for new ones, or the plainly wrong ones renamed first.
- **The dashboard's three tokens** in core's namespace: listed as they are, or renamed.
- **Wording keys**: the table's unprefixed keys, the two verbs for folding, the schedule's five repeats of
  the charts' texts, `qualityGood`.
- **Sentences joined in code** at seventeen sites: which become keys of their own.

The shape of `Wording` itself (one interface of 443 keys, accepted whole) is asked in "What of core's surface
changes before 1.0". Every point here breaks a caller, so every one is the maintainer's. What is not a break
(`--u-color-border` undeclared, the table's internal `--u-` properties, German parameter names, ADR-0045's
counts) the agent decides.

## Answer

The maintainer answered six questions (2026-11-23). Numbers are the findings' in
`.scratch/release-1-0/research/09-tokens-and-wording.md`. All before 1.0; each rename keeps its old name for
one minor (ADR-0066), each break carries its migration line.

**Tokens**

- **What sizes with the text is rem** (T6, section 4), a break for a root that is not 16px: the space scale
  `--u-space-1..8`, the icon sizes, the buttons' paddings, the widths of modal, drawer and toast. Radii,
  hairlines and hit areas stay px. At a 16px root nothing moves.
- **The measures of ADR-0083 are the findings' list** (section 3): 39 tokens in core, 6 in charts, 3 in the
  dashboard, and the two factors the table derives its row from. Fonts, tracking, weights and
  `--u-transform-caps` are not measures: they may change in a minor, with a changelog line.
- **Names are frozen as they stand**, with a scheme written down for new ones (T5). Two are renamed first,
  each a break: `--u-shadow-sticky` to `--u-color-shadow-sticky`, `--u-color-edge-hover` to
  `--u-edge-color-hover`.
- **`--u-dashboard-row`, `--u-dashboard-gap`, `--u-dashboard-max-width` and `--u-chart-1..6` keep their
  names and are listed** with the tokens (T2, T4).

**Wording**

- **The keys are frozen as they stand** (W2 to W5): the table's without a prefix, the four young packages'
  with; "fold" for groups and branches, "expand" for a row's detail; the schedule's five texts beside the
  charts'. A new key of a package carries its prefix. **`qualityGood` goes** (W8), a break for whoever
  overrides it.
- **The seventeen joined sentences stay** before 1.0 (W7) and stand in ADR-0019 as a known limit; keys that
  let a language reorder them can be added after 1.0.

*(agent)*, no break: `AlarmBanner`'s border reads a token that exists, with a screenshot before and after
(T1); the table's eleven internal properties become `--_table-*` (T3); the seven German parameter names in
`Wording` become English (W6); six px literals read their space token (T7); ADR-0045 gets its counts and the
sentence on values and measures (T8), ADR-0019 the sentence that a caller hands in a part (W1). The step
numbers of `gap` stay as they are (T9).
