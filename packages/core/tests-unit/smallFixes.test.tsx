/* Two corrections at the edges: a toast of endless duration stays, and the
   palette shortcut answers the physical K key on non-Latin layouts. */

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render } from "@testing-library/react";
import { leavesByItself } from "../src/components/Toast/useToastTimers";
import { useCommandPaletteShortcut } from "../src/components/CommandPalette";

describe("leavesByItself", () => {
  it("keeps a toast of endless duration, as 0 does", () => {
    expect(leavesByItself({ duration: Infinity } as never, 5000)).toBe(false);
    expect(leavesByItself({ duration: 0 } as never, 5000)).toBe(false);
    expect(leavesByItself({ duration: 3000 } as never, 5000)).toBe(true);
  });
});

describe("palette shortcut on other layouts", () => {
  it("opens on the physical K key where key is a Cyrillic letter", () => {
    const onOpen = vi.fn();
    function Shortcut() {
      useCommandPaletteShortcut(onOpen);
      return null;
    }
    render(<Shortcut />);
    fireEvent.keyDown(window, { key: "л", code: "KeyK", ctrlKey: true });
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
