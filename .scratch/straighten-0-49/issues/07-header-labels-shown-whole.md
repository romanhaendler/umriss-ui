# 07: A header label that fits its column is shown whole

**What to build:** "Budget (days)" in the Edits page's "Save a row on purpose" reads in full: a header cell's auto width accounts for its whole label and its sort control. A column truly narrower than its label keeps the ellipsis and the full text in its accessible name. The cause is reproduced first (it is there at 0.48.0 too) and fixed where header widths are computed, for every column. Spec: `../spec.md` ("Header label width").

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] The cause is named in the commit body
- [ ] A browser test: that header's label is not cut (`scrollWidth <= clientWidth`) and a deliberately narrow column still ends in an ellipsis with its name
- [ ] Moved baselines reviewed one by one with the screenshot command before they are updated
- [ ] Commit body `Changelog table Fixed:` line
