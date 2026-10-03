# 01: Pages can say their keys and their accessibility

Status: ready-for-agent
Blocked by: None (can start immediately)
Spec: `.scratch/a11y-and-finish/spec.md`

**What to build:** The outline's page gains `accessibility` (up to three short paragraphs: role and name, what it announces and when, what the caller must supply, forced colours and reduced motion) and `keysOf` (pages of this demo, or a neighbour's page in the `builtFrom` form, whose keys apply here). `keysOf` is validated at load time exactly as `builtFrom` is. The Keyboard section shows the page's own table and under it "The keys of [Chart] apply here." linking each page's Keyboard anchor; a new Accessibility section stands after Keyboard and before API. Both reach the demo, the prerendered page, the llms text and the twin through the same full text. Proved on the Chart page (Accessibility) and the Line page (`keysOf: ["chart"]`).

- [ ] An unknown `keysOf` id fails at load time with its file and id (shell tooling tests)
- [ ] A fixture page with `accessibility` and `keysOf` renders both sections in the full text
- [ ] The Line page links the Chart page's Keyboard anchor; the Chart page shows an Accessibility section, in the demo and the prerendered page
