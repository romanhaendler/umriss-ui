# Tokens and wording as surface

Type:   research
Status: resolved

## Question

Token names and wording keys are surface a caller writes against. What in them should not be frozen as it
stands?

- Tokens: names that do not follow one scheme, tokens no rule reads, values written out where a token exists,
  tokens documented but absent or present but undocumented (`docs/design-language.md`, ADR-0045).
- Wording: keys named inconsistently across packages, texts built by concatenation, and whether German
  (`@umriss-ui/core/wording/de`, ADR-0019) covers every key of every package.
- Deprecated tokens or keys still alive.

Candidates only, shaped as the map's Notes say.

Findings: `.scratch/release-1-0/research/09-tokens-and-wording.md`

## Answer

Findings: `.scratch/release-1-0/research/09-tokens-and-wording.md`. The counts are by script and regex, lower
bounds where the file says so. Not checked: the demo pages' own token examples; no screenshot.

**Counts.** 130 tokens in core and 33 in charts (ADR-0045 says 116 and 29); none unread; no deprecated token
or key alive. `docs/design-language.md` names 19 of the 163. Core's `Wording` has 443 keys, charts' 36; German
has every one, and the compiler holds that. The table, the schedule, the calculation, the dashboard and the
alarms have no wording of their own: their texts are among core's 443.

**The measures** ADR-0083 lets change only in a major come to about 48 tokens: the space scale, the control
heights, the type sizes and leadings, icon sizes, button paddings, the widths and insets, the z-indexes, the
charts' sizes and the dashboard's three. The table has no row-height token: its row derives from five tokens
and two factors in the stylesheet.

Candidates whose change breaks a caller (decided in "What of the tokens and the wording changes before 1.0"):

- **The space tokens are px, the type and control tokens rem.** At a root that is not 16px the text and the
  controls grow and the padding does not. Changing it before 1.0 is one line per token; after, a major.
- **The token names follow no one scheme** (`--u-edge-color` beside `--u-color-edge-hover`,
  `--u-shadow-sticky` holding a colour, three chart tokens named for a module).
- **The dashboard's three tokens** stand in core's `--u-` namespace and are listed nowhere.
- **Wording keys are prefixed in the four young packages and not in the table**; one action has two verbs
  (`foldGroup`, `expandRowNamed`); the schedule repeats five of the charts' texts under its own keys;
  seventeen sites join wording with other text; `qualityGood` is read nowhere.

Not a break: **`--u-color-border` is read by `packages/alarms/src/AlarmBanner.module.css:12` and declared
nowhere** (checked: the one occurrence in the packages), so the banner's border falls back to nothing; eleven
internal properties of the table carry the public `--u-` prefix; seven parameter names in `Wording` are
German; ADR-0045's counts are stale.
