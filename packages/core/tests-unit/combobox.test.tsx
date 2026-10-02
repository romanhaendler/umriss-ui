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

/* The chevron is the pointer's handle on the panel: it shows the pointer,
   opens the panel and closes it again, and the focus stays in the field. */
describe("Combobox - the chevron", () => {
  it("opens and closes the panel, with the focus in the field", () => {
    render(<Combobox options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Letter" />);
    const input = screen.getByRole("combobox");
    const chevron = input.parentElement!.lastElementChild as HTMLElement;

    fireEvent.click(chevron);
    expect(input.getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(input);

    // As a pointer does: the press first, which the panel must not take for an outside click.
    fireEvent.mouseDown(chevron);
    fireEvent.click(chevron);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });

  it("does nothing when the field is disabled", () => {
    render(<Combobox options={OPTIONS} value={null} onChange={vi.fn()} aria-label="Letter" disabled />);
    const input = screen.getByRole("combobox");
    fireEvent.click(input.parentElement!.lastElementChild!);
    expect(input.getAttribute("aria-expanded")).toBe("false");
  });
});
