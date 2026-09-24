/* A disabled option reacts to nothing (visuelle-wertigkeit 04): the pointer
   does not move the list's cursor onto it. The arrow keys still reach it, so
   the list reads through in order. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta", disabled: true },
  { value: "c", label: "Gamma" },
];

describe("Combobox - a disabled option", () => {
  it("does not take the cursor from the pointer, but from the keys", () => {
    render(<Combobox options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Letter" />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input);
    const [, beta, gamma] = screen.getAllByRole("option");
    const active = () => input.getAttribute("aria-activedescendant");

    fireEvent.mouseEnter(gamma!);
    expect(active()).toBe(gamma!.id);
    fireEvent.mouseEnter(beta!);
    expect(active()).toBe(gamma!.id);

    fireEvent.keyDown(input, { key: "ArrowUp" });
    expect(active()).toBe(beta!.id);
  });
});
