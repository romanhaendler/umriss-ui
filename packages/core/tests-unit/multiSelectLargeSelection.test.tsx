/* A selection of thousands keeps the hidden measuring row small. */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

afterEach(cleanup);

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
