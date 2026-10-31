import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Menu, MenuItem } from "../src";

describe("MenuItem roles", () => {
  it("takes menuitemradio and menuitemcheckbox with aria-checked, and the keys reach them", () => {
    render(
      <Menu trigger={<button>Open</button>}>
        <MenuItem role="menuitemradio" aria-checked>One</MenuItem>
        <MenuItem role="menuitemradio" aria-checked={false}>Two</MenuItem>
        <MenuItem role="menuitemcheckbox" aria-checked={false}>Three</MenuItem>
        <MenuItem>Four</MenuItem>
      </Menu>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByRole("menuitemradio", { name: "One" }).getAttribute("aria-checked")).toBe("true");
    expect(document.activeElement).toBe(screen.getByRole("menuitemradio", { name: "One" }));
    fireEvent.keyDown(document.activeElement!, { key: "End" });
    expect(document.activeElement).toBe(screen.getByRole("menuitem", { name: "Four" }));
    fireEvent.keyDown(document.activeElement!, { key: "ArrowUp" });
    expect(document.activeElement).toBe(screen.getByRole("menuitemcheckbox", { name: "Three" }));
  });
});
