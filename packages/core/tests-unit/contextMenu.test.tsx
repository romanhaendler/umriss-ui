/* The context menu (schedule 01): a menu that opens at a point, not under a
   trigger. Tested the way the menu is - keyboard cycle, focus return, portal -
   plus its one novelty, the position. jsdom has no layout, so the position is
   observed where it can be: on the anchor the panel hangs from, which stands
   at the point. */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { ContextMenu } from "../src/components/ContextMenu";
import { MenuItem, MenuSeparator } from "../src/components/Menu";

function Harness({ onFirst = vi.fn(), onThird = vi.fn() }) {
  const [at, setAt] = useState<{ x: number; y: number } | null>(null);
  return (
    <div>
      <button type="button" onContextMenu={(e) => { e.preventDefault(); setAt({ x: 120, y: 80 }); }}>
        Surface
      </button>
      <button type="button">Elsewhere</button>
      <ContextMenu
        open={at !== null}
        position={at ?? { x: 0, y: 0 }}
        onOpenChange={(open) => { if (!open) setAt(null); }}
        ariaLabel="Actions for the surface"
      >
        <MenuItem onSelect={onFirst}>Split</MenuItem>
        <MenuItem disabled>Merge</MenuItem>
        <MenuSeparator />
        <MenuItem onSelect={onThird}>Remove</MenuItem>
      </ContextMenu>
      <p data-testid="outside-portal">not the panel</p>
    </div>
  );
}

const surface = () => screen.getByRole("button", { name: "Surface" });

function openAtPoint() {
  surface().focus();
  fireEvent.contextMenu(surface());
}

describe("ContextMenu - opening at a point", () => {
  it("stays closed until it is opened", () => {
    render(<Harness />);
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("opens as a named menu", () => {
    render(<Harness />);
    openAtPoint();
    expect(screen.getByRole("menu", { name: "Actions for the surface" })).toBeTruthy();
  });

  it("hangs from an anchor that stands at the point", () => {
    render(<Harness />);
    openAtPoint();
    const anchor = document.querySelector<HTMLElement>("[data-context-menu-anchor]");
    expect(anchor).not.toBeNull();
    expect(anchor!.style.position).toBe("fixed");
    expect(anchor!.style.left).toBe("120px");
    expect(anchor!.style.top).toBe("80px");
  });

  it("portals the panel out of the tree it was declared in", () => {
    const { container } = render(<Harness />);
    openAtPoint();
    const menu = screen.getByRole("menu");
    expect(container.contains(menu)).toBe(false);
    expect(document.body.contains(menu)).toBe(true);
  });
});

describe("ContextMenu - keyboard", () => {
  it("puts the focus on the first entry that can be chosen", () => {
    render(<Harness />);
    openAtPoint();
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Split" }));
  });

  it("cycles with the arrow keys and skips a disabled entry", () => {
    render(<Harness />);
    openAtPoint();
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Remove" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowDown" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Split" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Remove" }));
  });

  it("jumps with Home and End", () => {
    render(<Harness />);
    openAtPoint();
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Remove" }));
    fireEvent.keyDown(document.activeElement!, { key: "Home" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Split" }));
  });
});

describe("ContextMenu - closing", () => {
  it("runs an entry and closes, with the focus back where it was", () => {
    const reported = vi.fn();
    render(<Harness onThird={reported} />);
    openAtPoint();
    fireEvent.click(screen.getByRole("menuitem", { name: "Remove" }));
    expect(reported).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(surface());
  });

  it("closes with Escape and gives the focus back", () => {
    render(<Harness />);
    openAtPoint();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(document.activeElement).toBe(surface());
  });

  it("closes on a pointer press outside", () => {
    render(<Harness />);
    openAtPoint();
    fireEvent.mouseDown(screen.getByRole("button", { name: "Elsewhere" }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
