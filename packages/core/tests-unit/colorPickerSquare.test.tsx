import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ColorPicker } from "../src";

function Held({ start, onValueChange }: { start: string; onValueChange: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(start);
  return (
    <ColorPicker
      aria-label="Colour"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange(next);
      }}
    />
  );
}

function opened(start: string, onValueChange = vi.fn()) {
  render(<Held start={start} onValueChange={onValueChange} />);
  fireEvent.click(screen.getByRole("button", { name: "Colour" }));
  return {
    changed: onValueChange,
    square: screen.getByRole("slider", { name: "Saturation and brightness" }),
    hue: screen.getByRole("slider", { name: "Hue" }),
  };
}

describe("ColorPicker square", () => {
  it("is one tab stop that names both values", () => {
    const { square } = opened("#2563eb");
    expect(square.tabIndex).toBe(0);
    expect(square.getAttribute("aria-roledescription")).toBe("two-axis colour area");
    expect(square.getAttribute("aria-valuetext")).toBe("Saturation 84 %, brightness 92 %");
  });

  it("steps 1 % with the arrows and 10 % with Shift, and reports every key", () => {
    const { square, changed } = opened("#808080");
    fireEvent.keyDown(square, { key: "ArrowRight" });
    expect(square.getAttribute("aria-valuetext")).toBe("Saturation 1 %, brightness 50 %");
    fireEvent.keyDown(square, { key: "ArrowUp", shiftKey: true });
    expect(square.getAttribute("aria-valuetext")).toBe("Saturation 1 %, brightness 60 %");
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it("keeps the hue and the saturation through black", () => {
    const { square, hue, changed } = opened("#2563eb");
    const hueBefore = hue.getAttribute("aria-valuenow");
    for (let i = 0; i < 10; i += 1) fireEvent.keyDown(square, { key: "ArrowDown", shiftKey: true });
    expect(changed).toHaveBeenLastCalledWith("#000000");
    expect(hue.getAttribute("aria-valuenow")).toBe(hueBefore);
    fireEvent.keyDown(square, { key: "ArrowUp", shiftKey: true });
    const [r, , b] = [1, 3, 5].map((i) => parseInt(String(changed.mock.lastCall![0]).slice(i, i + 2), 16));
    expect(b).toBeGreaterThan(r!);
    expect(square.getAttribute("aria-valuetext")).toBe("Saturation 84 %, brightness 10 %");
  });
});

describe("ColorPicker hue strip", () => {
  it("is a slider from 0 to 360 that says its degrees", () => {
    const { hue } = opened("#ff0000");
    expect(hue.getAttribute("aria-valuemin")).toBe("0");
    expect(hue.getAttribute("aria-valuemax")).toBe("360");
    expect(hue.getAttribute("aria-valuetext")).toBe("0 degrees");
  });

  it("steps 1 degree, 15 with Page Up and Page Down, and jumps with Home and End", () => {
    const { hue, changed } = opened("#ff0000");
    fireEvent.keyDown(hue, { key: "ArrowRight" });
    expect(hue.getAttribute("aria-valuenow")).toBe("1");
    fireEvent.keyDown(hue, { key: "PageUp" });
    expect(hue.getAttribute("aria-valuenow")).toBe("16");
    fireEvent.keyDown(hue, { key: "PageDown" });
    fireEvent.keyDown(hue, { key: "ArrowLeft" });
    expect(hue.getAttribute("aria-valuenow")).toBe("0");
    fireEvent.keyDown(hue, { key: "End" });
    expect(hue.getAttribute("aria-valuenow")).toBe("360");
    fireEvent.keyDown(hue, { key: "Home" });
    expect(hue.getAttribute("aria-valuenow")).toBe("0");
    expect(changed).toHaveBeenCalledTimes(4); // End and Home land on red again: the same colour is no step
  });

  it("never takes the brightness of the colour: the hue of black moves, the colour stays black", () => {
    const { hue, changed } = opened("#000000");
    fireEvent.keyDown(hue, { key: "PageUp" });
    expect(hue.getAttribute("aria-valuenow")).toBe("15");
    expect(changed).not.toHaveBeenCalled();
  });
});
