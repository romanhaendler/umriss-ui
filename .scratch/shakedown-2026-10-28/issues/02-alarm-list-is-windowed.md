# 02: The alarm list renders only the rows in view

**What to build:** An operator in a flood sees 5,000 standing alarms as fast as 50. Today `AlarmList` renders every row (5,000 alarms: 97,000-150,000 nodes, about 2.4 s to first paint), though the requirements asked for virtual rows at flood volume. The list passes the table's virtual rows through when its scroll area is bounded (`maxHeight`); first-out, flood and lifecycle marks, the one-number live region and focus that follows its alarm on a re-sort stay as they are. Spec: `../spec.md` ("AlarmList windowing"); repros: `../personas/p3-petra.md` 1, `../personas/p6-sven.md` 2.

**Blocked by:** 01 (a flood that clears shrinks the list under a scrolled operator)

**Status:** ready-for-agent

- [ ] A browser test: 5,000 alarms in a bounded list keep the DOM under a stated node bound and paint well under a second
- [ ] Keyboard acknowledge (A), acknowledge-in-view (Shift+A) and shelve (S) reach alarms outside the window
- [ ] Focus stays on its alarm when a P1 arrives and the list re-sorts, also while windowed
- [ ] First-out and "First in flood" marks are correct on rows that scroll into view
- [ ] The README's "Known limits" names the bound the list needs to window
- [ ] Commit body: `Changelog alarms Fixed:` line
