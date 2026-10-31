/* The chosen label is selected on focus, on a click and on the first keystroke, so typing replaces it. */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "../src/components/Combobox";

const OPTIONS = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
];

afterEach(cleanup);

const field = () => screen.getByRole<HTMLInputElement>("combobox");
const selected = (input: HTMLInputElement) => input.value.slice(input.selectionStart!, input.selectionEnd!);

describe("Combobox - typing over the label", () => {
  it("selects the label on focus", () => {
    render(<Combobox options={OPTIONS} defaultValue="b" aria-label="Letter" />);
    field().focus();
    expect(selected(field())).toBe("Beta");
  });

  it("selects it again on a click that moved the caret, and on the first keystroke", () => {
    render(<Combobox options={OPTIONS} defaultValue="b" aria-label="Letter" />);
    field().focus();
    field().setSelectionRange(0, 0);
    fireEvent.click(field());
    expect(selected(field())).toBe("Beta");
    field().setSelectionRange(0, 0);
    fireEvent.keyDown(field(), { key: "z" });
    expect(selected(field())).toBe("Beta");
  });

  it("leaves a typed query alone", () => {
    render(<Combobox options={OPTIONS} defaultValue="b" aria-label="Letter" />);
    fireEvent.change(field(), { target: { value: "Be" } });
    field().setSelectionRange(1, 1);
    fireEvent.keyDown(field(), { key: "t" });
    expect(selected(field())).toBe("");
  });
});
