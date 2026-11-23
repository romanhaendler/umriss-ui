# The way to 1.0.0

Label: wayfinder:map
Date:  2026-11-23

## Destination

It is decided what happens before `1.0.0`: the acceptance criteria the release is measured by, and an ordered
list of polishing points, each decided (before 1.0 / after 1.0 / never, with the reason) and ready for
`/to-spec` and `/to-tickets` without asking the maintainer again. Building them and the release itself lie
beyond the map.

## Notes

- **Settled while charting (2026-11-23), not argued again:**
  - `1.0.0` is a promise, not a number: from then on plain semver, a break only in a major. A new ADR says so
    and supersedes the sentence "1.0 stays no goal" of ADR-0066.
  - Polishing adds no capability. It is whatever makes the present surface fit to freeze: names and props made
    consistent, deprecated aliases removed, documentation set right, look and operability, packaging. What can
    be added after 1.0 without a break waits.
  - All seven published packages become `1.0.0` in step. A package whose surface is not fit to freeze gets a
    ticket of its own.
  - No date: `1.0.0` appears when the acceptance criteria are met.
  - Until 1.0 a break is cheap and is made without shyness, but every one carries a migration line, as if
    there were callers outside; the lines add up to the guide from `0.x` to `1.0`.
- **Who decides.** The agent decides technical questions (API shape, build, mechanism) and marks each
  *(agent)* in the answer. Product questions go to the maintainer: what umriss offers, leaves out, promises.
  **Every change that breaks a caller goes to the maintainer**, technical or not.
- **One ticket per session**, research excepted. A grilling ticket calls the skills `grilling` and
  `domain-modeling`; the maintainer answers, the agent never answers for them.
- **Research runs AFK in a subagent** with the skill `research`. It reads, decides nothing and changes no
  source. Its findings are one file, `.scratch/release-1-0/research/NN-<slug>.md`, beside the tickets rather
  than on a branch: only `main` goes to GitHub, and parallel agents share no branch. The ticket's answer is
  the gist and the path. The coordinating session alone writes this file, the tickets' status, `CONTEXT.md`
  and ADR numbers, and it alone runs git.
- **Read before claiming absence:** `packages/<pkg>/API.md`, `CONTEXT.md`, `docs/adr/`.
- **A finding is shaped for a decision:** where (`file:line`), what stands there, why it matters at 1.0 (would
  setting it right later cost a major?), the smallest change, its size (S/M/L).
- umriss is public: no client, private project, path, host or person in any file.

## Decisions so far

## Not yet specified

- **The polishing points themselves.** Each review returns candidates; which are taken before 1.0, and which
  break a caller and so go to the maintainer, can only be asked once they are on the table. Expect one
  decision ticket per review, perhaps per package.
- **Whether a young package is fit to freeze** (`alarms`, `dashboard`, `calculation`): hangs on its review.
- **How the demos look.** The review of the demos reads their text; judging the look needs the sites built
  and a person or screenshots in front of them.
- **The order of the releases up to 1.0**, and how the taken points are cut into specs: hangs on the points
  and on how breaking changes reach 1.0.
- **The guide from `0.x` to `1.0`**: where it stands and what it is assembled from.
- **The last gate**: whether a shakedown against the candidate belongs to the acceptance criteria.

## Out of scope
