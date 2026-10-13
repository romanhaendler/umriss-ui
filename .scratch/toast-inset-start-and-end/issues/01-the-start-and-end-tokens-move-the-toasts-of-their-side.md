# 01 - The start and end tokens move the toasts of their side

Status: ready-for-agent
Type: task
Size: M

Blocked by: None (can start immediately)
Spec: `.scratch/toast-inset-start-and-end/spec.md`, Solution, Implementation
Decisions, Testing Decisions; user stories 1-19

## What to build

An application sets how far the toasts stand from the window's sides, the way
it sets the top and bottom distance: `--u-toast-inset-start` and
`--u-toast-inset-end` on `:root`. Unset, the toasts stand where they stood.

- **The two tokens** in the token sheet's Toast group, beside the two that
  exist, with today's distance as their default: `--u-space-5`, and
  `--u-space-4` in the sheet's existing phone rule. The group's comment, which
  the Theming page prints, speaks of the sides as well and names which
  positions each token moves.
- **The toast's stylesheet reads them** where it holds the number now: the
  start positions the start token, the end positions the end token, the
  phone's rule both. The center positions above 600 px read neither and stay
  in the middle of the window. No new breakpoint, nothing in the component.
- **Browser tests** in core's basics feature suite, beside the tests of the
  top and bottom tokens and through the same helper, widened to return the
  region's distance from each side. Each case at 1280 px and at 320 px.
- **The test above a modal** that the inset tokens move the toasts as they do
  without one takes the side tokens in.
- **The Toast page's example on where the toasts stand** names the two tokens
  in its lead beside the other two, with what they are for - beside a
  navigation rail, at the page's gutter.
- **The Theming page's note on panels opened in a portal** names them with the
  other two.
- **The pictures the longer lead moves**, on the Toast page, are renewed in
  both themes and under forced colours - those and no other. The toasts
  themselves must not differ in them.

## Acceptance

- [ ] Unset, every one of the six positions stands 20 px from its side at
      1280 px, and 16 px from both sides at 320 px.
- [ ] `--u-toast-inset-start` set on `:root` moves the `*-start` toasts to
      that distance at 1280 px and leaves `*-end` at 20 px; at 320 px it is
      the start side's distance at all six positions, the end side staying at
      16 px.
- [ ] `--u-toast-inset-end` likewise, mirrored.
- [ ] At 1280 px the center positions stay centred in the window with either
      token set.
- [ ] Neither side token moves the top or bottom distance, and neither of
      those moves a side: the existing tests of the top and bottom tokens read
      the sides too.
- [ ] With the example's modal open, the toasts stand at the set distance from
      their side.
- [ ] Both tokens appear in the Theming page's token table with default and
      description; `pnpm check:site` passes.
- [ ] The example's lead and the Theming note name all four tokens.
- [ ] `pnpm check core` passes; `API.md` is unchanged.
- [ ] `pnpm test:visual:quick core` passes, and the Toast page's pictures pass
      in both themes and under forced colours after the renewal; every renewed
      baseline is named in the commit message with why it moved.
