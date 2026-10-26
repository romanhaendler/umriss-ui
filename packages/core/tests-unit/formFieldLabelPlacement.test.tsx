/* `labelPlacement="start"` changes the layout only: the wiring is the one of
   "top". */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "../src/components/FormField";
import { Input } from "../src/components/Input";

const described = (input: HTMLElement) => document.getElementById(input.getAttribute("aria-describedby")!)?.textContent;

describe("FormField labelPlacement start", () => {
  it("keeps the label, the description chain and the required mark", () => {
    const { rerender } = render(
      <FormField label="Cost centre" hint="As on the sheet." required labelPlacement="start">
        <Input />
      </FormField>,
    );
    const input = screen.getByRole("textbox", { name: /Cost centre/ });
    expect(input.getAttribute("aria-required")).toBe("true");
    expect(input.hasAttribute("aria-invalid") && input.getAttribute("aria-invalid") === "true").toBe(false);
    expect(described(input)).toBe("As on the sheet.");
    expect(screen.getByText("*").getAttribute("aria-hidden")).toBe("true");

    rerender(
      <FormField label="Cost centre" hint="As on the sheet." error="Not on the sheet." required labelPlacement="start">
        <Input />
      </FormField>,
    );
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(described(input)).toBe("Not on the sheet.");
  });

  it("does not leak the prop onto the DOM", () => {
    const { container } = render(
      <FormField label="A" labelPlacement="start">
        <Input />
      </FormField>,
    );
    expect(container.firstElementChild!.hasAttribute("labelplacement")).toBe(false);
  });
});
