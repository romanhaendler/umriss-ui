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
    sentence: "A derivation written as it is shown: operators with their operands as children, givens as leaves.",
    pages: [
      {
        id: "calculation",
        name: "Calculation",
        sentence: "How a figure came about, line by line down to the numbers it came from - evaluated by the library, never handed in.",
        types: ["CalculationProps", "RefProps"],
        exports: ["Calculation", "Given", "Sum", "Difference", "Product", "Quotient", "Ref"],
      },
      {
        id: "operators",
        name: "Operators",
        sentence: "Sum, difference, product and quotient - and what a line says when its rounded figures do not add up.",
        types: ["OperatorProps"],
        exports: ["Sum", "Difference", "Product", "Quotient"],
      },
      {
        id: "given",
        name: "Given",
        sentence: "The numbers a calculation starts from: where they came from, how old they are, and what happens when one is missing.",
        types: ["GivenProps"],
        exports: ["Given"],
      },
    ],
  },
];

export const ADDRESSES = addresses(OUTLINE);
export const { ALL_PAGES, placeOf, addressOf, fromAddress } = ADDRESSES;
