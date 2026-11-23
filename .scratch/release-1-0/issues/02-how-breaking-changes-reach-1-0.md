# How breaking changes reach 1.0

Type:   grilling
Status: resolved
Blocked by: 01

## Question

The reviews will turn up changes that break a caller. How are they shipped before `1.0.0`?

- Last `0.x` minors with the old name alive for one minor (ADR-0066 as it stands), so that `1.0.0` differs
  from the last `0.x` only by the removed aliases; or
- a release candidate (`1.0.0-rc.n`) that carries the breaks; or
- a hard cut in `1.0.0` with the guide beside it.

And: is there a point after which the surface is frozen and only fixes go in?

## Answer

The maintainer answered five questions (2026-11-23). No ADR: it holds for the way to one release.

- **In the last `0.x` minors, by ADR-0066 as it stands.** A rename keeps its old name for one minor and
  warns; what cannot keep an old form is a break under "Changed"; every one carries its migration line.
- **A candidate.** One last `0.x` minor is the candidate: after it the surface is frozen and only fixes go
  in. `1.0.0` differs from it only by the removed old names and the texts that say `0.x`, so it starts
  without a single alias and holds nothing that has not run.
- **No release candidate** `1.0.0-rc.n`: the candidate takes that part, on `latest`, where it is used.
- **The candidate is ripe** when the maintainer's own applications run on it without one deprecation
  warning. This is a fixed gate; the rest is "The acceptance criteria".
- **The guide from `0.x` to `1.0`** starts at `0.56.0`, is assembled from the changelogs' migration lines,
  and stands as a document of its own under `docs/`, linked from the README. Whoever is older reads the
  changelogs up to `0.56.0`.

*(agent)* The breaks of one theme that crosses packages (density's word, the table's model in the alarms)
land in one minor. How the taken points are spread over the minors stays open until the surfaces are decided.
