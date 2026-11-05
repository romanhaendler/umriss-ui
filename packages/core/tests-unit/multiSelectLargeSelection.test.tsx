/* A selection of thousands keeps the hidden measuring row small. */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

import { fitChips } from "../src/components/MultiSelect/MultiSelect";

afterEach(cleanup);

describe("fitChips", () => {
  it("shows all chips when the row fits without the counter", () => {
    expect(fitChips([10, 10, 10], 3, 30, 0, 30)).toBe(3);
  });
  it("keeps room for the counter otherwise", () => {
    expect(fitChips([10, 10, 10], 3, 15, 0, 29)).toBe(1);
    expect(fitChips([10, 10, 10, 10], 4, 5, 0, 29)).toBe(2);
  });
  it("always needs the counter when not all chips were measured", () => {
    expect(fitChips([10, 10], 5, 5, 0, 20)).toBe(1);
  });
});

describe("MultiSelect with a large selection", () => {
  it("measures a bounded number of chips", () => {
    const options = Array.from({ length: 5000 }, (_, i) => ({ value: `v${i}`, label: `Asset ${i}` }));
    const { container } = render(
      <MultiSelect options={options} value={options.map((o) => o.value)} onValueChange={() => {}} aria-label="Assets" />,
    );
    const measured = container.querySelector('[aria-hidden="true"]')!;
    expect(measured.children.length).toBeLessThanOrEqual(101);
  });
});
