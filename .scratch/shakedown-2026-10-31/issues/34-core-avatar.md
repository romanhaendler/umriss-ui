# 34: Core - Avatar

Status:     done
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8; roadmap P4 (`.scratch/open-points-roadmap/spec.md:56`).

- [x] `Avatar`: a mark for a person or a team - initials, or a picture if given (falling back to initials when it fails) - in two sizes, for a lane's header and a table cell. No stack, no presence (P4).
- [x] Named by the person's name; the initials are derived, overridable; colours from the tokens, 3:1 in both themes.
- [x] Root contract (ADR-0068); a demo page that passes the shell page rules; `pnpm check core`, `pnpm check:site`.

## Comments

**Delivered (2026-10-31, run coordinator).** `Avatar` (`name` required, `src`, `initials`, `size` sm|md):
`role="img"` named by `name`, initials from the first and last word, a failed picture gives way to them,
neutral or accent ground picked from the name, a 1 px ring for the 3:1 edge; demo page, configurator,
README row, tests. Looked at in light and dark: reads well. Decided: two grounds only (no verdict
colours); no stack and no presence dot (listed as a known limit).
