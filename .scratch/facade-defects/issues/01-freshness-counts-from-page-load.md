# 01: Freshness counts from page load

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/facade-defects/spec.md`

**What to build:** No scenario ages into an error state. The table's landing scenario "Work through the alerts" shows a live-looking alarm list again: its feed's `asOf` is the moment the page was loaded minus forty seconds, while the world keeps its fixed moment for every alarm, acknowledgement and task time. Every other scenario and example that pairs a fixed moment with freshness (the kiln line, the Stat examples, the Given example, the AlarmList examples) is brought under the same rule; examples whose subject is a stale or lost feed keep showing it, relative to load. The rule ("a world has a fixed moment; a feed's freshness counts from page load") is written once in the shell's description of worlds.

- [ ] The table landing shows no stale or lost feed today.
- [ ] Each of the five demos' jsdom smoke tests has a case that sets the system clock to 1 January 2030 and renders every scenario without the wording for a lost or a stale feed.
- [ ] The examples that demonstrate stale and lost feeds still show those states.
- [ ] Alarm, acknowledgement and task times in the scenarios are unchanged.
- [ ] The rule is written once, in the shell's description of worlds.
- [ ] The table landing's screenshot baseline is renewed.
