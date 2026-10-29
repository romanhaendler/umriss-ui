# 14: Horizontal bars get the same headroom as vertical ones

**What to build:** A horizontal bar chart's value axis ends one step above a largest bar that sits on a tick, in the step the data gave; a normalised horizontal stack ends at 100 %. Spec: `../spec.md` ("Charts headroom").

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Unit tests on the existing seam: horizontal bars at a round maximum get one step; a normalised horizontal stack ends at 100 %; lines unchanged
- [ ] Moved baselines reviewed one by one
- [ ] Commit body `Changelog charts Fixed:` line
