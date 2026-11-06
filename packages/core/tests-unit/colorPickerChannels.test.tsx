import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { ColorPicker, LanguageProvider } from "../src";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const open = () => fireEvent.click(screen.getByRole("button", { name: "Colour" }));
const channel = (name: string) => screen.getByRole("textbox", { name }) as HTMLInputElement;
const setChannel = (name: string, text: string) => {
  const field = channel(name);
  fireEvent.focus(field);
  fireEvent.change(field, { target: { value: text } });
  fireEvent.blur(field);
};

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

describe("ColorPicker channels", () => {
  it("shows the channels of the colour", () => {
    render(<Held start="#2563eb" />);
    open();
    expect([channel("Red").value, channel("Green").value, channel("Blue").value]).toEqual(["37", "99", "235"]);
  });

  it("a committed channel changes the colour and calls onValueChange", () => {
    const seen = vi.fn();
    render(<Held start="#2563eb" onValueChange={seen} />);
    open();
    setChannel("Red", "255");
    expect(seen).toHaveBeenLastCalledWith("#ff63eb");
    expect(channel("Hex").value).toBe("#ff63eb");
  });

  it("clamps a channel to 0-255", () => {
    const seen = vi.fn();
    render(<Held start="#2563eb" onValueChange={seen} />);
    open();
    setChannel("Blue", "300");
    expect(seen).toHaveBeenLastCalledWith("#2563ff");
  });

  it("a channel that commits as the panel unmounts does not paint over Cancel", async () => {
    const seen = vi.fn();
    render(<Held start="#2563eb" onValueChange={seen} />);
    open();
    const field = channel("Green");
    fireEvent.focus(field);
    fireEvent.change(field, { target: { value: "0" } });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.blur(field);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(screen.getByRole("button", { name: "Colour" }).textContent).toBe("#2563EB");
    expect(seen).toHaveBeenLastCalledWith("#2563eb");
  });

  it("names the fields and the button in German", () => {
    vi.stubGlobal("EyeDropper", class {});
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <ColorPicker aria-label="Farbe" defaultValue="#2563eb" />
      </LanguageProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Farbe" }));
    for (const name of ["Rot", "Grün", "Blau"]) expect(screen.getByRole("textbox", { name })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Farbe vom Bildschirm aufnehmen" })).toBeTruthy();
  });
});

describe("ColorPicker eyedropper", () => {
  it("has no button where the browser has no EyeDropper", () => {
    render(<Held start="#2563eb" />);
    open();
    expect(screen.queryByRole("button", { name: "Pick a colour from the screen" })).toBeNull();
  });

  it("applies a picked colour", async () => {
    vi.stubGlobal("EyeDropper", class { open = () => Promise.resolve({ sRGBHex: "#FF0000" }); });
    const seen = vi.fn();
    render(<Held start="#2563eb" onValueChange={seen} />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Pick a colour from the screen" }));
    await waitFor(() => expect(seen).toHaveBeenLastCalledWith("#ff0000"));
  });

  it("changes nothing when the pick is refused or aborted", async () => {
    const attempt = vi.fn(() => Promise.reject(new DOMException("aborted", "AbortError")));
    vi.stubGlobal("EyeDropper", class { open = attempt; });
    const seen = vi.fn();
    render(<Held start="#2563eb" onValueChange={seen} />);
    open();
    fireEvent.click(screen.getByRole("button", { name: "Pick a colour from the screen" }));
    await waitFor(() => expect(attempt).toHaveBeenCalled());
    await Promise.resolve();
    expect(seen).not.toHaveBeenCalled();
  });
});
