# 03 - A given carries its quality into the calculation

Status: ready-for-agent
Type: task
Size: M

Blocked by: `02-a-stat-says-its-quality.md`, `.scratch/server-components/issues/02-the-calculation-is-a-reader-and-a-view.md`, `.scratch/number-formats/issues/05-a-calculations-places-carry-down.md`
Spec: `.scratch/data-quality/spec.md`

## What to build

A calculation author writes `quality="uncertain"` on a given from a meter due for calibration. The given's
line says "Uncertain quality". Every line built on it carries the worst quality of its operands, so the result
says it too. A folded line shows the quality it carries, so a reader finds the doubtful branch without opening
every derivation.

- **The props.** `Given` and the chain operands `Plus`, `Minus`, `Times` and `DividedBy` take
  `quality?: Quality`, core's type, beside `source`, `asOf` and `ages`. The doc line says that the quality is
  carried up to every quantity built on the given, and that its freshness is not.
- **The model.** The reader takes `quality` into a given as it takes `source`. It stays a string in the model,
  so the model still survives the structured-clone test of `.scratch/server-components/` 02, and the reader
  imports `Quality` as a type only.
- **The evaluation.** Each quantity's evaluation gains its quality: a given's own, else the worst among its
  operands, bad over uncertain over good, an operand without `quality` counting as good. That holds:
  - down a tree;
  - through a chain's lines and its interims;
  - through a `Ref`, which shows the quality of the quantity it stands for;
  - with metrics, where a given's one quality covers each of its numbers.

  The ordering is a local function of the calculation; core exports none.
- **The line.** Uncertain and bad:
  - the word stands in the assessment column, after the verdict badge and the target, as quiet text in the
    secondary colour, bad in medium weight, and not a toned Badge;
  - the amount carries core's mark: dotted for uncertain, wavy for bad, in the amount's own colour. The
    verdict colour and the "≈" stay as they are.

  Rows keep one height, and the notes row stays the caller's (explanation, source, as-of time, aside). The
  closing line of a derivation ("= label") carries the mark on its amount as well.
- **The sentence.** The quality word follows the verdict and comes before the target. With metrics, it ends
  the row's sentence. A good line's sentence is unchanged.
- **The example.** A new Given example, "Say how far the source vouches for a number": a meter reading marked
  uncertain feeding a product and a sum, and the result carrying "Uncertain quality". It carries its own data.
- **README.** Calculation's section on givens names `quality` beside `source` and `asOf`, and says that it is
  carried up and freshness is not.
- **Changelog:** calculation, a minor entry under "Added".

## Acceptance criteria

- [ ] The evaluation tests pin the carried quality:
  - [ ] the worst of two operands;
  - [ ] an operand without quality counting as good;
  - [ ] through a chain's interim;
  - [ ] through a `Ref`;
  - [ ] a given with metrics.
- [ ] The render tests, asserting on text and the line's sentence only:
  - [ ] a bad given's line shows "Bad quality" and its sentence says it after the verdict;
  - [ ] a folded result built on an uncertain given shows "Uncertain quality" without being opened;
  - [ ] a calculation with no quality anywhere renders the same sentences as before.
- [ ] The model built by the reader still survives the structured-clone round trip with `quality` set.
- [ ] `pnpm check calculation` and `pnpm check:site` pass, and calculation's `API.md` is regenerated.
- [ ] `pnpm test:visual:quick calculation` passes. The new example's screenshot baselines are added through the
      full suite for calculation (`DEMOS=calculation`), with the count stated. In forced colours the line under
      the amount stays.
- [ ] The changelog notes the prop and that the quality is carried up.
