# A value says how far its source vouches for it

Status: ready-for-agent
Date:   2026-10-25
Origin: the map `.scratch/after-shakedown/map.md`, ticket "Calculation, dashboard and operator-screen wishes"
(24), the row "Operator screens: data quality" - its Answer accepts the proposal; findings
`.scratch/shakedown/operator-screens.md` (wishes, and 6); ADR-0010, ADR-0011, ADR-0035, ADR-0045. Decided
together with `.scratch/alarms/`, which leaves quality to this spec.

## Problem Statement

A control-room screen gets three things from its source for every value: the number, when it was true, and
how far the source vouches for it. OPC UA names the last one in a status code's severity: good, uncertain or
bad. A sensor out of calibration reports its last number as uncertain; a broken wire reports bad.

umriss reads the first two. `Stat` judges the number against its limits (the verdict) and its as-of time
against two ages (the freshness), and says both in words. For the third it has nothing:

- The shakedown "gave up beyond a hand-placed Badge" (`operator-screens.md`). A Badge beside a tile is not in
  the tile's accessible name, so a screen reader hears "Furnace temperature: 905 °C, Alarm limit exceeded"
  for a reading the source called bad.
- In a calculation, a given the source called bad feeds the result, and the result reads as sound as any
  other. A calculation exists to show where its number comes from, and here it hides it.
- The tempting workarounds are each wrong in a way ADR-0010 already named: passing `null` for a bad value
  throws away the last number at the moment it matters, and colouring the tile in a verdict colour says a
  limit was crossed when none was.

## Solution

Quality becomes a third axis beside the verdict and the freshness, under ADR-0010's reasoning: **a bad value
keeps its number, its verdict and its age, and says its quality in words.** The source states it; umriss never
derives it.

- **Three levels, OPC UA's:** good, uncertain, bad. No status codes and no sub-status: those are a
  protocol's, and the application maps them in one line.
- **Core** exports the type and three words in both wordings. `Stat` takes `quality`: an uncertain or bad
  value says so on the tile and in the tile's name, and its figure carries a line-style mark. Its verdict and
  freshness stay exactly as they are.
- **The calculation**: `Given` (and a given written in place in a chain) takes `quality`. A derived quantity
  carries the worst quality of its operands, on its line and in its sentence, so a result built on a bad
  number says so.
- **Later, as examples, not in this spec:** a table cell and a chart's tooltip, through a cell renderer and
  the tooltip's own content. The charts carry no quality, as they carry no freshness (ADR-0010).
- **One ADR** records the axis, because a new axis is costly to reverse.

## User Stories

1. As a control-room operator, I want a tile whose source reports bad quality to say "Bad quality", so that I
   do not act on a broken sensor as on a measurement.
2. As a control-room operator, I want a bad reading to keep its number, so that I still see the last value
   the source gave.
3. As a control-room operator, I want a bad reading in alarm to keep "Alarm limit exceeded", so that a
   quality problem never silences an alarm.
4. As a control-room operator, I want uncertain and bad to read differently, so that I know whether to
   double-check or to stop trusting the value.
5. As a control-room operator, I want a good value to look exactly as it does today, so that the screen stays
   quiet when nothing is wrong.
6. As a control-room operator, I want a stale value to keep its quality and a bad value to keep its age, so
   that each statement stays what its source said.
7. As a screen-reader user, I want the tile's name to include the quality after the verdict, so that I hear
   it without exploring the tile.
8. As a colour-blind operator, I want the quality mark to be a word and a line style, never a hue, so that I
   can read it at any colour vision and in forced colours.
9. As an operator on a wall display, I want the mark on the figure itself, so that I see at a distance which
   tiles to doubt.
10. As an application developer on OPC UA, I want the three levels to be OPC UA's, so that I map a status
    code's severity to `quality` in one line.
11. As an application developer on another protocol, I want plain level names rather than status codes, so
    that I map my source's quality without learning OPC UA's codes.
12. As an application developer, I want a value without `quality` to behave as it does today, so that adding
    the axis changes nothing on my screens.
13. As an application developer showing a German screen, I want the three words in German, so that quality
    reads in the screen's language.
14. As a calculation reader, I want a given from a bad source to say so on its line, beside its source and
    as-of time, so that I see where the doubt enters.
15. As a calculation reader, I want a result built on an uncertain or bad given to carry that quality, so
    that the result never reads as sounder than what it is made of.
16. As a calculation reader, I want a folded line to show the quality it carries, so that I find the doubtful
    branch without opening every derivation.
17. As a screen-reader user of a calculation, I want each line's sentence to include its quality, so that I
    hear the doubt where it is.
18. As a calculation author with metrics, I want one `quality` per given to cover all its numbers, so that I
    write it once.
19. As a developer theming umriss, I want quality to use no colour of the verdict or the freshness, so that my
    theme's colours keep one meaning each.
20. As the maintainer, I want the axis recorded in an ADR, so that a later wish to fold quality into the
    verdict or the freshness is answered there.
21. As the alarms package's author, I want quality to be core's type and core's words, so that an alarm on a
    bad value reads it without a second vocabulary.

## Implementation Decisions

- **The type.** Core exports `Quality`, `"good" | "uncertain" | "bad"`, from a module of its own beside
  freshness, with a header comment that says it is the third axis and why. The levels are the severity of an
  OPC UA status code; the type's doc line says so, and says that mapping a code to a level is the
  application's. *(agent)* No `qualityWeight` export: the one ordering needed (bad over uncertain over good)
  is the calculation's, and it stays local until a second package needs it.
- **The prop.** *(agent)* `quality?: Quality`, the same name on `Stat`, on `Given` and on the chain operands
  `Plus`, `Minus`, `Times` and `DividedBy`, which already take `source`, `asOf` and `ages` for a given written
  in place. Absent means the source says nothing, and the value is shown as today. `good` shows the same as
  absent: a quiet screen for normal values, as a tile without limits claims no "ok". `good` exists so that a
  mapped status passes straight through.
- **The wording.** *(agent)* Three entries, `qualityGood`, `qualityUncertain` and `qualityBad`, beside the
  freshness words, documented as the third axis. English: "Good quality", "Uncertain quality", "Bad quality".
  German: "Qualität gut", "Qualität unsicher", "Qualität schlecht". The noun stands in each word, because
  "Bad" alone beside "Alarm limit exceeded" reads as a judgement of the value. `qualityGood` is shown by
  neither component; it is there for a caller who lists the levels, and for the alarms package.
- **What it never touches.** `assess()` takes no quality; the verdict is the value against its limits.
  `freshness()` takes no quality; the freshness is the age. Quality is never derived from either, nor from the
  value: a non-finite value is still the verdict `unknown`, whatever its quality. A value can be absent and
  bad at once, and then says both.
- **The spoken sentence.** *(agent)* `Stat`'s accessible name appends the quality word after the verdict
  when the quality is uncertain or bad: "Furnace temperature: 905 °C, Alarm limit exceeded, Bad quality".
  Appending keeps every name a good value has today. In the calculation, a line's sentence takes the word
  after the verdict and before the target; with metrics, it ends the row's sentence.
- **The visual mark.** *(agent)*
  - The word, in the secondary text colour, bad in medium weight. No hue: the danger, warning and success
    colours already mean a verdict, and the freshness line borrows two of them. A third meaning on the same
    colours would overload the channel (ADR-0011's rule, applied to colour), and a new hue would be one more
    colour for an operator to learn.
  - The figure carries a line under it in its own colour: dotted for uncertain, wavy for bad. It survives
    forced colours, needs no colour vision and reads at a distance. The figure keeps its verdict colour and
    its size.
  - No new token (ADR-0045): the mark uses the text colours and `currentColor`. A wish to theme it is answered
    with a token when it comes.
  - The tile's edge and background stay the verdict's.
- **Where the word stands.** *(agent)*
  - `Stat`: on the freshness line, before the freshness word, so that a tile with an as-of time keeps its
    height when its quality changes. Without freshness, it stands alone on that line.
  - The calculation: in the line's assessment column, after the verdict badge and the target, as plain quiet
    text and not a toned Badge. The notes row stays for what the caller wrote (explanation, source, as-of time,
    aside), and rows keep one height.
- **Quality and freshness "stale".** *(agent)* Two statements, side by side, neither replacing the other: a
  stale value keeps the quality its source last gave, and a bad value keeps its age. A lost connection does
  not make a value bad; a source that reports bad on a lost link says so itself. On a tile both stand on the
  same line, for example "Bad quality", "Stale", "6 minutes ago".
- **The calculation carries the worst.** *(agent)* A derived quantity's quality is the worst among its
  operands, bad over uncertain over good, an operand without `quality` counting as good. It holds down the
  tree, through a chain's lines and its interims, and a `Ref` shows the quality of the quantity it stands for.
  With metrics, a given's one quality covers each of its numbers. Freshness is not carried this way and stays
  on the given: quality is a property of the number, and a number computed from a bad number is no better.
  The age belongs to the reading. Because a folded line carries its own worst quality, it needs no "inside"
  marker as the verdict has.
- **The calculation's reader.** After `.scratch/server-components/` 02, quality is a string in the model the
  reader hands over, and the reader takes `Quality` as a type import only.
- **The ADR** is ticket 01's text, with the next free number. The glossary gains **Quality** beside
  **Freshness**; the map's coordinator writes it. Its avoid list names "status", "validity" and "reliability".
- **Freshness's own doc line** today reads "How much a value can be relied on right now". That is quality's
  meaning, so it becomes "How old a value is right now - independently of how it is judged and how far its
  source vouches for it."
- **The standards page** gains an OPC UA section: the three levels umriss follows, and the status codes it
  leaves to the application. The claim follows the work, so it is written with `Stat`.

## Testing Decisions

- A good test reads what a person or a screen reader perceives: the accessible name, the text, the role. It
  never asserts on the class or the data attribute that draws the mark (ADR-0045). Core's Stat tests already
  hold this line in their header comment.
- **Core.**
  - `Stat`'s tests: the three levels and the absent prop in the name and the text; a bad value in alarm keeps
    its verdict word; a stale, bad value says both; a null, bad value says "No value" and the quality.
  - The wording tables' test already proves that both wordings carry every key.
- **Calculation.**
  - The evaluation tests, which are pure: the worst quality down a tree, through a chain and through a `Ref`;
    an operand without quality counting as good.
  - The render tests: the quality word on a given's line and in its sentence; a folded result built on a bad
    given saying so; one quality covering every metric.
- **Visual.** `pnpm test:visual:quick` for core and calculation. New examples add screenshot baselines through
  the full suite for their package, and the count is stated. In forced colours the line under the figure
  stays: the spec's claim that the mark needs no colour.
- Prior art: core's freshness tests (a pure function asserted as a value), `stat.test.tsx`, and the
  calculation's evaluation and metrics tests.

## Out of Scope

- Status codes, sub-statuses (OPC UA's `Bad_SensorFailure` and its like) and their reasons. A reason is the
  application's text: a given's `explanation`, or a line beside the tile.
- Quality in a table cell and in a chart's tooltip. They come later as examples: a cell renderer and the
  tooltip's own content. Each is its own ticket when asked.
- Quality in the charts' series or points. ADR-0010's consequence holds for this axis too: a chart shows the
  data it was given.
- Quality on an alarm's value. `.scratch/alarms/` leaves it out of its first version, and it will read core's
  type when it comes (see Further Notes).
- A DEV warning for a level outside the three. The type catches it in TypeScript; `.scratch/dev-warnings/`
  takes it if a shakedown finds it.
- A quality filter or sort anywhere.
- Deriving quality from the value, the limits or the age.

## Further Notes

- **For `.scratch/alarms/`.** Quality is core's: `Quality` and the three `quality*` words. When an `Alarm`
  carries a value's quality, it takes that type and those words and declares neither in its own package or
  wording. An alarm on a bad value keeps its state and its count, as an alarm on a stale source does
  (ADR-0010); the list and the banner say the quality beside the freshness. The alarms ADR names this spec's
  ADR among its related decisions.
- Order of work: 01, then 02, then 03. 03 waits for `.scratch/server-components/` 02 (the calculation's view
  moves) and `.scratch/number-formats/` 05 (the model reading changes), since it touches the same model and
  view.
- The mark's line styles are a first choice. If the screenshots in both themes or at 4K read as noise, the
  ticket records it under `## Comments` and proposes another line style. A hue is not a fallback.
