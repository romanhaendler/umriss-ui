/* Popover behaviour (popover-seam). The position is not tested here - jsdom
   has no layout; position.test.ts does that. What counts here is what a
   person observes: is the surface there, where does the focus sit, what does
   the role report. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, useRef, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Popover } from "../src/components/Popover/Popover";
import { FormField, useFormField } from "../src/components/FormField";

function Setup({
  restoreFocus = true,
  withOutside = false,
}: {
  restoreFocus?: boolean;
  withOutside?: boolean;
}) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const outsideRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button ref={anchorRef} onClick={() => setOpen(true)}>
        Trigger
      </button>
      <button ref={outsideRef}>Clear</button>
      <button>Elsewhere</button>
      <Popover
        open={open}
        onOpenChange={setOpen}
        anchorRef={anchorRef}
        insideRefs={withOutside ? [outsideRef] : undefined}
        restoreFocus={restoreFocus}
        role="dialog"
        ariaLabel="Example surface"
      >
        <p>Content</p>
      </Popover>
    </div>
  );
}

describe("Popover – dismissing", () => {
  it("shows the surface with its role and name", () => {
    render(<Setup />);
    const surface = screen.getByRole("dialog", { name: "Example surface" });
    expect(surface).toBeTruthy();
    expect(surface.textContent).toContain("Content");
  });

  it("closes on a pointer press outside", () => {
    render(<Setup />);
    fireEvent.mouseDown(screen.getByText("Elsewhere"));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("does not close on a pointer press on the trigger", () => {
    render(<Setup />);
    fireEvent.mouseDown(screen.getByText("Trigger"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("does not close on a pointer press on an element declared as inside", () => {
    render(<Setup withOutside />);
    fireEvent.mouseDown(screen.getByText("Clear"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("does not close on a pointer press into the surface itself", () => {
    render(<Setup />);
    fireEvent.mouseDown(screen.getByText("Content"));
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });
});

describe("Popover – Escape and focus", () => {
  it("closes on Escape and gives the focus back to the trigger", () => {
    render(<Setup />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).toBe(screen.getByText("Trigger"));
  });

  /* The same key is the close request of a <dialog>: without the default
     prevented, a menu in a modal took the modal down with it. */
  it("keeps Escape to itself", () => {
    render(<Setup />);
    const escape = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    fireEvent(document, escape);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(escape.defaultPrevented).toBe(true);
  });

  it("does not give the focus back when that was declined", () => {
    render(<Setup restoreFocus={false} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(document.activeElement).not.toBe(screen.getByText("Trigger"));
  });

  it("does not take the focus back on an outside click", () => {
    render(<Setup />);
    const elsewhere = screen.getByText("Elsewhere");
    fireEvent.mouseDown(elsewhere);
    expect(document.activeElement).not.toBe(screen.getByText("Trigger"));
  });
});

/* HANDOFF A.5 §1: form elements in the panel must not inherit the field id of
   the trigger. Before this, that was a rule to remember - and it was broken
   twice. Now the primitive carries it. */
describe("Popover – field context", () => {
  function Probe({ report }: { report: (id: string | null) => void }) {
    const field = useFormField();
    report(field?.id ?? null);
    return null;
  }

  it("resets the FormField context inside the panel", () => {
    const inPanel = vi.fn();
    const inField = vi.fn();

    function Case() {
      const anchorRef = useRef<HTMLButtonElement>(null);
      return (
        <FormField label="Period">
          <Probe report={inField} />
          <button ref={anchorRef}>Trigger</button>
          <Popover open onOpenChange={() => {}} anchorRef={anchorRef} ariaLabel="Surface">
            <Probe report={inPanel} />
          </Popover>
        </FormField>
      );
    }

    render(<Case />);
    expect(inField).toHaveBeenCalledWith(expect.any(String));
    expect(inPanel).toHaveBeenCalledWith(null);
  });
});

/* A portal at the body does not reach the top layer of a <dialog>; a menu in
   a modal landed behind the dialog because of that. The primitive therefore
   portals into the nearest <dialog> ancestor of the anchor. */
describe("Popover – portal target", () => {
  it("portals into the nearest dialog ancestor", () => {
    function Case() {
      const anchorRef = useRef<HTMLButtonElement>(null);
      return (
        <dialog open data-testid="dialog">
          <button ref={anchorRef}>Trigger</button>
          <Popover open onOpenChange={() => {}} anchorRef={anchorRef} role="menu" ariaLabel="Surface">
            <span>In the dialog</span>
          </Popover>
        </dialog>
      );
    }
    render(<Case />);
    const dialog = screen.getByTestId("dialog");
    expect(dialog.contains(screen.getByRole("menu", { name: "Surface" }))).toBe(true);
  });

  it("otherwise portals into the body", () => {
    render(<Setup />);
    const surface = screen.getByRole("dialog", { name: "Example surface" });
    expect(surface.parentElement).toBe(document.body);
  });
});

/* visuelle-wertigkeit 02: the panel unfolds from its trigger and leaves
   faster than it came. Under reduced motion the path is dropped, never the
   state change - the panel then appears and goes at once, but it appears. The
   exit token is set on every element, as in toast.test.tsx: jsdom loads no
   tokens.css. */
describe("Popover – motion", () => {
  let style: HTMLStyleElement | null = null;
  const exitToken = (ms: number) => {
    style = document.createElement("style");
    style.textContent = `* { --u-duration-exit-fast: ${ms}ms; }`;
    document.head.append(style);
  };
  afterEach(() => {
    style?.remove();
    style = null;
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("carries its motion origin: below its trigger, aligned to the start, it grows from the top left", () => {
    render(<Setup />);
    expect(screen.getByRole("dialog").style.getPropertyValue("--_origin")).toBe("left top");
  });

  it("stays for its exit, inert, exactly as long as the token says", () => {
    vi.useFakeTimers();
    exitToken(100);
    render(<Setup />);
    fireEvent.keyDown(document, { key: "Escape" });
    const leaving = document.querySelector("[data-closing]");
    expect(leaving).not.toBeNull();
    expect(leaving?.hasAttribute("inert")).toBe(true);
    act(() => vi.advanceTimersByTime(99));
    expect(document.querySelector("[data-closing]")).not.toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(document.querySelector("[data-closing]")).toBeNull();
  });

  it("comes back whole when it is opened again during its exit", () => {
    vi.useFakeTimers();
    exitToken(100);
    render(<Setup />);
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByText("Trigger"));
    const surface = screen.getByRole("dialog");
    expect(surface.hasAttribute("data-closing")).toBe(false);
    expect(surface.hasAttribute("inert")).toBe(false);
    act(() => vi.advanceTimersByTime(200));
    expect(screen.queryByRole("dialog")).not.toBeNull();
  });

  it("under reduced motion appears at once, visible, and goes at once", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) => ({ matches: query.includes("reduce"), media: query }) as MediaQueryList,
    );
    exitToken(100);
    render(<Setup />);
    expect(screen.getByRole("dialog").style.opacity).toBe("");
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
