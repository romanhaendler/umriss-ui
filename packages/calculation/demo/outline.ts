/* The outline of the demo of @umriss-ui/calculation - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. One page per thing a
   reader looks up by name, as in the other demos.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else - the folder is named like the page,
   in the component's spelling. */

import { addresses, apiIndexRubric } from "@umriss-ui/demo/outline";
import type { Rubric } from "@umriss-ui/demo/outline";

export type { Rubric, Page } from "@umriss-ui/demo/outline";

export const OUTLINE: readonly Rubric[] = [
  {
    id: "getting-started",
    name: "Getting started",
    sentence: "What a calculation is for, and what an application sets up before the first one.",
    pages: [
      {
        id: "installation",
        name: "Installation",
        sentence: "Show a figure together with how it came about (a derivation, a statement of account): the operator before each number, the result above a double rule, and every figure opening into the numbers it came from.",
        about: [
          "The command brings the core package along, a peer dependency: it gives the calculation its formats, its wording and the assessment of targets and limits. React 18 or 19 is a peer as well and stays the application's own.",
          "The stylesheet loads itself: the package imports it and marks CSS as a side effect, so a bundler keeps it. `@umriss-ui/calculation/styles.css` stays exported for setups that link stylesheets by hand.",
          "You write the figure as elements and hand in only the givens; the calculation performs every operation it shows, so the screen cannot disagree with the number. Start with [Calculation](#/calculation).",
        ],
        keysOf: ["calculation"],
        types: [],
        exports: ["Calculation", "Given", "Difference", "Quotient", "Ref"],
        installs: true,
      },
    ],
  },
  {
    id: "writing",
    name: "Writing a calculation",
    sentence: "Two forms written as elements: a tree for a figure put together from factors, a chain for a sheet read top to bottom.",
    pages: [
      {
        id: "calculation",
        name: "Calculation",
        sentence: "Lets a reader follow and redo a figure (also called a KPI tree or calculation tree): each line a quantity with its operator, derived lines folded until opened beneath themselves. Reach for it where a number on the screen gets questioned: a cost, an availability, an invoice total.",
        about: [
          "There is no prop for a result. Every derived number is computed with the operator its line names, at full precision; only the screen rounds.",
          "The nesting is the fold structure and the child order is the operand order. What TypeScript cannot check – a `Ref` to nothing, a circle through references, a wrong operand count, a duplicate id, a component of your own wrapping `Given`, `emphasis` or `rule` on the Result – fails on the first render with a message saying which (ADR-0027). `emphasis` and `rule` set any other line apart without CSS (ADR-0049).",
          "Every line is read as one sentence by a screen reader, and every derivation is a disclosure: its button says whether it shows or hides how the line is derived.",
        ],
        alternatives: [
          { when: "A single figure with its verdict, without the working", use: "`Stat` from @umriss-ui/core" },
          { when: "Many figures side by side, summed per group", use: "`Table` with grouping from @umriss-ui/table" },
        ],
        keys: [
          { key: "Tab", action: "Moves to the next line that can be opened." },
          { key: "Enter or Space", action: "Opens or closes the derivation beneath the focused line." },
        ],
        accessibility: [
          "The calculation is a nested list: every line an item, every derivation a list inside it. A screen reader reads each line as one sentence - \"Availability equals Run time divided by Planned production time, equals 412 min divided by 450 min, equals 91.6 percent, above target 90 percent\" - and the drawn operator, label and figures are hidden from it. A line that opens is a button named \"Show how Availability is derived\", or \"Hide …\" while open, with `aria-expanded`; opening it moves no focus and announces nothing beyond that state.",
          "The sentence's words are core's wording, so under `@umriss-ui/core/wording/de` the same line reads \"Verfügbarkeit gleich Laufzeit geteilt durch Planbelegungszeit, gleich 412 min geteilt durch 450 min, gleich 91,6 Prozent, über Ziel 90 Prozent\" and its button \"Herleitung von Verfügbarkeit zeigen\" ([Given](#/given/in-german) shows one). The labels are yours and are read as you write them.",
          "Name the calculation with `aria-label`, which lands on the list; without it a reader meets an unnamed list. Under forced colours the band that couples a line with its operands is drawn as an outline in the system's selection colour; with reduced motion a derivation opens without its movement.",
        ],
        limits: [
          "No result, formula text or operator of your own: a written-out operation the library did not perform could say something the number does not (ADR-0027).",
          "No input: a calculation shows how a figure came about; changing a given is your application's form.",
        ],
        types: ["CalculationProps"],
        exports: ["Calculation", "Given", "Sum", "Product", "Quotient", "Ref", "Chain", "Plus", "Interim"],
      },
      {
        id: "tree",
        name: "Tree",
        sentence: "Sum, difference, product and quotient, each holding its operands: the form for a figure put together from factors, folded to its formula until a reader opens it.",
        about: [
          "`Product` and `Difference` (a − b − c) take two or more operands, `Quotient` exactly two, and `Sum` any number – rows from data, one or none included (see [Rows from data](#/rows-from-data)). A quantity used twice is defined once with an `id` and stands elsewhere as a `Ref`, which shows its name and number but never its derivation again.",
        ],
        alternatives: [{ when: "A sheet read top to bottom, line by line", use: "chain" }],
        keysOf: ["calculation"],
        limits: [
          "Four operators and nothing else – no powers, roots or functions; compute those before and hand them in as givens.",
          "A unit is a label and is never converted or checked; the calculation does no unit algebra.",
        ],
        types: ["OperatorProps", "RefProps"],
        exports: ["Sum", "Difference", "Product", "Quotient", "Ref"],
      },
      {
        id: "chain",
        name: "Chain",
        sentence: "A sheet read top to bottom (a running calculation): each line worked into the value before it, and interims naming the value where they stand. Reach for it for invoices, budgets and cost sheets.",
        about: [
          "A chain has no precedence: every line works into the value before it, strictly in order. So `Times` and `DividedBy` stand alone between two named values; anything else fails on the first render.",
          "A chain in view stands open – it is the working itself. What should show only on request goes into one line as a tree, which folds. Only an `Interim` shows the running value (ADR-0028).",
        ],
        alternatives: [{ when: "A figure made of factors, folded to its formula", use: "tree" }],
        keysOf: ["calculation"],
        limits: ["A chain in view does not fold; as an operand of a tree it folds to its last interim."],
        types: ["ChainProps", "ChainOperandProps", "QuantityProps"],
        exports: ["Chain", "Plus", "Minus", "Times", "DividedBy", "Interim"],
      },
      {
        id: "rows-from-data",
        name: "Rows from data",
        sentence: "Rows that come from data (line items, corrections, allowances), however many there are, as one line that folds: a payslip's corrections, an invoice's surcharges, a team's movements.",
        about: [
          "A `Sum` takes the rows of an array as they come: many, one, or none. With one it still folds and opens onto that one; with none it is worth zero, has nothing to open, and says \"no entries\" where its formula would stand. The line keeps its place either way, so the statement does not change shape with the data (ADR-0049).",
          "Rows of both signs go into the sum as they come. A line that adds or takes away shows its contribution: the direction as its operator, the number without a sign – \"− Overpaid travel 120.00\", never \"+ -120.00\". The quantity itself keeps its sign where its derivation closes, as an interim, as the result and wherever it is referenced. A factor keeps its sign; a line worth zero or missing keeps the operator it is written with.",
          "`Plus` and `Minus` say how a quantity enters, the number its sign. Signed rows from data go into `Plus`; a quantity that is positive by nature and taken away – income tax, a sum of contributions – into `Minus`, so that it is never quoted as negative.",
        ],
        alternatives: [{ when: "A fixed set of lines that is always in view", use: "chain" }],
        keysOf: ["calculation"],
        limits: ["Only a sum takes any count: an empty product, a difference of one and a quotient of anything but two still fail on the first render."],
        types: [],
        exports: ["Sum", "Plus", "Minus"],
      },
      {
        id: "given",
        name: "Given",
        sentence: "The numbers a calculation starts from (inputs, leaves): where they came from, when they were true, and whether they are still fresh.",
        about: [
          "A given with `asOf` and `ages` carries a freshness through core, as a `Stat` does – beside the number, never instead of its verdict. There are no default ages.",
          "The operator words, the reasons for absence and the number formats are core's wording; German comes from `@umriss-ui/core/wording/de` (ADR-0019).",
        ],
        keysOf: ["calculation"],
        types: ["GivenProps"],
        exports: ["Given"],
      },
      {
        id: "metrics",
        name: "Metrics",
        sentence: "Several numbers on every line, side by side (columns, measures): headcount and full-time equivalents of the same teams, summed by the same derivation. Reach for it where one sheet has to answer in more than one unit.",
        about: [
          "`metrics` on the calculation names each metric once, with its unit and places; every `value` is then an object with a number for each metric id. Each metric is worked on its own - nothing ever takes numbers from two of them (ADR-0038).",
          "The head names each metric above its column. The unit stands again only where a result closes: the Result, an interim, the line that closes an open derivation.",
          "A number one metric does not have is `null`, and makes absent only what depends on it in that metric; the badge says which metric, the sentence the full reason.",
          "Where the figures leave the labels less room than they need, and less than 10 rem, each line puts them on a line beneath its label, still in their columns. The component measures this: it depends on the labels, the number of metrics and their digits, not on a breakpoint.",
        ],
        alternatives: [
          { when: "A ratio across two metrics, such as FTE per head", use: "a calculation of its own, a `Quotient` of two givens" },
          { when: "Many figures per row, sorted and filtered", use: "`Table` from @umriss-ui/table" },
        ],
        keysOf: ["calculation"],
        limits: [
          "A calculation with metrics only adds and subtracts: `Product`, `Quotient`, `Times` and `DividedBy` fail on the first render, since a factor would need a unit in every metric.",
          "Unit, format and places belong to the metric; on a quantity they fail on the first render, and so does a missing or unknown metric key in a `value`.",
          "No target or limits with metrics: an assessment per cell is not there yet.",
        ],
        types: ["Metric"],
        exports: ["Calculation", "Given", "Sum", "Chain", "Plus", "Minus", "Interim"],
      },
    ],
  },
  {
    id: "practice",
    name: "In practice",
    sentence: "What a calculation does when the numbers are not what they should be, and whole figures worked in full.",
    pages: [
      {
        id: "what-can-go-wrong",
        name: "What can go wrong",
        sentence: "A number not there yet, a division by zero, rounded figures that do not add up, and a limit crossed inside a folded line: what a calculation shows in each case.",
        about: [
          "An absent given is never zero: every quantity that depends on it is absent too, with the reason, up to the result. A quotient by zero is absent with its own reason.",
        ],
        keysOf: ["calculation"],
        types: [],
        exports: ["Calculation"],
      },
      {
        id: "worked-examples",
        name: "Worked examples",
        sentence: "Whole figures as a screen shows them: the cost per stop of a day's tours, invoices with discount and VAT, and the equipment effectiveness of a hall, each built from data.",
        keysOf: ["calculation"],
        types: [],
        exports: ["Calculation", "Chain", "Given", "Ref"],
      },
    ],
  },
  apiIndexRubric("@umriss-ui/calculation"),
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromPlace } = ADDRESSES;
