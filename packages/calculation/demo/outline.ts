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
    id: "writing",
    name: "Writing a calculation",
    sentence: "Two forms written as elements: a tree for a figure put together from factors, a chain for a sheet read top to bottom.",
    pages: [
      {
        id: "calculation",
        name: "Calculation",
        sentence: "How a figure came about, as a statement down to the numbers it came from - evaluated by the library, never handed in.",
        types: ["CalculationProps"],
        exports: ["Calculation", "Given", "Sum", "Product", "Quotient", "Ref", "Chain", "Plus", "Interim"],
      },
      {
        id: "tree",
        name: "Tree",
        sentence: "Sum, difference, product and quotient, each holding its operands - and a quantity used twice, defined once.",
        types: ["OperatorProps", "RefProps"],
        exports: ["Sum", "Difference", "Product", "Quotient", "Ref"],
      },
      {
        id: "chain",
        name: "Chain",
        sentence: "A sheet read top to bottom: each line worked into the value before it, and interims naming the value where they stand.",
        types: ["ChainProps", "ChainOperandProps", "QuantityProps"],
        exports: ["Chain", "Plus", "Minus", "Times", "DividedBy", "Interim"],
      },
      {
        id: "given",
        name: "Given",
        sentence: "The numbers a calculation starts from: where they came from, how old they are, and the language they are read in.",
        types: ["GivenProps"],
        exports: ["Given"],
      },
    ],
  },
  {
    id: "practice",
    name: "In practice",
    sentence: "What a calculation does when the numbers are not what they should be, and two figures worked in full.",
    pages: [
      {
        id: "what-can-go-wrong",
        name: "What can go wrong",
        sentence: "A missing number, a division by zero, rounded figures that do not add up, and an alarm folded out of sight.",
        types: [],
        exports: ["Calculation"],
      },
      {
        id: "worked-examples",
        name: "Worked examples",
        sentence: "The cost per piece of a production order and the OEE of a hall - some fifty quantities each, from data.",
        types: [],
        exports: ["Calculation", "Chain", "Given", "Ref"],
      },
    ],
  },
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
