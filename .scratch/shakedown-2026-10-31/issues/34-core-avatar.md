# 34: Core - Avatar

Status:     ready-for-agent
Blocked by: None (can start immediately)

Spec: `../spec.md`, decision 8; roadmap P4 (`.scratch/open-points-roadmap/spec.md:56`).

- [ ] `Avatar`: a mark for a person or a team - initials, or a picture if given (falling back to initials when it fails) - in two sizes, for a lane's header and a table cell. No stack, no presence (P4).
- [ ] Named by the person's name; the initials are derived, overridable; colours from the tokens, 3:1 in both themes.
- [ ] Root contract (ADR-0068); a demo page that passes the shell page rules; `pnpm check core`, `pnpm check:site`.

## Comments
