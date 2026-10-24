/* A dialog-role Popover takes the focus in when it opens; the outside click
   is judged on the event's composed path, so it holds inside a shadow root. */

import { describe, expect, it } from "vitest";
import { createRoot } from "react-dom/client";
import { act, useRef, useState } from "react";
import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { UmrissProvider } from "../src/lib/provider";
import { Popover } from "../src/components/Popover/Popover";

function Setup({ role, children }: { role?: "dialog" | "menu"; children: ReactNode }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button ref={anchorRef}>Trigger</button>
      <Popover open={open} onOpenChange={setOpen} anchorRef={anchorRef} role={role} ariaLabel="Surface">
        {children}
      </Popover>
    </div>
  );
}

describe("Popover - focus into a dialog", () => {
  it("focuses the first focusable element", () => {
    render(
      <Setup role="dialog">
        <p>Text</p>
        <button>First</button>
        <button>Second</button>
      </Setup>,
    );
    expect(document.activeElement).toBe(screen.getByText("First"));
  });

  it("focuses the panel itself when nothing in it is focusable", () => {
    render(
      <Setup role="dialog">
        <p>Text</p>
      </Setup>,
    );
    expect(document.activeElement).toBe(screen.getByRole("dialog"));
  });

  it("leaves focus where the content put it", () => {
    render(
      <Setup role="dialog">
        <button>First</button>
        <input aria-label="Own" autoFocus />
      </Setup>,
    );
    expect(document.activeElement).toBe(screen.getByLabelText("Own"));
  });

  it("does not move focus for other roles", () => {
    render(
      <Setup role="menu">
        <button>First</button>
      </Setup>,
    );
    expect(document.activeElement).toBe(document.body);
  });
});

describe("Popover - shadow root", () => {
  it("stays open on a click inside and closes on a click outside", async () => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    shadow.appendChild(mount);
    const root = createRoot(mount);
    await act(async () => {
      root.render(
        <UmrissProvider portalTarget={mount}>
          <Setup role="dialog">
            <button>Inside</button>
          </Setup>
        </UmrissProvider>,
      );
    });
    const inside = shadow.querySelector("[role=dialog] button") as HTMLElement;
    expect(inside).toBeTruthy();
    fireEvent.mouseDown(inside);
    expect(shadow.querySelector("[role=dialog]")).toBeTruthy();
    fireEvent.mouseDown(document.body);
    expect(shadow.querySelector("[role=dialog]")).toBeNull();
    await act(async () => root.unmount());
    host.remove();
  });
});
