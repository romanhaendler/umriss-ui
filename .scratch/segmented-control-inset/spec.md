# The segmented control inset, filling its place, with icons

Status: ready-for-agent

## Problem Statement

My application has a theme switch - Light | Dark | System - in its account
menu. It is one choice out of three short possibilities, so `SegmentedControl`
is the right component, and since 0.26 it is a radio group in what it says and
how the keys move. But it cannot look the way a switch standing on its own in
a menu should look, and I can only get close by reaching into its markup:

- The chosen segment is filled with ink - black in the light theme, white in
  the dark one. Next to a field in a filter row that is right; alone in a menu
  it is the loudest thing on the panel.
- I want the control to take the menu's whole width with segments of equal
  width. Today it is as wide as its words, and stretching it needs selectors on
  its internal markup (`& > *`, `& label`), which ADR-0045 says may change in
  any version.
- I want a small icon before each word. Today I put icon and word together in
  `label` myself and make the gap with a space character; the icon's size and
  its vertical centre are mine to get right, and a long word no longer ends in
  an ellipsis cleanly.
- A raised chosen segment with a shadow - the familiar "pill on a track" -
  cannot be built from tokens at all.

The previous spec (`field-row-alignment`) left equal-width segments and icons
out until a case came. This is the case.

## Solution

Three additions to `SegmentedControl`, none of which changes it when not used:

- **`variant?: "field" | "inset"`**, default `"field"` - today's look. `inset`
  draws a sunken track without an edge, with a small inner padding, and the
  chosen segment as a raised surface of its own (the surface colour, the text
  colour, the card shadow), its corners concentric with the track's.
  Unchosen segments stand in the secondary text colour without seams and turn
  to the text colour under the pointer.
- **`fill?: boolean`**, default `false`. The control fills the width its place
  gives it, and its segments share that width equally, their words centred. A
  word too long for its segment still ends in an ellipsis.
- **`icon?: ReactNode` on `SegmentedOption`.** It stands before the word, as an
  icon among a button's children does: the control sets its size and the gap,
  and centres it on the word's line.

```tsx
<SegmentedControl
  variant="inset"
  fill
  aria-label="Theme"
  options={[
    { value: "light", label: "Light", icon: <SunIcon /> },
    { value: "dark", label: "Dark", icon: <MoonIcon /> },
    { value: "system", label: "System", icon: <MonitorIcon /> },
  ]}
/>
```

That is the theme switch, in both themes, without a line of the caller's CSS.

## User Stories

1. As an application developer, I want a `variant="inset"` segmented control, so that a choice standing on its own - in a menu, a settings panel, a sheet - looks like a switch and not like a field.
2. As an application developer, I want the inset track drawn in the sunken surface colour without an edge, so that it reads as a recess the choice sits in.
3. As an application developer, I want the chosen inset segment drawn as a raised surface with the card shadow, so that the choice reads as the thing lifted out of the track.
4. As an application developer, I want the chosen segment's corners concentric with the track's, so that the pill does not look pasted in.
5. As an application developer, I want unchosen inset segments in the secondary text colour and without seams, so that only the choice carries weight.
6. As a pointer user, I want an unchosen inset segment to turn to the full text colour under the pointer, so that I see what a click will choose.
7. As an application developer, I want the inset control as tall as every other control at the same **Control size**, so that it lines up with a field beside it and follows `--u-control-height` where my shell sets it.
8. As an application developer, I want the inset control to take `size` and follow a `ControlSizeProvider` as the field variant does, so that `sm` works the same in both.
9. As an application developer, I want the inset control to follow the light and dark theme from the tokens alone, so that I write no CSS of my own for either.
10. As an application developer who leaves out `variant`, I want the segmented control to look exactly as it does in 0.26, so that nothing changes in a form I did not touch.
11. As an application developer, I want `fill`, so that the control takes the whole width of its place - a menu, a sheet, a card - instead of the width of its words.
12. As an application developer, I want the segments of a filling control to be equally wide, so that three possibilities stand as three equal parts and not as three word lengths.
13. As an application developer, I want the words of a filling control centred in their segments, so that equal parts look equal.
14. As an application developer, I want a word too long for its equal share to end in an ellipsis, so that a filling control never pushes its place wider (ADR-0041).
15. As an application developer, I want `fill` to work with both variants, so that a field-looking control can fill a form column too.
16. As an application developer, I want a filling control's width never to follow the choice, so that the menu holds still while someone switches.
17. As an application developer who leaves out `fill`, I want the control as wide as its words, exactly as in 0.26.
18. As an application developer, I want to give a possibility an `icon`, so that I do not assemble icon and word in `label` and space them with a space character.
19. As an application developer, I want the control to decide the icon's size - the icon size at `md`, the small icon size at `sm` - so that an icon from any set looks the same as in a button (CONTEXT: **Icon**).
20. As an application developer, I want the icon before the word with a fixed gap and centred on the word's line, so that it stands as it does in a button.
21. As an application developer, I want a long word to end in an ellipsis while its icon stays whole, so that the icon is never cut.
22. As an application developer, I want icons in both variants and with or without `fill`, so that the three additions combine freely.
23. As a screen reader user, I want a segment with an icon announced by its word only, so that I hear "Light, radio button, 1 of 3", not the icon's markup.
24. As a keyboard user, I want an inset or filling control to be one tab stop whose arrow keys move and choose, skip disabled possibilities and wrap, so that it behaves as every segmented control and every radio group.
25. As a keyboard user, I want the focus ring on the focused segment in the inset variant as in the field variant, so that I see which possibility the keys are on.
26. As a user of forced colours, I want the chosen inset segment in the system's selection colours, so that the choice survives the repaint, as it does in the field variant.
27. As a user of forced colours, I want the inset track to keep a visible boundary, so that the control does not dissolve into the page when the sunken ground is repainted.
28. As an application developer, I want a disabled inset control, or a disabled possibility in it, dimmed with the not-allowed cursor as in the field variant, so that the states mean the same in both.
29. As an application developer, I want an inset control in an invalid `FormField` to show the danger edge, so that an invalid field is invalid whatever its variant.
30. As an application developer, I want the segmented control's page to show an example of a theme switch - inset, filling, with icons - so that I find the look where I look for the component (ADR-0044).
31. As an application developer, I want `variant` and `fill` in the segmented control's configurator, so that I can try them on the page.
32. As an application developer, I want the documentation to say when to use which variant - `field` in a row of fields, `inset` for a choice that stands on its own - so that I pick by place, not by taste.
33. As an application developer, I want the additions in core's changelog, so that I know from which version I can drop my selectors.
34. As a German-speaking user, I want nothing in the new variant to bring wording of its own, so that the possibilities' labels stay the only words in it.

## Implementation Decisions

- **The prop is `variant`, not `appearance`.** `variant` is the library's word
  for a component's look out of a closed list (`Button`, `ButtonGroup`);
  **Appearance** is already taken in the glossary by the schedule's bar
  statements. Values `"field" | "inset"`, default `"field"`.
- **`inset`, drawn.** Track: the sunken surface, no edge, the field's radius
  for its size (medium at `md`, small at `sm`), a small inner padding (about
  3 px at `md`, 2 px at `sm` - enough for the pill to read as lifted at 26 px
  height). Total height is the control height of its size, padding included.
  Chosen segment: the surface colour, the text colour and the card shadow; its
  radius is the track's radius minus the padding, written from the radius
  token so the stylesheet guard accepts it. Unchosen segments: secondary text
  colour, no seams, the text colour under the pointer, no ground of their own.
  Segment type as the field variant's (the small text size), in medium weight
  for every segment, so the width does not change with the choice. The track
  keeps the transparent outline the field variant carries, so forced colours
  draw its boundary.
- **Shared, not forked.** Focus ring, the invalid danger edge, disabled
  dimming and cursor, the forced-colours selection colours and the ellipsis are
  the field variant's rules and apply to both variants unchanged. The
  behaviour (`useRadioGroup`) is not touched.
- **`fill`.** The control becomes a block that fills the width its place gives
  it, as a field does in a block (ADR-0041): in a row, the row's layout gives
  it room. Segments share the width equally (flex basis zero, equal grow,
  minimum width zero), words centred, ellipsis as before. Without `fill`
  nothing changes: no class is added and no existing rule is altered, so 0.26
  stays pixel-exact.
- **`icon` on `SegmentedOption`.** Rendered before the word, inside the
  segment, hidden from assistive technology; the word alone names the radio.
  Its box is the icon size token (`--u-icon-size`, `--u-icon-size-sm` at `sm`),
  it does not shrink, and the gap to the word is the one a button uses. The
  word keeps its own ellipsis box beside it, which is why the icon is a prop
  and not a child of `label`: an ellipsis needs the word in a box of its own.
  `label` stays required - an icon alone names nothing.
- **Documentation.** The component's header comment and its page say when to
  use which variant. The glossary entry **Segmented control** gains one
  sentence: where it stands on its own, it may be drawn inset - a sunken track
  with the choice raised out of it. No ADR: the form is the one the previous
  spec chose; this is a second drawing of it.
- **Demo.** A new example on the segmented control's page, a theme switch -
  Light | Dark | System, inset, filling a narrow panel, with icons. Icons from
  the shared glyph set where it has them, small inline SVGs in the example
  otherwise. `variant` and `fill` are named in the segmented control's
  configurator file; the configurator derives their controls from the props.
- **Changelog:** a feature entry in core's changelog.

## Testing Decisions

A good test checks what a user or a caller can observe - roles, names, keys,
boxes on the page - never the classes or attributes that produce them.

- **Unit seam (jsdom, Testing Library)**, the existing segmented control
  tests: the keyboard and role tests run for the default and for
  `variant="inset" fill` alike (one tab stop, arrows move, choose, skip and
  wrap; radio names and positions). A possibility with an icon is named by its
  word only, and the icon is not exposed. Prior art: the segmented control's
  and the radio group's unit tests.
- **Layout seam (Playwright, the Sizes behaviour tests)**, on the new example
  and the existing row-of-fields example: an inset control's box is as tall as
  the select's at `md` and at `sm`; with `fill`, its width equals its place's
  and its segments' widths agree within a pixel; at 320 px it stays inside its
  place and a long word ends in an ellipsis while its icon keeps its size; the
  icon's vertical centre lies within a pixel of the word's. The existing
  segmented control layout tests stay unchanged and green - that is the
  "pixel-exact as in 0.26" promise. Prior art: the segmented control tests in
  the Sizes behaviour spec (ADR-0041).
- **Forced colours:** the new example joins the forced-colours spec's list;
  the chosen inset segment is in the selection colours and the track has a
  boundary.
- **Screenshots:** the new example in the light and the dark theme joins the
  screenshot baselines; the existing segmented control baselines do not
  change.

## Out of Scope

- **Tabs.** "This application | All applications" in the portal's mobile menu
  is a tab list (`role="tab"`) and stays the shell's code; the inset variant is
  not a tabs look.
- **A gliding pill.** The choice moves at once, as in the field variant. A
  sliding pill needs the chosen segment's box measured or anchored; it is a
  ticket of its own if the look asks for it after the screenshot.
- Icon-only segments (an icon without a word).
- A height of its own for the inset variant: it is the control height, so it
  agrees with every field; a shell that wants it taller sets the control
  height for its place.
- Tokens for the inset look (track colour, pill shadow): the variant reads
  existing tokens, and a theme that remaps them remaps the inset look with
  them.
- Changing the field variant's look - the ink fill stays the default.

## Further Notes

- **The dark theme needs a look before it ships.** In the dark theme the
  surface colour (`#161618`) is darker than the sunken one (`#1e1e21`): a pill
  in the surface colour stands darker than its track, held apart by the card
  shadow's edge. The requested reference does exactly this, so the spec does
  too, but the implementing agent leaves a screenshot of the theme-switch
  example light and dark for the maintainer to judge, as the previous spec did
  for the ink fill.
- The request came from the portal shell's theme switch (Light | Dark |
  System). The reference look asked for 36 px; the control height is 32 px
  (40 px in the shell's phone sheet, which sets the control height there). The
  requester agreed that matching the other fields matters more than the 4 px.
