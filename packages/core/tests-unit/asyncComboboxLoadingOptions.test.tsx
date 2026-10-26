/* Options handed over while results are still on their way start the cursor
   again at the first; the count waits for the loading to end. */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.querySelectorAll("[data-umriss-announcer]").forEach((r) => r.remove());
});

const ROWS = [
  { value: "a", label: "Acme" },
  { value: "z", label: "Zeta" },
];

it("resets the active option when the options change while loading", () => {
  const props = { value: null, onChange: vi.fn(), filter: false, loading: true, "aria-label": "Customer" } as const;
  const { rerender } = render(<Combobox options={ROWS} {...props} />);
  const input = screen.getByRole("combobox");
  fireEvent.click(input);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(input.getAttribute("aria-activedescendant")).toMatch(/-1$/);
  rerender(<Combobox options={[{ value: "q", label: "Qux" }, ...ROWS]} {...props} />);
  expect(input.getAttribute("aria-activedescendant")).toMatch(/-0$/);
});
