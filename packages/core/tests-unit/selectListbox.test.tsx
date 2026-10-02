/* The select draws its own list under a pointer and the keys (ADR-0043); a
   finger, `multiple` and a disabled select keep the system's. The <select>
   stays the field: the value, the change event and the form are its own. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Select } from "../src/components/Select";

const CENTRES = (
  <>
    <option value="" disabled>
      Choose a cost centre
    </option>
    <option value="1100">CC-1100 Sales</option>
    <option value="1200">CC-1200 Marketing</option>
    <option value="2100" disabled>
      CC-2100 Engineering
    </option>
    <option value="2200">CC-2200 Design</option>
  </>
);

/** A press as a mouse or a finger makes it: the pointer first, then the mouse event. */
const press = (element: Element, pointerType = "mouse") => {
  fireEvent.pointerDown(element, { pointerType, button: 0 });
  return fireEvent.mouseDown(element, { button: 0 });
};

const select = () => screen.getByRole("combobox") as HTMLSelectElement;
const listbox = () => screen.queryByRole("listbox");
/** Our list's own options and groups - the select's native ones carry the same roles. */
const inList = () => within(screen.getByRole("listbox"));

describe("Select - its own list", () => {
  it("opens under a mouse instead of the system's list", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    // fireEvent returns false when the default - the system's list - was prevented.
    expect(press(select())).toBe(false);
    expect(listbox()).not.toBeNull();
    expect(inList().getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Choose a cost centre",
      "CC-1100 Sales",
      "CC-1200 Marketing",
      "CC-2100 Engineering",
      "CC-2200 Design",
    ]);
    expect(select().getAttribute("aria-expanded")).toBe("true");
    expect(document.activeElement).toBe(select());
    // A second press closes it.
    press(select());
    expect(listbox()).toBeNull();
  });

  it("leaves a finger the system's picker", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    expect(press(select(), "touch")).toBe(true);
    expect(listbox()).toBeNull();
  });

  it("stays native with multiple and when disabled", () => {
    const { rerender } = render(
      <Select aria-label="Cost centre" multiple defaultValue={[]}>
        {CENTRES}
      </Select>,
    );
    expect(press(screen.getByRole("listbox"))).toBe(true);
    expect(screen.getAllByRole("listbox")).toHaveLength(1);
    rerender(
      <Select aria-label="Cost centre" disabled defaultValue="">
        {CENTRES}
      </Select>,
    );
    press(select());
    expect(listbox()).toBeNull();
  });

  it("chooses by the pointer: the select's value and its change event", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Cost centre" defaultValue="" onChange={(event) => onChange(event.target.value)}>
        {CENTRES}
      </Select>,
    );
    press(select());
    fireEvent.click(inList().getByRole("option", { name: "CC-1200 Marketing" }));
    expect(onChange).toHaveBeenCalledWith("1200");
    expect(select().value).toBe("1200");
    expect(listbox()).toBeNull();
    expect(document.activeElement).toBe(select());
  });

  it("does not choose a disabled option", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Cost centre" defaultValue="" onChange={onChange}>
        {CENTRES}
      </Select>,
    );
    press(select());
    fireEvent.click(inList().getByRole("option", { name: "CC-2100 Engineering" }));
    expect(onChange).not.toHaveBeenCalled();
    expect(listbox()).not.toBeNull();
  });

  it("a controlled select stays at its prop, and moves with it", () => {
    function Controlled({ follow }: { follow: boolean }) {
      const [value, setValue] = useState("1100");
      return (
        <Select aria-label="Cost centre" value={value} onChange={(event) => follow && setValue(event.target.value)}>
          {CENTRES}
        </Select>
      );
    }
    const { unmount } = render(<Controlled follow={false} />);
    press(select());
    fireEvent.click(inList().getByRole("option", { name: "CC-2200 Design" }));
    expect(select().value).toBe("1100");
    unmount();

    render(<Controlled follow />);
    press(select());
    fireEvent.click(inList().getByRole("option", { name: "CC-2200 Design" }));
    expect(select().value).toBe("2200");
  });

  it("marks the chosen option and opens on it", () => {
    render(<Select aria-label="Cost centre" defaultValue="1200">{CENTRES}</Select>);
    press(select());
    const chosen = inList().getByRole("option", { name: "CC-1200 Marketing" });
    expect(chosen.getAttribute("aria-selected")).toBe("true");
    expect(select().getAttribute("aria-activedescendant")).toBe(chosen.id);
  });

  /* The empty value is the placeholder, as the select's own muted colour
     says: it stands in the list, never as the choice. */
  it("does not mark the placeholder as chosen", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    press(select());
    expect(inList().getByRole("option", { name: "Choose a cost centre" }).getAttribute("aria-selected")).toBe("false");
  });

  it("draws an optgroup as a group with its label", () => {
    render(
      <Select aria-label="Depot" defaultValue="ham">
        <optgroup label="North">
          <option value="ham">Hamburg</option>
          <option value="kie">Kiel</option>
        </optgroup>
        <optgroup label="South" disabled>
          <option value="muc">Munich</option>
        </optgroup>
      </Select>,
    );
    press(select());
    const groups = inList().getAllByRole("group");
    expect(groups.map((group) => group.textContent)).toEqual(["NorthHamburgKiel", "SouthMunich"]);
    expect(inList().getByRole("option", { name: "Munich" }).getAttribute("aria-disabled")).toBe("true");
  });
});

describe("Select - its keys", () => {
  it("opens on the keys that open a system's list, on the chosen option", () => {
    for (const init of [{ key: "ArrowDown" }, { key: "ArrowUp" }, { key: " " }, { key: "F4" }, { key: "ArrowDown", altKey: true }]) {
      const { unmount } = render(<Select aria-label="Cost centre" defaultValue="1200">{CENTRES}</Select>);
      // fireEvent returns false when the default was prevented.
      expect(fireEvent.keyDown(select(), init), JSON.stringify(init)).toBe(false);
      expect(listbox(), JSON.stringify(init)).not.toBeNull();
      expect(select().getAttribute("aria-activedescendant")).toBe(
        inList().getByRole("option", { name: "CC-1200 Marketing" }).id,
      );
      unmount();
    }
  });

  it("leaves typing in a closed select to the system", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    expect(fireEvent.keyDown(select(), { key: "c" })).toBe(true);
    expect(listbox()).toBeNull();
  });

  /* A closed select does nothing on Enter and passes it on - a form submits,
     a table's grid commits its edit (ADR-0036). The Combobox's Enter opens
     nothing either. */
  it("passes Enter on while closed", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    expect(fireEvent.keyDown(select(), { key: "Enter" })).toBe(true);
    expect(listbox()).toBeNull();
  });

  it("moves with the arrows, Home and End, and chooses with Enter", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Cost centre" defaultValue="1100" onChange={(event) => onChange(event.target.value)}>
        {CENTRES}
      </Select>,
    );
    const active = () => document.getElementById(select().getAttribute("aria-activedescendant") ?? "")?.textContent;
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    expect(active()).toBe("CC-1100 Sales");
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    expect(active()).toBe("CC-1200 Marketing");
    fireEvent.keyDown(select(), { key: "End" });
    expect(active()).toBe("CC-2200 Design");
    fireEvent.keyDown(select(), { key: "Home" });
    expect(active()).toBe("Choose a cost centre");
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    fireEvent.keyDown(select(), { key: "Enter" });
    expect(onChange).toHaveBeenCalledWith("1200");
    expect(listbox()).toBeNull();
  });

  it("jumps to the option typed, and does not choose a disabled one", () => {
    const onChange = vi.fn();
    render(
      <Select aria-label="Cost centre" defaultValue="" onChange={onChange}>
        {CENTRES}
      </Select>,
    );
    const active = () => document.getElementById(select().getAttribute("aria-activedescendant") ?? "")?.textContent;
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    fireEvent.keyDown(select(), { key: "C" });
    expect(active()).toBe("CC-1100 Sales");
    fireEvent.keyDown(select(), { key: "End" });
    fireEvent.keyDown(select(), { key: "ArrowUp" });
    expect(active()).toBe("CC-2100 Engineering");
    fireEvent.keyDown(select(), { key: "Enter" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("closes on Escape and on Tab", () => {
    render(<Select aria-label="Cost centre" defaultValue="">{CENTRES}</Select>);
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    fireEvent.keyDown(select(), { key: "Escape" });
    expect(listbox()).toBeNull();
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    fireEvent.keyDown(select(), { key: "Tab" });
    expect(listbox()).toBeNull();
  });

  it("a caller's onKeyDown and onMouseDown run first and can prevent", () => {
    render(
      <Select
        aria-label="Cost centre"
        defaultValue=""
        onKeyDown={(event) => event.preventDefault()}
        onMouseDown={(event) => event.preventDefault()}
      >
        {CENTRES}
      </Select>,
    );
    fireEvent.keyDown(select(), { key: "ArrowDown" });
    press(select());
    expect(listbox()).toBeNull();
  });
});
