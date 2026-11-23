# The acceptance criteria

Type:   grilling
Status: claimed
Blocked by: 12, 13

## Question

What is `1.0.0` measured by? A list a session can check without asking: which gates must be green
(`pnpm check`, the visual suite, Semgrep, `check:dist`), which browsers are named as supported and how each is
checked, what accessibility is promised, what the documentation must hold, and whether a last shakedown
against the candidate is one of the gates.

Fixed already by "How breaking changes reach 1.0": the maintainer's own applications run on the candidate
without one deprecation warning. Known from "Accessibility and browsers: claimed and checked": CI runs no
browser, Firefox runs nowhere though it is claimed, no conformance level is promised, no screen reader run is
recorded.
