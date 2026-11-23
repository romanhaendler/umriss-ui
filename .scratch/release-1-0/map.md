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

- [What 1.0 promises](issues/01-what-1-0-promises.md): ADR-0083 - semver from `1.0.0`, the surface is
  `API.md`, the token names and the wording keys; a rename lives until the next major; `@experimental` is
  exempt; raising React is a major, raising TypeScript, Node or a browser a minor.
- [How breaking changes reach 1.0](issues/02-how-breaking-changes-reach-1-0.md): in the last `0.x` minors by
  ADR-0066; one last minor is the candidate and freezes the surface; no `rc`; `1.0.0` only removes the old
  names; the guide starts at `0.56.0`.
- [The acceptance criteria](issues/03-the-acceptance-criteria.md): fourteen conditions on the candidate - the
  gates green, the maintainer's applications without a warning, three browsers each run in CI with floors
  derived from the source, axe on every page, muted text at 4.5:1, one VoiceOver pass, the keyboard items
  settled, the demos looked through, a small shakedown of two tasks, `.scratch/` empty.
- [What of the table's surface changes before 1.0](issues/15-what-of-the-tables-surface-changes-before-1-0.md):
  `t.conditions`, `foldAllGroups`, `pinned`, `GroupKey`, `Table<Z, Key, S>`, typed grid reports; `asCsv` and
  `stickyRowHeader` go; the pure model is `@experimental`; the view's keys and the rest are frozen as they
  stand.
- [What of core's surface changes before 1.0](issues/16-what-of-cores-surface-changes-before-1-0.md):
  density is `"regular" | "compact"` everywhere; `Wording` is handed in as a part; `clearable` clears through
  `onValueChange`; `showValue`, `onSelect`, `neutral`, four type names; six exports and one token go; two
  things are `@experimental`.
- [What the packages ship](issues/13-what-the-packages-ship.md): the manifests and the publish path are sound;
  `check:dist` and some prose assume `0.x` and block a `1.0.0` until changed; no Node floor is written, and
  React is peered without an upper bound.
- [The surface of the table](issues/06-the-surface-of-the-table.md): seven groups of candidates that break a
  caller (a condition's three names, open and closed sets, pinning said twice, `GroupBy`, the hook's return,
  `unknown` in the grid's reports, the public model); `API.md` leaves out parts it says it lists.
- [Accessibility and browsers: claimed and checked](issues/12-accessibility-and-browsers-claimed-and-checked.md):
  CI runs no browser, Firefox runs nowhere although it is claimed, axe samples to WCAG 2.1 AA without a level
  being promised, no screen reader run is recorded.
- [What `.scratch` still holds](issues/14-what-scratch-still-holds.md): two open tickets, both only a person
  can close; eleven folders are done and deletable once the pointers from `docs/` are set right; no
  `SECURITY.md`; two undecided design notes.
- [What the demos leave unfinished](issues/11-what-the-demos-leave-unfinished.md): `unshown.json` already
  lists the 48 component props without an example; no example filters a boolean column or sets a list filter
  through `initialView`; the dashboard and the alarms are thin; no leftover text.
- [The surface of core](issues/04-the-surface-of-core.md): no alias left and the field contract holds; eight
  groups of candidates that break a caller, the largest being `Wording` as one interface of 443 keys and
  density's two words.
- [The surface of the three young packages](issues/08-the-surface-of-the-three-young-packages.md): the
  calculation and the dashboard read as fit to freeze; the alarms are the least settled, and their surface is
  partly the table's model.
- [The surface of charts](issues/05-the-surface-of-charts.md): no alias left; eight groups of candidates that
  break a caller, among them twenty exported internal types, `tone` against the glossary, and a series
  identified by its optional name.
- [The surface of the schedule](issues/07-the-surface-of-the-schedule.md): no alias left, the view's names
  match charts and the table; six groups of candidates that break a caller, the largest `from` / `to` with
  three meanings; `API.md` has no component props.
- [Tokens and wording as surface](issues/09-tokens-and-wording.md): 163 tokens, none unread, German complete;
  about 48 tokens are measures; the space tokens are px beside rem; names and key prefixes follow no one
  scheme; one token is read and declared nowhere.
- [The documents agree with the source](issues/10-the-documents-agree-with-the-source.md): no document claims
  what the source lacks; the generator of `API.md` skips components a hook returns and members written as
  methods; counts, package lists and two glossary entries have drifted; sixteen ADRs state their status twice
  and differently.
- [Which keyboard items of the shakedowns still stand](issues/21-which-keyboard-items-of-the-shakedowns-still-stand.md):
  of thirty, 21 are fixed, three stay declined as before, the legend's Tab order is fixed before 1.0, the
  schedule's lead-in by keyboard goes to the schedule's decision; four need a run on the candidate.

## Not yet specified

- **The polishing points themselves.** Each review returns candidates; which are taken before 1.0, and which
  break a caller and so go to the maintainer, can only be asked once they are on the table. Expect one
  decision ticket per review, perhaps per package.
- **The order of the releases up to 1.0**, and how the taken points are cut into specs: hangs on the points
  and on how breaking changes reach 1.0.

## Out of scope

- **The chart navigator and the unbuilt rest of the roadmap's package C** (horizontal bars, stacked overlap
  in the schedule, the utilisation line, a timeline, saved views, Sankey and bullet graph): capabilities, and
  each can be added after 1.0 without a break ([What `.scratch` still holds](issues/14-what-scratch-still-holds.md)).
