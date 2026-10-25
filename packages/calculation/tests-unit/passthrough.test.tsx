/* The pass-through guard of the calculation: a composite - ref, class, style and
   the rest reach its surface, the three names reach the list. The operators,
   the givens, `Chain`, `Interim` and `Ref` are read by `Calculation`, never
   rendered. */

import { expect, it } from "vitest";
import { createRef } from "react";
import { render } from "@testing-library/react";
import * as calculation from "../src";
import { Calculation, Given } from "../src";
import { passThroughGuard } from "../../demo/tests-support/passThroughGuard.tsx";
import type { PassThroughCase, Probe } from "../../demo/tests-support/passThroughGuard.tsx";

const p = (probe: Probe) => probe as object;

const CASES: Record<string, PassThroughCase> = {
  Calculation: {
    render: (probe) => (
      <Calculation {...p(probe)}>
        <Given id="a" label="A" value={1} />
      </Calculation>
    ),
    shape: "composite",
    named: (frame) => frame.querySelector("ul"),
  },
};

const READ = "read by <Calculation>, never rendered";
passThroughGuard("calculation", calculation, CASES, {
  Given: READ,
  Sum: READ,
  Difference: READ,
  Product: READ,
  Quotient: READ,
  Ref: READ,
  Chain: READ,
  Plus: READ,
  Minus: READ,
  Times: READ,
  DividedBy: READ,
  Interim: READ,
});

it("puts the test id on the surface and the name on the list", () => {
  const ref = createRef<HTMLDivElement>();
  const { container } = render(
    <Calculation ref={ref} data-testid="oee" aria-label="OEE">
      <Given id="a" label="A" value={1} />
    </Calculation>,
  );
  const surface = container.querySelector('[data-testid="oee"]')!;
  expect(ref.current).toBe(surface);
  expect(surface.getAttribute("aria-label")).toBeNull();
  expect(container.querySelector("ul")!.getAttribute("aria-label")).toBe("OEE");
});
