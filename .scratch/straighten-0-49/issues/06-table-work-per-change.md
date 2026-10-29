# 06: Flex widths and onSelectionChange do their work per change, not per render

**What to build:** Scrolling a virtual table with flex columns measures nothing per frame, and an unchanged 50,000-key selection costs nothing per render. Flex widths are recomputed when the visible columns, their declared or stored widths, their order, the pin sides or the scroll area's width change; `onSelectionChange` detects a change from the selection state's identity or a version, not a serialisation. Contracts unchanged. Spec: `../spec.md` ("Flex widths", "onSelectionChange").

**Blocked by:** 01 (the worker runs `flex-widths.spec`)

**Status:** ready-for-agent

- [ ] `flex-widths` browser spec green; a test shows no measurement during a re-render that changes nothing the layout depends on (e.g. a counted measurement in a virtual scroll)
- [ ] `onSelectionChange` tests green; a test with a large selection re-rendered without change calls nothing and serialises nothing
- [ ] Commit body `Changelog table Fixed:` line
