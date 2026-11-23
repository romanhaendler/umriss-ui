# What of the tokens and the wording changes before 1.0

Type:   grilling
Status: open

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
