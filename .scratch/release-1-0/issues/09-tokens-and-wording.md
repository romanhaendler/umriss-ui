# Tokens and wording as surface

Type:   research
Status: claimed

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
