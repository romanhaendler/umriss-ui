Status: done
Date:   2026-10-21

# The labels hold AA - their words and their keys

## Problem Statement

Badge, Tag, Alert and the chips and counter of MultiSelect put a word in a tone
on that tone's pale surface. A developer who ships them wants to know they meet
WCAG 2.1 AA in both themes without measuring them.

Measured on 2026-10-21 against the tokens of core 0.40.2, the words do: every
tone's type on its own surface reaches 4.5:1, the closest being success in the
light theme (4.64:1) and danger in the dark (4.93:1). The keys do not. The
remove key of a Tag and the close key of an Alert rest at a reduced opacity
(0.45 and 0.4) and come up to full only on hover or focus. At rest the tag's
glyph measures 1.86:1 to 2.56:1 against the ground in every tone and both
themes, the alert's 2.47:1 to 2.50:1 in every tone of the light theme. A key is a user-interface component, and its glyph is what shows
that it is there, so WCAG 1.4.11 asks 3:1 of it in its resting state. A reader
who does not hover - a keyboard user before the focus arrives, anyone on a
touch screen - meets a key they can barely see.

Nothing catches this today. Core's contrast test checks token pairs and leaves
out pairs the labels use: the neutral tone (secondary text on the sunken
surface), the accent tone at rest (accent text on the subtle accent surface -
only its pressed surface is listed), and the secondary text of an Alert's body
on the toned surfaces. The demos' axe run measures text and nothing else, so a
faint glyph passes it.

## Solution

A label's key rests at the smallest round opacity at which its glyph holds 3:1
on every tone in both themes, and still comes up to full on hover and focus:
0.75 for the tag (whose glyph is the tone colour; the badge's dot already rests
there) and 0.5 for the alert (whose glyph is the body text colour). The contrast test holds
every pair the labels draw: the word of each tone, the Alert's body text on
each tone, and the resting key of each tone, mixed over its ground as the
browser mixes it. A token change or a stylesheet change that drops a label
under AA then fails a unit test.

## User Stories

1. As a reader, I want the word of every badge to be legible in every tone and both themes, so that the status it names is never lost.
2. As a reader, I want the word of every tag to be legible in every tone and both themes, so that I can read what was chosen.
3. As a reader, I want the remove key of a tag to be visible before I hover it, so that I know the tag can be removed.
4. As a keyboard user, I want the remove key of a tag to be visible before the focus reaches it, so that I know what Tab will bring me to.
5. As a reader on a touch screen, where there is no hover, I want the remove key of a tag to be visible at rest, so that I can find it at all.
6. As a reader, I want the close key of an alert to be visible at rest in every tone, so that I know the alert can be dismissed.
7. As a reader, I want the key to still come up to full colour on hover and focus, so that the key I am about to press stands out from the rest.
8. As a reader, I want the title and body text of an alert to be legible on every tone, so that the message reads as easily as the page around it.
9. As a reader, I want the chips of a MultiSelect to be legible at rest and on hover, so that I can read what I selected and see what pressing will do.
10. As a reader, I want the counter of a MultiSelect ("+N") to be legible, so that I know how many more items are selected.
11. As a reader in the dark theme, I want the same guarantees as in the light theme, so that my choice of theme does not cost legibility.
12. As a developer, I want Badge, Tag, Alert and MultiSelect to meet WCAG 2.1 AA out of the box, so that I do not have to audit them before I ship.
13. As a developer, I want no new prop and no new token for this, so that my code and my theme keep working unchanged.
14. As a developer who overrides the tone tokens, I want a failing test in the library to have held the default pairs, so that I know which pairs to check in my own theme.
15. As a maintainer, I want the contrast test to list every colour pair a label draws, so that a gap like the neutral and the resting accent pair cannot open again unseen.
16. As a maintainer, I want the resting key checked as the browser draws it - the glyph mixed over its ground at its opacity - so that the test measures what the reader sees.
17. As a maintainer, I want the test to read the key's resting opacity out of the component's stylesheet, as it reads the colours out of the tokens, so that the test falls the moment somebody lowers it.
18. As a maintainer, I want the badge's dot and the disabled tag recorded as outside the bound, with their reason, so that nobody mistakes their low contrast for an oversight.
19. As a maintainer, I want the bound for a key's glyph to be 3:1 (1.4.11) and the bound for a word 4.5:1 (1.4.3), taken from the standard and not from today's measurement, so that a pass means compliance and not luck.
20. As a maintainer, I want one place that says why a key rests where it does, so that a later wish for a "quieter" key meets the reason first.

## Implementation Decisions

- **The finding, measured** (WCAG 2.1 relative luminance, tokens of 0.40.2):
  - Words, all ≥ 4.5:1. Light: neutral 6.68, accent 5.75, success 4.64, warning 5.07, danger 5.20. Dark: neutral 6.79, accent 6.78, success 5.89, warning 6.56, danger 4.93.
  - Alert body (secondary text) on every toned surface: 5.89 to 6.62, all ≥ 4.5:1.
  - MultiSelect chip (body text on the sunken surface): 16.31 light, 14.20 dark; its hover is danger text on the subtle danger surface, already in the test; its touch-screen × at 0.7: 6.37 light, 7.59 dark. The counter at rest is accent text on the subtle accent surface (above); hover and active are color-mixed and measured in their stylesheet's comment (5.07 and 4.64 light).
  - Tag remove key at rest (opacity 0.45): 1.86 to 2.56 - fails 3:1 in every tone and theme.
  - Alert close key at rest (opacity 0.4): its glyph inherits the body text colour (the key is a child of the alert, not of its title). Light 2.47 to 2.50 - fails 3:1 in every tone; dark 3.22 to 3.41 - passes.
- **The fix**: the Tag's remove key rests at opacity 0.75, the smallest at which every tone in both themes holds 3:1 (tightest: success, light, 3.00:1). The Alert's close key rests at 0.5, the smallest round value above its bound of 0.47 (tightest: danger, light, 3.26:1). Hover and focus keep raising them to 1, so the gesture "quiet at rest, clear when reached" stays, only less quiet.
- Each stylesheet's comment at the opacity says why it is that value and not lower, naming the tightest pair.
- **No token**: the resting opacity stays a value in the two component stylesheets. A token would be public styling API (ADR-0045) for a value nobody has asked to change, and an application lowering it would undo the fix.
- No token colour changes; every word already passes.
- **The contrast test grows**, in the style it has. Pairs it gains, at 4.5:1 in both themes:
  - secondary text on the sunken surface (neutral badge, tag, alert);
  - accent text on the subtle accent surface (accent badge, tag, alert, the MultiSelect counter);
  - secondary text on each of the four toned subtle surfaces (alert body, the alarm stat);
  - body text on the sunken surface (the MultiSelect chip).
- It gains a second kind of pair, at 3:1 in both themes: a key's glyph at its resting opacity, composited over the tone surface it rests on, against that surface. Per tone (neutral, accent, success, warning, danger) for the Tag's remove key and for the Alert's close key.
- The resting opacity is read at runtime out of each component's stylesheet, imported as text the way the tokens are. The test fails loudly if it cannot find the value, rather than checking a default.
- **Outside the bound, recorded in the test as exceptions with their reason** (not as pairs):
  - the badge's dot: decorative; the word beside it carries the tone, so 1.4.11 does not apply. It measures 3.00 to 4.52;
  - a disabled tag: an inactive component is exempt from 1.4.3 and 1.4.11.
- The changelog of core gets one Fixed line at release: the keys of Tag and Alert are visible at rest.

## Testing Decisions

- A good test here measures what the reader sees, from the values the library ships: colours read out of the tokens, opacity read out of the stylesheet, the WCAG ratio computed, the bound from the standard. It never holds a measured ratio as the expectation.
- One seam: core's existing contrast unit test. It already reads the tokens at runtime, does the WCAG arithmetic, and keeps exceptions next to their pairs with a reason. The new pairs and the composited key are added there; no new test file and no new seam.
- The arithmetic for compositing (a colour at an opacity over an opaque ground) is checked against the standard in the test's arithmetic block, as luminance and ratio already are: full opacity gives the colour itself, zero gives the ground.
- Write the key pairs first and see them fail at 0.45 and 0.4; then raise the opacities.
- The demos' axe run (core's accessibility spec, shared rule in the demo shell) stays as it is. It keeps checking the words in the rendered page; it cannot check a glyph, which is why the key pairs live in the unit test.
- The visual suite will show the brighter keys on every page with a tag or an alert. Update those baselines once, checking that the diff is the key alone.
- Do not edit an existing pair or its bound; only add.

## Out of Scope

- The steppers of NumberInput and DatePicker: they rest at 0.4 in secondary text on the field and fail 3:1 in the same way. They are form controls, not labels, and their resting opacity is entangled with the disabled state (0.18, deliberately below rest). A separate spec.
- The MultiSelect chip's × on a pointer device, which is hidden at rest (opacity 0): the whole chip is the key and its word is visible, so it is a question of discoverability, not of contrast.
- The muted-text exception already recorded in the contrast test.
- A colour-mixed surface (the counter's hover and active): the test reads only opaque hex values; their measurement stays in the stylesheet comment.
- The edge of a label against the page (a toned surface measures 1.09 to 1.25 against the card): the word identifies the label, so 1.4.11 asks no boundary of it.
- Any new opacity or tone token.
- WCAG AAA and APCA.

## Further Notes

- The measurement was made with the test's own arithmetic on the tokens of 0.40.2. Re-run it if the tokens move before this is picked up.
- Prior art for reading a stylesheet as text in a unit test: the contrast test's own token import, and core's stylesheet-rules test.
- Prior art for opacity justified by a measurement in a comment: the MultiSelect counter's active surface ("24 % and no further").

## Comments

Delivered 2026-10-21. The Tag's remove key rests at 0.75, the Alert's close key
at 0.5 - not 0.75 as first written: the close key inherits the body text
colour, not a tone's, and holds 3:1 from 0.47 on (the figures above are
corrected). The contrast test gains seven word pairs, the resting keys of both
components in five tones and both themes (opacity read from the stylesheets),
and checks of the mixing arithmetic; at the old opacities the key pairs fail,
at the new ones they pass. `pnpm check core` green; the full visual suite
green (3274 passed, one axe run on table's server-mode page caught rows
mid-fade and passed alone) - no screenshot baseline changed. The steppers of
NumberInput and DatePicker stay open, as Out of Scope says.
