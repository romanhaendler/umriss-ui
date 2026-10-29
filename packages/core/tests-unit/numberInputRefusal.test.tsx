/* A character the NumberInput cannot read: the text stays, the field says why
   once and shows itself invalid for a moment. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { NumberInput } from "../src";
import { ANNOUNCE_REST } from "../src/lib/announce";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  cleanup();
  // The voice's region outlives a test; the next one starts without words.
  document.querySelectorAll("[data-umriss-announcer]").forEach((region) => region.remove());
  vi.useRealTimers();
});

const spoken = () =>
  Array.from(document.querySelectorAll("[data-umriss-announcer]")).map((r) => r.textContent).join("");

describe("NumberInput - refusing a character", () => {
  it("announces once and marks the field invalid for a moment", () => {
    render(<NumberInput aria-label="Value" value={12} onChange={vi.fn()} />);
    const field = screen.getByRole("textbox", { name: "Value" });
    fireEvent.change(field, { target: { value: "12a" } });
    expect((field as HTMLInputElement).value).toBe("12");
    expect(field.getAttribute("aria-invalid")).toBe("true");
    act(() => void vi.advanceTimersByTime(ANNOUNCE_REST));
    expect(spoken()).toBe("Only digits and the decimal separator");
    act(() => void vi.advanceTimersByTime(2000));
    expect(field.getAttribute("aria-invalid")).toBeNull();
  });

  it("announces nothing for a key it reads", () => {
    render(<NumberInput aria-label="Value" value={12} onChange={vi.fn()} />);
    const field = screen.getByRole("textbox", { name: "Value" });
    fireEvent.change(field, { target: { value: "123" } });
    act(() => void vi.advanceTimersByTime(ANNOUNCE_REST));
    expect(spoken()).toBe("");
    expect(field.getAttribute("aria-invalid")).toBeNull();
  });
});
