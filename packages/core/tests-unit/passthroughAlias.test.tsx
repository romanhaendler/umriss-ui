/* The old name `ariaLabel` still names a Popover and a ContextMenu for one more
   minor and warns in development - once for the name, whichever component uses
   it first. A file of its own, so that no earlier test has spent the warning. */

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import * as core from "../src";

const noop = () => undefined;

describe("ariaLabel on Popover and ContextMenu", () => {
  it("works as aria-label and warns exactly once", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const anchor = { current: document.body };
    const popover = render(
      <core.Popover open onOpenChange={noop} anchorRef={anchor} role="dialog" ariaLabel="Old filter">
        x
      </core.Popover>,
    );
    expect(document.querySelector('[role="dialog"]')?.getAttribute("aria-label")).toBe("Old filter");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0]![0])).toContain("ariaLabel");
    popover.unmount();
    render(
      <core.ContextMenu open onOpenChange={noop} position={{ x: 1, y: 1 }} ariaLabel="Old row">
        <core.MenuItem>Open</core.MenuItem>
      </core.ContextMenu>,
    );
    expect(document.querySelector('[role="menu"]')?.getAttribute("aria-label")).toBe("Old row");
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });
});

describe("Combobox field defaults", () => {
  it("a caller's autoComplete and enterKeyHint win", () => {
    const { getByRole } = render(
      <core.Combobox options={[]} value={null} onChange={noop} aria-label="Tag" enterKeyHint="go" {...({ autoComplete: "on" } as object)} />,
    );
    expect(getByRole("combobox").getAttribute("autocomplete")).toBe("on");
    expect(getByRole("combobox").getAttribute("enterkeyhint")).toBe("go");
  });
});
