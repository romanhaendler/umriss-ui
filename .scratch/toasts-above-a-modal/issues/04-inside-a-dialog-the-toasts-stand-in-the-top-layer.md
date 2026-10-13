# 04 - Inside a dialog the toasts stand in the top layer

Status: ready-for-agent
Type: task
Size: M

Blocked by: 02, 03
Spec: `.scratch/toasts-above-a-modal/spec.md`, "The top layer", "The
stylesheet"; user stories 5, 6, 12, 15-17, 21, 37

## What to build

A toast stands still and whole while the dialog behind it moves - also a
dialog of the application's own that slides in by `transform` and clips its
content. A transformed ancestor becomes the containing block of a fixed box
and cuts it; an element in the top layer is laid out against the window
whatever its ancestors do, and is still a descendant for inertness.

- The region carries `popover="manual"` only while its target is a dialog, and
  only where the Popover API exists. It is shown in a layout effect keyed on
  the target, guarded against being shown already.
- The two conditions and the showing stand once, in the portal target module:
  ticket 05 uses them for the tooltip.
- The region takes the browser's popover sheet back - inset, margin, border,
  padding, overflow, background, text colour. That rule stands **before** the
  rules for the edge, the place along it and the phone's width, which have the
  same specificity and must win.
- The region's focus ring and its height transition hold in the top layer.
- Where the Popover API is missing, the region stays the fixed box of ticket
  01. The Toast page names it under Known limits: without the Popover API the
  deck moves with a dialog that transforms itself.
- The comment over the stacking tokens gains the toasts.

The prototype's sampling, run inside the page; a still toast returns one value
for `x` and one for `y`:

```js
const card = [...document.querySelectorAll("[data-toast]")].find((entry) => entry.textContent.includes(text));
const xs = new Set(), ys = new Set();
const start = performance.now();
const frame = () => {
  const box = card.getBoundingClientRect();
  xs.add(Math.round(box.x));
  ys.add(Math.round(box.y));
  if (performance.now() - start < 500) requestAnimationFrame(frame);
  else resolve({ x: [...xs], y: [...ys] });
};
frame();
```

## Acceptance

- [ ] A toast standing before the example's modal opens has the same box in
      every animation frame for 500 ms from the click, and again while the
      modal closes.
- [ ] The same against a plain `<dialog>` that animates itself by `transform`
      and has `overflow: hidden`, built by the test in the example's page.
- [ ] At a phone's width a toast above the modal takes the window's width, as
      without one.
- [ ] After Alt+T above the modal the region's focus ring is drawn.
- [ ] In forced colours the deck above the modal has no border and no box of
      its own around it.
- [ ] With reduced motion a toast above the modal appears and leaves without
      movement.
- [ ] Without a dialog the region carries no `popover` attribute (unit test);
      inside one, in jsdom, it carries none either and every test of tickets
      01 and 02 passes unchanged - the fallback's proof.
- [ ] Under StrictMode in a browser the region is shown once and nothing
      throws.
- [ ] No existing screenshot moves.
- [ ] The tests run in Chromium and WebKit.
- [ ] `pnpm check core`, `pnpm check:site` and `pnpm test:visual:quick core`
      pass.
