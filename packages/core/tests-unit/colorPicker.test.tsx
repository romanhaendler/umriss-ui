import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { ColorPicker, FormField, LanguageProvider } from "../src";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

afterEach(() => vi.restoreAllMocks());

const trigger = () => screen.getByRole("button", { name: "Colour" });
const open = () => fireEvent.click(trigger());
const hex = () => screen.getByRole("textbox", { name: "Hex" }) as HTMLInputElement;
const type = (text: string) => fireEvent.change(hex(), { target: { value: text } });

function Held({ start, onValueChange }: { start: string | null; onValueChange?: (v: string | null) => void }) {
  const [value, setValue] = useState<string | null>(start);
  return (
    <ColorPicker
      aria-label="Colour"
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValueChange?.(next);
      }}
    />
  );
}

describe("ColorPicker trigger", () => {
  it("shows the swatch and the hex value, and says its colour as its description", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#2563EB" />);
    expect(trigger().textContent).toBe("#2563EB");
    expect(screen.getByRole("button", { name: "Colour", description: "#2563EB" })).toBe(trigger());
    expect(trigger().getAttribute("aria-haspopup")).toBe("dialog");
  });

  it("is named by a FormField and shows the placeholder while empty", () => {
    render(
      <FormField label="Series">
        <ColorPicker />
      </FormField>,
    );
    expect(screen.getByRole("button", { name: "Series" }).textContent).toBe("Select colour");
  });

  it("opens on click and hands the ref to the button", () => {
    let node: HTMLButtonElement | null = null;
    render(<ColorPicker aria-label="Colour" ref={(el) => void (node = el)} />);
    expect(node).toBe(trigger());
    open();
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });

  it("opens on Arrow Down (Enter and Space are the button's own click)", () => {
    render(<ColorPicker aria-label="Colour" />);
    trigger().focus();
    fireEvent.keyDown(trigger(), { key: "ArrowDown" });
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

describe("ColorPicker value", () => {
  it.each(["#2563eb", "2563EB", "#26e"])("reads the spelling %s and reports lowercase #rrggbb", (text) => {
    const changed = vi.fn();
    render(<Held start="#000000" onValueChange={changed} />);
    open();
    type(text);
    expect(changed).toHaveBeenLastCalledWith(text === "#26e" ? "#2266ee" : "#2563eb");
  });

  it("reads a given value in any hex spelling", () => {
    render(<ColorPicker aria-label="Colour" value="#ABC" onValueChange={() => {}} />);
    expect(trigger().textContent).toBe("#AABBCC");
  });

  it("warns once in development about a value that is no colour and reads it as empty", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { rerender } = render(<ColorPicker aria-label="Colour" value="blue" onValueChange={() => {}} />);
    rerender(<ColorPicker aria-label="Colour" value="blue" onValueChange={() => {}} />);
    expect(trigger().textContent).toBe("Select colour");
    expect(warn.mock.calls.filter((c) => /ColorPicker value must be/.test(String(c[0])))).toHaveLength(1);
  });

  it("shows in the hex field a colour set from outside while the panel stands", () => {
    const { rerender } = render(<ColorPicker aria-label="Colour" value="#2563eb" />);
    open();
    rerender(<ColorPicker aria-label="Colour" value="#dc2626" />);
    expect(hex().value).toBe("#dc2626");
  });

  it("ignores a partial hex value and snaps back to the current colour on blur", () => {
    const changed = vi.fn();
    render(<Held start="#2563eb" onValueChange={changed} />);
    open();
    type("#2563e");
    expect(changed).not.toHaveBeenCalled();
    expect(hex().value).toBe("#2563e");
    fireEvent.blur(hex());
    expect(hex().value).toBe("#2563eb");
  });
});

describe("ColorPicker closing", () => {
  function opened(onValueChange = vi.fn()) {
    render(
      <>
        <Held start="#2563eb" onValueChange={onValueChange} />
        <button>elsewhere</button>
      </>,
    );
    open();
    type("#ff0000");
    return onValueChange;
  }

  it("Escape puts back the opening colour and returns the focus", () => {
    const changed = opened();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(changed).toHaveBeenLastCalledWith("#2563eb");
    expect(trigger().textContent).toBe("#2563EB");
    expect(document.activeElement).toBe(trigger());
  });

  it("Cancel does the same", () => {
    const changed = opened();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(changed).toHaveBeenLastCalledWith("#2563eb");
    expect(document.activeElement).toBe(trigger());
  });

  it("Cancel without a change reports nothing more", () => {
    const changed = vi.fn();
    render(<Held start="#2563eb" onValueChange={changed} />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(changed).not.toHaveBeenCalled();
  });

  it("Done keeps the colour and returns the focus", () => {
    const changed = opened();
    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(changed).toHaveBeenLastCalledWith("#ff0000");
    expect(changed).toHaveBeenCalledTimes(1);
    expect(trigger().textContent).toBe("#FF0000");
    expect(document.activeElement).toBe(trigger());
  });

  it("a click outside keeps the colour", () => {
    const changed = opened();
    fireEvent.mouseDown(screen.getByText("elsewhere"));
    expect(changed).toHaveBeenLastCalledWith("#ff0000");
    expect(trigger().textContent).toBe("#FF0000");
    expect(document.activeElement).toBe(trigger());
  });

  it("an empty field cancels back to none", () => {
    const changed = vi.fn();
    render(<Held start={null} onValueChange={changed} />);
    open();
    type("#ff0000");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(changed).toHaveBeenLastCalledWith(null);
  });
});

describe("ColorPicker panel", () => {
  it("is a dialog named by the wording, with the before and after strip", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#2563eb" />);
    open();
    expect(screen.getByRole("dialog", { name: "Choose colour" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Before #2563eb, after #2563eb" })).toBeTruthy();
    type("#ff0000");
    expect(screen.getByRole("img", { name: "Before #2563eb, after #ff0000" })).toBeTruthy();
  });

  it("speaks German in the German wording", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <ColorPicker aria-label="Farbe" defaultValue="#2563eb" />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Farbe" }));
    expect(screen.getByRole("dialog", { name: "Farbe wählen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Abbrechen" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Fertig" })).toBeTruthy();
  });
});
