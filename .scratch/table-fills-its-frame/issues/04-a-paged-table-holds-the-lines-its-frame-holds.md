
### From ticket 03

- The held height is in frame.tsx (`heldHeight`, custom property `--_table-held` on the scroll area): `(headRows + askedLines + footer) * pitch`, `askedLines = heldLines || (first load ? pageSize : 0)`, `heldLines` from the current `pageSize`. With a fitted size this must read the option or the chosen size, never the fitted one, or the frame feeds itself. `registry.framed` is the probe's result (framed.ts).
- The pitch is measured in Frame (`pitch` state, column row height); reuse it for the fit.
- A filled table without a pager gets `.reaching` (min-height 100% plus a `ReachRow` of height 100% inside the body's own tbody, sticky footer); a separate tbody for that row does not work in WebKit.
- Demo examples `Pagination/03-fill-a-pane` and `04-beside-a-taller-neighbour` exist; the first still shows 5 rows over blank surface until the fit lands.
