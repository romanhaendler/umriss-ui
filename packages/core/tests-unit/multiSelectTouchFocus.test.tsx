/* Where the focus lands when a MultiSelect's panel opens: on its first enabled
   option when a touch opened it (no keyboard over the list), on the search
   when a mouse, a pen or a key did, and on the trigger when a touch finds
   nothing to focus. */

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MultiSelect } from "../src/components/MultiSelect";

const OPTIONS = [
  { value: "a", label: "Alpha", disabled: true },
  { value: "b", label: "Beta" },
  { value: "c", label: "Gamma" },
];

afterEach(cleanup);

const renderField = (options = OPTIONS) =>
  render(
    <MultiSelect
      options={options}
      value={[]}
      onChange={() => {}}
      aria-label="Letters"
      searchPlaceholder="Find"
    />,
  );

const trigger = () => screen.getByRole("button", { name: "Letters" });

/** A press as a finger, a mouse or a pen makes it: the focus, the pointer, then the click. */
const press = (pointerType: string) => {
  trigger().focus();
  fireEvent.pointerDown(trigger(), { pointerType, button: 0 });
  fireEvent.click(trigger());
};

describe("MultiSelect - focus when the panel opens", () => {
  it("focuses the first enabled option when a touch opens it", () => {
    renderField();
    press("touch");
    expect(document.activeElement).toBe(screen.getByRole("checkbox", { name: "Beta" }));
  });

  it("focuses the search when a mouse opens it", () => {
    renderField();
    press("mouse");
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Find"));
  });

  it("focuses the search when a pen opens it", () => {
    renderField();
    press("pen");
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Find"));
  });

  it("focuses the search when a key opens it", () => {
    renderField();
    trigger().focus();
    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.click(trigger());
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Find"));
  });

  it("keeps a key's opening on the search after a touch", () => {
    renderField();
    press("touch");
    fireEvent.click(trigger());
    trigger().focus();
    fireEvent.keyDown(trigger(), { key: "Enter" });
    fireEvent.click(trigger());
    expect(document.activeElement).toBe(screen.getByPlaceholderText("Find"));
  });

  it("leaves the focus on the trigger when a touch finds no enabled option", () => {
    renderField(OPTIONS.map((option) => ({ ...option, disabled: true })));
    press("touch");
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(document.activeElement).toBe(trigger());
  });
});
