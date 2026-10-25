# 02 - A Stat says its quality

Status: ready-for-agent
Type: task
Size: M

Blocked by: `01-the-adr-a-bad-value-keeps-its-verdict.md`
Spec: `.scratch/data-quality/spec.md`

## What to build

The tracer bullet, end to end in core. An application passes `quality="bad"` to a `Stat`. The tile keeps its
number, its verdict and its freshness, says "Bad quality" on its freshness line and in its accessible name,
and marks its figure with a wavy line. Without `quality`, or with `good`, the tile is what it is today.

- **The type.** `Quality` (`"good" | "uncertain" | "bad"`), exported from core's entry. It lives in a module
  of its own beside freshness, with a header comment: the third axis, what it never touches (verdict,
  freshness, the value), and that the levels are an OPC UA status code's severity, mapped by the
  application. No weight function.
- **The wording.** `qualityGood`, `qualityUncertain` and `qualityBad`, in the Stat block beside the freshness
  words, with a doc comment that names the third axis and the ADR.
  - English: "Good quality", "Uncertain quality", "Bad quality".
  - German: "Qualität gut", "Qualität unsicher", "Qualität schlecht".
- **`Stat`.**
  - It takes `quality?: Quality`. Its doc line says what absent and `good` mean (nothing shown) and that the
    verdict and freshness stay.
  - Uncertain and bad: the word stands on the freshness line, before the freshness word. Without `asOf` and
    `ages`, it stands alone on that line. The word is in the secondary text colour, bad in medium weight.
  - The figure carries a line under it in its own colour: dotted for uncertain, wavy for bad. It uses no
    verdict or freshness colour and no new token. The tile's edge and background stay the verdict's.
  - The accessible name appends the word after the verdict: "Furnace temperature: 905 °C, Alarm limit
    exceeded, Bad quality". Names of values without quality are unchanged.
  - The component's header comment names the third axis beside the two it names today.
- **Freshness's doc line** ("How much a value can be relied on right now") becomes "How old a value is right
  now - independently of how it is judged and how far its source vouches for it."
- **The example.** A new Stat example, "Say how far the source vouches for a value". It shows three tiles with
  the same limits - good, uncertain, and bad in alarm - and one bad tile that is also stale. Its lead says
  that the number and the verdict stay, and that the levels are OPC UA's. It carries its own data, as every
  example does (ADR-0035, amended).
- **README.** Core's `Stat` row names quality beside freshness.
- **The standards page** gains an OPC UA section in the shape of the ISA-101 one:
  - "What umriss follows": the three levels of a status code's severity.
  - "Where umriss departs": no status codes or sub-statuses; the mapping is the application's.
  - A source: the OPC Foundation's online reference for Part 4's StatusCode. Check the link resolves.
- **Changelog:** core, a minor entry under "Added": `Quality`, `Stat`'s `quality`, the three wording keys.
  Name the keys, for an application that builds a whole `Wording` without spreading the default.

## Acceptance criteria

- [ ] `Stat`'s unit tests, asserting on the accessible name and the text only:
  - [ ] absent and `good` give today's name and no quality word;
  - [ ] `uncertain` and `bad` each show their word and append it to the name after the verdict;
  - [ ] a bad value in alarm keeps "Alarm limit exceeded" in its text and its name;
  - [ ] a stale, bad value shows the quality word and the freshness word;
  - [ ] a null, bad value says "No value" and "Bad quality".
- [ ] The German wording carries the three words (the wording tables' test passes).
- [ ] The verdict-colour register stays unchanged: quality adds no verdict colour.
- [ ] `pnpm check core` and `pnpm check:site` pass, and core's `API.md` is regenerated with `Quality` and the
      prop.
- [ ] `pnpm test:visual:quick core` passes. The new example's screenshot baselines are added through the full
      suite for core (`DEMOS=core`), in light and dark, with the count stated. In forced colours the line under
      the figure stays.
- [ ] The example's tiles are reviewed in a screenshot side by side, in both themes. If a line style reads as
      noise, it is recorded under `## Comments` with a proposal; a hue is not one.
- [ ] The changelog entry names the three keys.
