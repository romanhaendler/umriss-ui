/* What an application's test does with the installed package: it renders a calculation the way a
   user sees it and reads the DOM. check:dist runs this file under Vitest and under Jest, in a
   project that has only the lines core's README gives. `React` is imported because Vite's own
   transform of a .jsx file is the classic one. */

import React, { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Calculation, Given, Product } from "@umriss-ui/calculation";

function Costing() {
  const [quantity, setQuantity] = useState(12);
  return (
    <>
      <label>
        Quantity input
        <input type="number" value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} />
      </label>
      <Calculation aria-label="Costing">
        <Product label="Line amount" unit="€">
          <Given label="Quantity" value={quantity} unit="pcs" />
          <Given label="Unit price" value={389} unit="€" />
        </Product>
      </Calculation>
    </>
  );
}

const result = async () => (await screen.findByRole("list", { name: "Costing" })).textContent;

it("works out the result again when an input changes", async () => {
  render(<Costing />);
  expect(await result()).toContain("4,668");

  fireEvent.change(screen.getByLabelText("Quantity input"), { target: { value: "2" } });
  expect(await result()).toContain("778");
  expect(await result()).not.toContain("4,668");
});
