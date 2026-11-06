import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ColorPicker, LanguageProvider } from "../src";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

const hex = () => screen.getByRole("textbox", { name: "Hex" }) as HTMLInputElement;
const open = () => fireEvent.click(screen.getByRole("button", { name: "Colour" }));
/* One character at a time, as a keyboard types. */
const typeOut = (text: string) => {
  for (let i = 1; i <= text.length; i += 1) fireEvent.change(hex(), { target: { value: text.slice(0, i) } });
};

function Held({ start, onValueChange, clearable }: { start: string | null; onValueChange?: (v: string | null) => void; clearable?: boolean }) {
  const [value, setValue] = useState<string | null>(start);
  return (
    <ColorPicker
      aria-label="Colour"
      clearable={clearable}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

describe("ColorPicker hex field while typing", () => {
  it("applies only a whole six-digit value, never a shorthand met on the way", () => {
    const changed = vi.fn();
    render(<Held start="#000000" onValueChange={changed} />);
    open();
    typeOut("#2563eb");
    expect(changed.mock.calls).toEqual([["#2563eb"]]);
  });

  it("applies a three-digit shorthand when the field commits, on blur or Enter", () => {
    const changed = vi.fn();
    render(<Held start="#000000" onValueChange={changed} />);
    open();
    typeOut("#26e");
    expect(changed).not.toHaveBeenCalled();
    fireEvent.blur(hex());
    expect(changed).toHaveBeenLastCalledWith("#2266ee");
    typeOut("#f00");
    expect(changed).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(hex(), { key: "Enter" });
    expect(changed).toHaveBeenLastCalledWith("#ff0000");
  });
});

describe("ColorPicker panel follows a colour set from outside", () => {
  it("moves the square and the strip", () => {
    const { rerender } = render(<ColorPicker aria-label="Colour" value="#2563eb" />);
    open();
    const hue = screen.getByRole("slider", { name: "Hue" });
    const square = screen.getByRole("slider", { name: "Saturation and brightness" });
    expect(hue.getAttribute("aria-valuenow")).toBe("221");
    rerender(<ColorPicker aria-label="Colour" value="#dc2626" />);
    expect(hue.getAttribute("aria-valuenow")).toBe("0");
    expect(square.getAttribute("aria-valuetext")).toBe("Saturation 83 %, brightness 86 %");
  });
});

describe("ColorPicker width, name and cross", () => {
  it("is as wide as its placeholder where that is longer than a hex value", () => {
    const { container } = render(<ColorPicker aria-label="Colour" placeholder="Pick the colour of the line" />);
    expect((container.firstElementChild as HTMLElement).style.getPropertyValue("--_chars")).toBe(String("Pick the colour of the line".length));
  });

  it("names itself with its colour where nothing else names it, in English and German", () => {
    const { unmount } = render(<ColorPicker defaultValue="#2563eb" />);
    expect(screen.getByRole("button", { name: "Colour #2563EB" })).toBeTruthy();
    unmount();
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <ColorPicker />
      </LanguageProvider>,
    );
    expect(screen.getByRole("button", { name: "Farbe: keine" })).toBeTruthy();
  });

  it("the cross while the panel stands empties the field, holds off a late step and returns the focus", () => {
    const changed = vi.fn();
    render(<Held start="#2563eb" clearable onValueChange={changed} />);
    open();
    typeOut("#26e");
    const field = hex();
    const cross = screen.getAllByRole("button", { name: "Clear", hidden: true }).find((button) => !button.closest("[role=dialog]"))!;
    fireEvent.click(cross);
    fireEvent.blur(field);
    expect(changed).toHaveBeenLastCalledWith(null);
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Colour" }));
  });
});
