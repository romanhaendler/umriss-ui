/* The keyboard a NumberInput asks for: the text keyboard while a negative value
   is allowed (it has the minus key a phone's number pad lacks), the number pad
   otherwise, and a caller's own inputMode over both. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { NumberInput } from "../src";

afterEach(cleanup);

const inputMode = (props: Record<string, unknown>) => {
  cleanup();
  render(<NumberInput aria-label="Value" value={null} onChange={vi.fn()} {...props} />);
  return screen.getByRole("textbox", { name: "Value" }).getAttribute("inputmode");
};

describe("NumberInput - inputmode", () => {
  it("asks for the text keyboard while min is unset", () => {
    expect(inputMode({})).toBe("text");
  });

  it("asks for the text keyboard for a minimum below zero", () => {
    expect(inputMode({ min: -10 })).toBe("text");
  });

  it("keeps the number pad for a minimum of zero", () => {
    expect(inputMode({ min: 0 })).toBe("decimal");
  });

  it("keeps the integer pad for a minimum of zero without decimals", () => {
    expect(inputMode({ min: 0, decimals: 0 })).toBe("numeric");
  });

  it("asks for the text keyboard for integers while min is unset", () => {
    expect(inputMode({ decimals: 0 })).toBe("text");
  });

  it("lets the caller's inputMode win in every case", () => {
    expect(inputMode({ inputMode: "numeric" })).toBe("numeric");
    expect(inputMode({ inputMode: "numeric", min: -10 })).toBe("numeric");
    expect(inputMode({ inputMode: "decimal", min: 0, decimals: 0 })).toBe("decimal");
  });
});
