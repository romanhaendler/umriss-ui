/* IconButton (icon-button 02). A button that shows only an icon: its
   `aria-label` is required, it shows that name as a tooltip, and it is a Button underneath -
   so everything that holds a Button's element (a menu's anchor, a caller's
   ref) holds this one's too. */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, createRef } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { IconButton, Menu, MenuItem } from "../src";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

const show = () => act(() => vi.advanceTimersByTime(400));

describe("IconButton", () => {
  it("is named by its aria-label, and only once", () => {
    render(<IconButton aria-label="Export CSV">⤓</IconButton>);
    const button = screen.getByRole("button", { name: "Export CSV" });
    act(() => button.focus());
    show();
    expect(screen.getByRole("tooltip").textContent).toBe("Export CSV");
    expect(button.getAttribute("aria-describedby")).toBeNull();
  });

  it("shows its name under the pointer", () => {
    render(<IconButton aria-label="Refresh the tours">↻</IconButton>);
    fireEvent.pointerEnter(screen.getByRole("button"));
    show();
    expect(screen.getByRole("tooltip").textContent).toBe("Refresh the tours");
  });

  it("hands its element to the caller's ref through the tooltip", () => {
    const ref = createRef<HTMLButtonElement>();
    render(<IconButton ref={ref} aria-label="Close">×</IconButton>);
    expect(ref.current).toBe(screen.getByRole("button", { name: "Close" }));
  });

  it("is of type button unless told otherwise", () => {
    render(<IconButton aria-label="Close">×</IconButton>);
    expect(screen.getByRole("button").getAttribute("type")).toBe("button");
  });

  it("locks itself while loading and says it is busy", () => {
    const onClick = vi.fn();
    render(<IconButton aria-label="Refresh" loading onClick={onClick}>↻</IconButton>);
    const button = screen.getByRole("button", { name: "Refresh" });
    expect(button.getAttribute("aria-busy")).toBe("true");
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("anchors a menu, and its tooltip gives way while the menu is open", () => {
    render(
      <Menu trigger={<IconButton aria-label="Actions for INC-4711">⋯</IconButton>}>
        <MenuItem onSelect={() => {}}>Acknowledge</MenuItem>
      </Menu>,
    );
    const trigger = screen.getByRole("button", { name: "Actions for INC-4711" });
    fireEvent.click(trigger);
    act(() => vi.runOnlyPendingTimers());
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("menu")).toBeTruthy();
    fireEvent.pointerEnter(trigger);
    show();
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("hands its element to the caller's ref as a menu's trigger too", () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <Menu trigger={<IconButton ref={ref} aria-label="Actions for INC-4711">⋯</IconButton>}>
        <MenuItem onSelect={() => {}}>Acknowledge</MenuItem>
      </Menu>,
    );
    expect(ref.current).toBe(screen.getByRole("button", { name: "Actions for INC-4711" }));
  });

  it("does not type-check without a name", () => {
    // @ts-expect-error - `aria-label` is required: an icon alone names nothing.
    const unnamed = <IconButton>×</IconButton>;
    expect(unnamed).toBeTruthy();
  });
});
