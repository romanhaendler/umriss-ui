# Field row alignment and the segmented control

Status: done

## Problem Statement

When I put different controls side by side in a row of fields - three selects
and a horizontal radio group, say, as filters over a chart - they do not line
up. The labels above them agree, but the radio group hangs a few pixels higher
than the selects: its dots and words sit above the line on which the selects'
placeholders stand. A select is as tall as a control; a radio group is only as
tall as a line of text, and in a field it starts right under the label. The
same happens to a checkbox or a switch put into a field in such a row.

And even straightened, two short possibilities such as "Raw data" and
"Cleaned data" read as a stranger in a row of boxed fields: three boxes and a
loose pair of dots. The library has no form for "one out of a few short
possibilities" that stands among fields as one of them.

## Solution

Two things.

First, everything that stands in a row of fields agrees with the fields on
one line: a horizontal radio group always takes the height of a control at its
**Control size**, with its first line on the field's centre line; a checkbox
and a switch do the same when they stand inside a `FormField`. Standing alone -
in a list of checkboxes, in a settings panel - they stay as compact as they
are today.

Second, a new component in `@umriss-ui/core`, the **Segmented control**: one
choice out of a few short possibilities, drawn as one field with a segment for
each. It is as tall, as edged and as rounded as a select, so it lines up by
construction. What it says to assistive technology and how the keys move are
a radio group's. The chosen segment is filled with ink, as a chosen radio dot
is.

## User Stories

1. As an application developer, I want a horizontal radio group in a row of fields to sit on the same line as the selects beside it, so that a filter bar looks deliberate rather than broken.
2. As an application developer, I want a horizontal radio group's words to stand on the same baseline as a select's placeholder or value beside it, so that the eye reads the row as one line.
3. As an application developer, I want a horizontal radio group to take the small control height when its size is small, so that it lines up in a dense toolbar too.
4. As an application developer, I want a horizontal radio group to take its size from a `ControlSizeProvider` around it, as every other control does, so that I say the size of a place once.
5. As an application developer, I want a horizontal radio group whose options carry a line of explanation to keep its first line on the field's centre line and let the explanation run below, so that explanations do not push the words out of line.
6. As an application developer, I want a vertical radio group to stay as it is, so that a list of options keeps its rhythm.
7. As an application developer, I want a checkbox inside a `FormField` in a row of fields to sit on the field's centre line, so that a "Show archived" checkbox lines up with the selects beside it.
8. As an application developer, I want a switch inside a `FormField` in a row of fields to sit on the field's centre line, so that a "Live" switch lines up with the fields beside it.
9. As an application developer, I want a checkbox or switch standing outside a `FormField` to stay as compact as today, so that lists of checkboxes and settings panels do not spread apart.
10. As an application developer, I want a checkbox or switch inside a `FormField` to keep its hint or error below it as today, so that straightening changes nothing but the line it stands on.
11. As an application developer, I want a `SegmentedControl` for one choice out of two to four short possibilities, so that I have a form that stands among fields as one of them.
12. As an application developer, I want the segmented control to be as tall as a select at the same **Control size**, so that it lines up without any adjustment.
13. As an application developer, I want the segmented control's edge and corners to be a field's edge and corners, so that it reads as a field in the row.
14. As an application developer, I want the segmented control to take `size` and to follow a `ControlSizeProvider`, so that it behaves like every other control.
15. As an application developer, I want to control the segmented control with `value` and `onChange`, or leave it uncontrolled with `defaultValue`, so that it fits both ways of writing a form, as the radio group does.
16. As an application developer, I want `value` to accept `null` for "none chosen yet", so that a filter can start empty, as the radio group's can.
17. As an application developer, I want the value type to be the union of the option values, so that `onChange` hands back a typed value.
18. As an application developer, I want to disable the whole segmented control or single possibilities, so that a choice that may not be made stays visible but closed.
19. As an application developer, I want to give the segmented control a `name`, or have one generated, so that it takes part in a native form submission.
20. As an application developer, I want the segmented control inside a `FormField` to take the field's label, hint, error, required and invalid state by itself, so that I wire nothing by hand.
21. As an application developer, I want a click on the `FormField`'s label not to choose the first possibility, so that the label names the group rather than acting on it, as with the radio group.
22. As an application developer, I want the segmented control's type to offer no orientation and no line of explanation, so that I cannot ask it for something it does not draw.
23. As a keyboard user, I want the segmented control to be one tab stop, so that I pass a filter bar in four steps, not seven.
24. As a keyboard user, I want the tab stop to sit on the chosen possibility, or on the first selectable one where none is chosen, so that I land where the state is.
25. As a keyboard user, I want the arrow keys to move and choose at once, skip disabled possibilities and wrap around at the ends, so that the segmented control works like every radio group.
26. As a keyboard user, I want a visible focus ring on the focused segment, not around the whole box, so that I see which possibility the arrow keys are on.
27. As a screen reader user, I want the segmented control announced as a radio group, and each segment as a radio button with its position and its chosen state, so that I know it is one choice out of a few.
28. As a screen reader user, I want the field's label, hint or error read out with the group, so that I hear what the choice is about.
29. As a pointer user, I want each segment to show that it is under the pointer, so that I see what a click will choose.
30. As a pointer user, I want a click anywhere on a segment to choose it, so that the target is the whole segment, not only its word.
31. As a user of forced colours, I want the chosen segment to stay distinguishable from the others, so that the choice does not vanish when the system repaints the page.
32. As a user on a phone, I want a segmented control that does not fit its place to end its words in an ellipsis rather than overflowing the screen, so that the page never scrolls sideways (ADR-0041).
33. As an application developer, I want each segment as wide as its word, so that a short possibility does not swim in room meant for a long one.
34. As an application developer, I want the segmented control's width never to follow which possibility is chosen, so that the row holds still while someone switches.
35. As an application developer, I want the segmented control in dark mode to look as a field looks in dark mode, so that it holds in both themes.
36. As an application developer, I want the segmented control and the straightened controls shown on the site with an example of a row of fields, so that I find the form and see it line up (ADR-0044).
37. As an application developer reading the radio group's documentation, I want to be pointed at the segmented control for short possibilities without explanations, and the segmented control's documentation to point back at the radio group for possibilities that need one, so that I pick the right form.
38. As a German-speaking user, I want nothing in the segmented control to bring wording of its own, so that the possibilities' labels are the only words in it.

## Implementation Decisions

- **Straightening, radio group.** A horizontal radio group always takes the height of a control at its size, through block padding of half the difference between the control height and one line, so that its first line lands on the centre line whatever follows below it. Vertical stays untouched. "Always", not only inside a `FormField`: a horizontal group is a row, and a row stands among controls.
- **Straightening, checkbox and switch.** The same padding, applied only when the control sits inside a `FormField`; both already read the field context, which is the signal. The small size takes the small control height.
- **No new tokens.** `--u-control-height` and `--u-control-height-sm` say the heights; nothing new is introduced (ADR-0045: tokens are the styling API).
- **`SegmentedControl` is its own export**, not a variant of `RadioGroup`: it has its own name on the site and its own type. Considered and rejected: a `variant` prop on the radio group, which would hide the form and leave orientation and explanation as silent no-ops; a toggle button group, whose name promises several pressed at once and a lone on/off button, neither of which has a case today, and whose buttons with pressed state would announce the wrong thing.
- **The radio mechanics are shared, not copied.** The segmented control uses the radio group's behaviour - real radio inputs, one tab stop that follows the choice, arrow keys that move and choose, skip disabled and wrap, the field's id on the group, the field's description, required and invalid state on it - by building on the radio group rather than reimplementing it. How the two share it is an implementation choice; the requirement is one behaviour in one place.
- **Interface.** Generic over the value type, as the radio group. Options carry `value`, `label` and `disabled`, and nothing else. Props: `options`, `value` (`T | null`), `defaultValue`, `onChange(value: T)`, `size` (`"sm" | "md"`, default from the place, else `md`), `disabled`, `name`, and the attributes of its root element. It forwards a ref to the root.
- **Drawing.** One box: a field's surface, strong edge and medium radius (small radius at the small size), at the control height. Segments are separated by a hairline seam drawn as in the button group - not a border, which would change the height. The chosen segment is filled with the primary ground and primary foreground, as a chosen radio dot; the accent stays reserved for focus. Hover on an unchosen segment as on a field under the pointer; pressed as a pressed surface. The focus ring is drawn on the focused segment. Disabled possibilities and a disabled control dim as the radio group's do.
- **Width.** The control is its natural width in a row - the sum of its segments, each as wide as its label plus padding - fills nothing by itself, and is never wider than its place: a label that does not fit ends in an ellipsis. The width depends on the labels only, never on the choice.
- **Forced colours.** The chosen segment takes the system's selected-item colours, so the fill survives the repaint.
- **Wording.** None: the component brings no strings of its own.
- **Documentation.** A short note in the component on why it is a radio group and not toggle buttons; the radio group's and the segmented control's docs point at one another. No ADR. The glossary entry **Segmented control** is written.
- **Demo.** A page for the segmented control (default, sizes, disabled, inside a `FormField` with error) and a shared example of a row of fields: select, select, segmented control, horizontal radio group, checkbox in a field, switch in a field - at both sizes.

## Testing Decisions

- A good test speaks only through the public interface: roles, labels, keys, values handed to `onChange`, and - for layout - measured boxes in a real browser. Never class names, never internal structure.
- **Unit seam (jsdom, Testing Library)** for the segmented control's behaviour: the radiogroup role and the radio roles with their names; one tab stop and where it sits; arrow keys moving, choosing, skipping disabled and wrapping; controlled and uncontrolled; `null` as none chosen; disabled as a whole and per possibility; the `FormField` wiring - label, description, required, invalid - and that a click on the field's label chooses nothing. Prior art: the radio group's and the switch's unit tests, and the form field's.
- **Layout seam (Playwright on the demo's row-of-fields example)** for both stages at once: for every control in the row, the vertical centre of its first line of text lies within a pixel of the select's text centre, at `md` and at `sm`; the segmented control's box top and bottom equal the select's; a checkbox list and a switch outside a field keep their compact height; at 320 px the segmented control stays inside its place. Prior art: the Sizes behaviour tests of ADR-0041, which measure boxes on an example page the same way.
- **Existing suites pick up the rest**: the forced-colours run and the screenshot run get the new pages; the accessibility run checks them for violations. Changed screenshots of pages with horizontal radio groups (the demo's configurator panel among them) are expected and reviewed, not suppressed.

## Out of Scope

- A toggle button or toggle button group: a lone on/off button, or several possibilities pressed at once. When a real case comes, it is a component of its own beside the segmented control.
- A fallback from segments to dots when the place is too narrow; ADR-0041's ellipsis covers it until a case says otherwise.
- Equal-width segments.
- Icons in segments.
- A shared keyboard-navigation helper across the calendar, menu, tabs, combobox and multiselect.
- Straightening a checkbox or switch that stands outside a `FormField` in a row.
- Vertical radio groups in a row of fields.

## Further Notes

- The look of the chosen segment (ink fill) was agreed with the reservation "we see it at the end": the implementing agent leaves a screenshot of the row of fields, light and dark, for that look.
- Raised in a filter bar over a chart in an application; the screenshot showed three selects and a radio group of two possibilities, the radios some pixels too high.

## Comments

Delivered through tickets 01-05 (`issues/`), each with its report. Beyond
the spec: a radio group inside a `FormField` was nameless (`label htmlFor`
names no group) and is now named by the field's label; the segmented control
does not fill a place that gives it a width (`fit-content`), unlike a field.
Full check: lint, types, unit, build and visual over all five demos - one
schedule interaction test failed once under load and passed three times on
its own.
