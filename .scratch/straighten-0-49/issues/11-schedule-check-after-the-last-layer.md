# 11: The schedule checks dependencies once every layer has registered

**What to build:** A plan with two `Subtasks` layers around a `Dependencies` layer warns about nothing that is drawn: the dependency check, and the lane check with it, run after the registration pass in which the last layer registered, not "while no subtask has registered". A dependency naming a subtask no layer has still warns once. The week bands are proven in a browser to open on Sunday under `weekStart: 7`. Spec: `../spec.md` ("Schedule dependency check").

**Blocked by:** 01, 03

**Status:** ready-for-agent

- [ ] Component test: Subtasks, Dependencies, Subtasks in that order - no warning; a missing subtask - one warning
- [ ] Existing `malformedData` tests green
- [ ] Browser: a Sunday-first schedule's week band opens on Sunday
- [ ] Commit body `Changelog schedule Fixed:` line
