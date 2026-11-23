# The releases up to 1.0

Type:   grilling
Status: open

## Question

Everything that changes before 1.0 is decided: the answers of the nine decisions and the "(agent)" lists in
them and in the reviews. How is it cut into specs, and in which releases does it go out?

- **How many minors carry breaks**, and which break goes into which. Each is a step the maintainer's
  applications migrate through. Fixed already: a theme that crosses packages lands in one minor (density's
  word; the table's model with the alarms; `aria-label` or `aria-labelledby` on charts and the schedule), and
  a rename needs the minor after it to drop the old name, so the last breaking minor is not the candidate.
- **What comes first.** The generator of `API.md` (it is the list of the surface, and every later change is
  read from it); `check:dist` and the manifests for `1.x`; the `@experimental` marker.
- **What needs no break and can ride with any release**: the "(agent)" lists, the documents, the demos'
  missing examples, CI running three browsers, axe on every page.
- **What waits for the candidate**: the muted text's screenshots, the VoiceOver pass, the look through the
  demos, the small shakedown, the guide, the two tickets only the maintainer can close.
- **The specs**: one per package, one per theme, or one per release; each ready for `/to-tickets`.

The answer is the list of specs with their release, in order, each naming the decisions it takes from. With
it the map has reached its destination.
