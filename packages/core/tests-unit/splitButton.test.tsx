/* The button group and the split button (foundation-primitives 07).

   The core of the check: the main action and the trigger are two separate ways.
   A click on the main action must not open anything, and a click on the trigger
   must not fire the main action - otherwise the split button would be a trap.

   Position is not checked here; jsdom has no layout. That the panel sits
   correctly is assured by Popover/position.ts. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ButtonGroup, SplitButton } from "../src/components/ButtonGroup";
import { MenuItem } from "../src/components/Menu";

function Harness({ onMain = vi.fn(), onFirst = vi.fn(), disabled = false }) {
  return (
    <SplitButton
      onClick={onMain}
      disabled={disabled}
      menu={
        <>
          <MenuItem onSelect={onFirst}>Als Excel</MenuItem>
          <MenuItem onSelect={vi.fn()}>Als PDF</MenuItem>
        </>
      }
    >
      Exportieren
    </SplitButton>
  );
}

const mainAction = () => screen.getByRole("button", { name: "Exportieren" });
const trigger = () => screen.getByRole("button", { name: "More actions" });

describe("ButtonGroup", () => {
  it("gathers the buttons into a group", () => {
    render(
      <ButtonGroup aria-label="Choose a view">
        <button type="button">Liste</button>
        <button type="button">Grid</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Choose a view" });
    expect(group.querySelectorAll("button")).toHaveLength(2);
  });
});

describe("SplitButton - two separate ways", () => {
  it("fires the main action without opening anything", () => {
    const reported = vi.fn();
    render(<Harness onMain={reported} />);
    fireEvent.click(mainAction());
    expect(reported).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens the menu without firing the main action", () => {
    const reported = vi.fn();
    render(<Harness onMain={reported} />);
    fireEvent.click(trigger());
    expect(screen.getByRole("menu")).toBeTruthy();
    expect(reported).not.toHaveBeenCalled();
  });

  it("names the trigger, so that it does not stay nameless", () => {
    render(<Harness />);
    expect(trigger()).toBeTruthy();
  });

  it("takes a label of its own for the trigger", () => {
    render(
      <SplitButton menuLabel="Weitere Exportformate" menu={<MenuItem onSelect={vi.fn()}>X</MenuItem>}>
        Exportieren
      </SplitButton>,
    );
    expect(screen.getByRole("button", { name: "Weitere Exportformate" })).toBeTruthy();
  });
});

describe("SplitButton - the menu comes from the popover seam", () => {
  it("runs an entry and closes", () => {
    const reported = vi.fn();
    render(<Harness onFirst={reported} />);
    fireEvent.click(trigger());
    fireEvent.click(screen.getByRole("menuitem", { name: "Als Excel" }));
    expect(reported).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("closes with Escape and gives the focus back", () => {
    render(<Harness />);
    fireEvent.click(trigger());
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it("reports on the trigger whether it is open", () => {
    render(<Harness />);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger());
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
  });
});

describe("SplitButton - locked", () => {
  it("locks both ways", () => {
    const reported = vi.fn();
    render(<Harness onMain={reported} disabled />);
    expect((mainAction() as HTMLButtonElement).disabled).toBe(true);
    expect((trigger() as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(mainAction());
    expect(reported).not.toHaveBeenCalled();
  });
});
