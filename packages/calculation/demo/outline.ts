/* The outline of the demo of @umriss-ui/calculation - in one place.

   It is data, not markup: sidebar, overview, jump palette, page head, props
   tables and the screenshot suite all read from it. One page per thing a
   reader looks up by name, as in the other demos.

   What is NOT here: the examples. They come from the files under
   `demo/examples/` and from nothing else - the folder is named like the page,
   in the component's spelling. */

import { addresses } from "@umriss-ui/demo/outline";
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
          "Install with `pnpm add @umriss-ui/calculation @umriss-ui/core`; core is a peer dependency and brings formats, wording and the assessment of targets and limits. React 18 or 19 as a peer as well.",
          "The stylesheet loads itself: the package imports it and marks CSS as a side effect, so a bundler keeps it. `@umriss-ui/calculation/styles.css` stays exported for setups that link stylesheets by hand.",
          "You write the figure as elements and hand in only the givens; the calculation performs every operation it shows, so the screen cannot disagree with the number. Start with [Calculation](#/calculation).",
        ],
        types: [],
        exports: ["Calculation", "Given", "Difference", "Quotient", "Ref"],
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
        sentence: "Lets a reader follow and redo a figure: each line a quantity with its operator, derived lines folded until opened beneath themselves. Reach for it where a number on the screen gets questioned: a cost, an availability, an invoice total.",
        about: [
          "There is no prop for a result. Every derived number is computed with the operator its line names, at full precision; only the screen rounds.",
          "The nesting is the fold structure and the child order is the operand order. What TypeScript cannot check – a `Ref` to nothing, a circle through references, a wrong operand count, a duplicate id, a component of your own wrapping `Given` – fails on the first render with a message saying which (ADR-0027).",
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
          "`Sum`, `Product` and `Difference` (a − b − c) take two or more operands, `Quotient` exactly two. A quantity used twice is defined once with an `id` and stands elsewhere as a `Ref`, which shows its name and number but never its derivation again.",
        ],
        alternatives: [{ when: "A sheet read top to bottom, line by line", use: "chain" }],
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
        limits: ["A chain in view does not fold; as an operand of a tree it folds to its last interim."],
        types: ["ChainProps", "ChainOperandProps", "QuantityProps"],
        exports: ["Chain", "Plus", "Minus", "Times", "DividedBy", "Interim"],
      },
      {
        id: "given",
        name: "Given",
        sentence: "The numbers a calculation starts from (inputs, leaves): where they came from, when they were true, and whether they are still fresh.",
        about: [
          "A given with `asOf` and `ages` carries a freshness through core, as a `Stat` does – beside the number, never instead of its verdict. There are no default ages.",
          "The operator words, the reasons for absence and the number formats are core's wording; German comes from `@umriss-ui/core/wording/de` (ADR-0019).",
        ],
        types: ["GivenProps"],
        exports: ["Given"],
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
        types: [],
        exports: ["Calculation"],
      },
      {
        id: "worked-examples",
        name: "Worked examples",
        sentence: "Whole figures as a screen shows them: the cost per stop of a day's tours, invoices with discount and VAT, and the equipment effectiveness of a hall, each built from data.",
        types: [],
        exports: ["Calculation", "Chain", "Given", "Ref"],
      },
    ],
  },
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
