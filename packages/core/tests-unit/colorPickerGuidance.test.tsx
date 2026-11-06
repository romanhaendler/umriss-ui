import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { ColorPicker, LanguageProvider } from "../src";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

const open = () => fireEvent.click(screen.getByRole("button", { name: "Colour" }));
const readout = (name: string) => screen.getByText(name).parentElement as HTMLElement;
const palette = [
  { name: "Ocean", value: "#2563eb" },
  { name: "Coral", value: "#f97316" },
];

describe("ColorPicker swatches", () => {
  it("shows no swatch row without swatches", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#2563eb" />);
    open();
    expect(screen.queryByRole("group", { name: "Swatches" })).toBeNull();
  });

  it("names each swatch, presses the one matching the colour and applies a click", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="Colour" defaultValue="#2563EB" swatches={palette} onValueChange={onValueChange} />);
    open();
    const group = screen.getByRole("group", { name: "Swatches" });
    expect(within(group).getByRole("button", { name: "Ocean" }).getAttribute("aria-pressed")).toBe("true");
    expect(within(group).getByRole("button", { name: "Coral" }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(within(group).getByRole("button", { name: "Coral" }));
    expect(onValueChange).toHaveBeenLastCalledWith("#f97316");
    expect(within(group).getByRole("button", { name: "Coral" }).getAttribute("aria-pressed")).toBe("true");
    expect((screen.getByRole("textbox", { name: "Hex" }) as HTMLInputElement).value).toBe("#f97316");
  });
});

describe("ColorPicker contrast readout", () => {
  it("measures black on white at 21:1", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#000000" contrastAgainst={[{ name: "Paper", value: "#ffffff" }]} />);
    open();
    expect(readout("Paper").textContent).toContain("21.0:1");
    expect(readout("Paper").textContent).toContain("Pass");
  });

  it("reads #2563eb against core's light and dark surface, in words", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#2563eb" />);
    open();
    expect(readout("Light").textContent).toContain("5.2:1");
    expect(readout("Light").textContent).toContain("Pass");
    expect(readout("Dark").textContent).toContain("3.2:1");
    expect(readout("Dark").textContent).toContain("Pass");
  });

  it("says Fail below 3:1", () => {
    render(<ColorPicker aria-label="Colour" defaultValue="#1e1e20" />);
    open();
    expect(readout("Dark").textContent).toContain("1.0:1");
    expect(readout("Dark").textContent).toContain("Fail");
    expect(readout("Light").textContent).toContain("Pass");
  });

  it("measures against the given surfaces, and an empty list hides the readout", () => {
    const { unmount } = render(<ColorPicker aria-label="Colour" defaultValue="#ffffff" contrastAgainst={[{ name: "Sheet", value: "#000000" }]} />);
    open();
    expect(screen.queryByText("Light")).toBeNull();
    expect(readout("Sheet").textContent).toContain("21.0:1");
    unmount();
    render(<ColorPicker aria-label="Colour" defaultValue="#ffffff" contrastAgainst={[]} />);
    open();
    expect(screen.queryByText(/:1/)).toBeNull();
  });

  it("has no readout while no colour is set", () => {
    render(<ColorPicker aria-label="Colour" />);
    open();
    expect(screen.queryByText(/:1/)).toBeNull();
  });
});

describe("ColorPicker guidance in German", () => {
  it("speaks German", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <ColorPicker aria-label="Farbe" defaultValue="#2563eb" swatches={palette} />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Farbe" }));
    expect(screen.getByRole("group", { name: "Farbfelder" })).toBeTruthy();
    expect(screen.getByText("Hell").parentElement?.textContent).toContain("Bestanden");
  });
});
