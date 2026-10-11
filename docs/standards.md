# The standards umriss is close to

What umriss follows from **ISA-101** (high-performance operator screens), what
it deliberately does not, and where the knowledge comes from. The claim follows
the work: this page says no more than the code and its tests hold.

**umriss is not certified against the standard, and claims no
conformance.** It is a standard for a whole operator interface -
philosophy, rationalisation, operation, audit. A
component library can make the right thing easy and the wrong thing visible;
it cannot make a plant conform.

## ISA-101 - high-performance operator screens

### What umriss follows

- **A grey base, colour for the abnormal.** "Ink & Paper" is almost
  monochrome; danger, warning and success come from a verdict or
  a freshness, never from decoration.
- **Never colour alone.** Every verdict colour stands beside a word or a
  glyph. A register of every library stylesheet with a verdict colour holds
  what carries its meaning without it
  (`packages/core/tests-unit/verdictColour.test.ts`).
The rule, its check and its limits stand in
[`design-language.md`](design-language.md), "Colour for the abnormal".

### Where umriss departs, and why

- **The danger button and a menu's destructive item are red** for a
  consequence, not an abnormal state; their label names the action.
- **The "ok" verdict word is tinted green**, where a strict ISA-101 screen
  would leave normal grey: it is a verdict the caller asked for.
- **Screens, navigation and faceplates** are the application's. umriss ships
  components, not an operator interface.

## Sources

The norm text of ISA-101 is paywalled and was **not** read.
Everything above rests on secondary sources - white papers, vendor
documentation and reference sites - gathered in the library comparison of
24 September 2026 (`research/library-comparison-2026-09/charts_industrial.md`).
Where they and the norm text differ, the norm text wins, and this page is
wrong.

**ISA-101** (secondary)

- HMI Library, *ISA-101* - <https://hmilibrary.com/standards/isa-101>
- Industrial Monitor Direct, ISA-101 colour strategy (vendor knowledge base) -
  <https://industrialmonitordirect.com/blogs/knowledgebase/isa-101-high-performance-hmi-design-principles-color-strategy>
- Tatsoft, FrameworX ISA-101 compliance guide (vendor) -
  <https://docs.tatsoft.com/display/FX/ISA-101+HMI+Compliance+How-to+Guide>
