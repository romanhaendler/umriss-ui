/* ColorPicker among the other fields: posting, emptying. */

import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { ColorPicker } from "../src";

describe("ColorPicker in a form", () => {
  it("a disabled field posts nothing", () => {
    const { container } = render(
      <form>
        <ColorPicker name="c" defaultValue="#2563eb" disabled />
      </form>,
    );
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
  });

  it("a React form action receives the value", async () => {
    const action = vi.fn();
    const { container } = render(
      <form action={action}>
        <ColorPicker name="c" defaultValue="#2563eb" />
      </form>,
    );
    await act(async () => fireEvent.submit(container.querySelector("form")!));
    expect(action.mock.calls[0]![0].get("c")).toBe("#2563eb");
  });
});

describe("ColorPicker clearable", () => {
  it("has no cross unless clearable", () => {
    render(<ColorPicker aria-label="C" defaultValue="#2563eb" />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("the cross sets null", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="C" clearable defaultValue="#2563eb" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("an empty field has no cross and shows the placeholder", () => {
    render(<ColorPicker aria-label="C" clearable placeholder="Pick one" />);
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
    expect(screen.getByText("Pick one")).toBeTruthy();
  });

  it("Clear in the panel sets null and closes it", () => {
    const onValueChange = vi.fn();
    render(<ColorPicker aria-label="C" clearable defaultValue="#2563eb" onValueChange={onValueChange} />);
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Clear" }));
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("the panel has no Clear unless clearable", () => {
    render(<ColorPicker aria-label="C" defaultValue="#2563eb" />);
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(within(screen.getByRole("dialog")).queryByRole("button", { name: "Clear" })).toBeNull();
  });
});
