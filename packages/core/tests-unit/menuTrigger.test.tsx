import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Alert, Button, Menu, MenuItem, Sparkline } from "../src";

afterEach(cleanup);

const setup = () => {
  render(
    <Menu trigger={<Button>Actions</Button>}>
      <MenuItem>Archive</MenuItem>
      <MenuItem>Delete</MenuItem>
      <MenuItem disabled>Duplicate</MenuItem>
      <MenuItem>Export</MenuItem>
    </Menu>,
  );
  return screen.getByRole("button", { name: "Actions" });
};

const opened = () => {
  act(() => {
    vi.runOnlyPendingTimers();
  });
};

describe("Menu from the trigger (APG menu button)", () => {
  it("opens on ArrowDown at the first entry", () => {
    vi.useFakeTimers();
    fireEvent.keyDown(setup(), { key: "ArrowDown" });
    opened();
    expect(document.activeElement?.textContent).toBe("Archive");
    vi.useRealTimers();
  });

  it("opens on ArrowUp at the last entry", () => {
    vi.useFakeTimers();
    fireEvent.keyDown(setup(), { key: "ArrowUp" });
    opened();
    expect(document.activeElement?.textContent).toBe("Export");
    vi.useRealTimers();
  });

  it("moves to the next enabled entry that starts with the typed letter", () => {
    vi.useFakeTimers();
    fireEvent.click(setup());
    opened();
    fireEvent.keyDown(document.activeElement as Element, { key: "e" });
    expect(document.activeElement?.textContent).toBe("Export");
    vi.advanceTimersByTime(600);
    fireEvent.keyDown(document.activeElement as Element, { key: "d" });
    expect(document.activeElement?.textContent).toBe("Delete");
    vi.useRealTimers();
  });
});

describe("Sparkline and Alert", () => {
  it("puts a given name on an img", () => {
    render(<Sparkline data={[1, 2, 3]} aria-label="Load" />);
    expect(screen.getByRole("img", { name: "Load" })).toBeTruthy();
  });

  it("shows the tone by a glyph as well as colour", () => {
    const { container } = render(<Alert tone="danger">Broken</Alert>);
    expect(container.querySelector("svg")).toBeTruthy();
  });
});
