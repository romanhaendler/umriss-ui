/* Overlays outside the page's own body: a foreign modal dialog (Radix, Headless
   UI), a shadow root, an iframe; one Escape for one layer; a panel with a role
   and a name; a panel whose anchor was scrolled away; the visual viewport. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { act, useRef } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import type { Root } from "react-dom/client";
import { fireEvent, render, screen } from "@testing-library/react";
import { Popover, useCommandPaletteShortcut } from "../src";
import { announce } from "../src/lib/announce";
import { clippedAway } from "../src/components/Popover/position";
import { fixedOrigin, portalTargetFor } from "../src/lib/portalTarget";
import { useVisualViewportBox } from "../src/lib/visualViewport";

/* Roots made by hand are unmounted, or their open panels stay in the list of
   layers for the tests after them. */
const roots: Root[] = [];
const mountHere = (mount: Element, node: ReactNode) => {
  const root = createRoot(mount);
  roots.push(root);
  act(() => root.render(node));
};

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()));
  vi.useRealTimers();
});

function Anchored({ onOpenChange = () => undefined, label }: { onOpenChange?: (open: boolean) => void; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <>
      <button ref={ref}>anchor</button>
      <Popover open onOpenChange={onOpenChange} anchorRef={ref} aria-label={label}>
        <span>panel text</span>
      </Popover>
    </>
  );
}

describe("a foreign modal dialog", () => {
  it("takes a Popover opened inside it, where it is visible and clickable", () => {
    const { container } = render(
      <div role="dialog" aria-modal="true" data-testid="radix">
        <Anchored />
      </div>,
    );
    expect(screen.getByTestId("radix").contains(screen.getByText("panel text"))).toBe(true);
    expect(container.querySelector("body > div > span")).toBeNull();
  });

  it("is not taken for a modal when it is not one", () => {
    render(
      <div role="dialog" data-testid="plain">
        <Anchored />
      </div>,
    );
    expect(screen.getByTestId("plain").contains(screen.getByText("panel text"))).toBe(false);
  });

  it("lets Escape close the top layer and not the dialog", () => {
    const dialogEscape = vi.fn();
    document.addEventListener("keydown", dialogEscape, true);
    const onOpenChange = vi.fn();
    render(
      <div role="dialog" aria-modal="true">
        <Anchored onOpenChange={onOpenChange} />
      </div>,
    );
    fireEvent.keyDown(screen.getByText("panel text"), { key: "Escape" });
    document.removeEventListener("keydown", dialogEscape, true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(dialogEscape).not.toHaveBeenCalled();
  });
});

describe("a shadow root", () => {
  function mountInShadow(node: ReactNode) {
    const host = document.createElement("div");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    shadow.append(mount);
    mountHere(mount, node);
    return shadow;
  }

  it("keeps a Popover in its root, not in the body", () => {
    const shadow = mountInShadow(<Anchored />);
    expect(shadow.textContent).toContain("panel text");
    expect(document.body.querySelector(":scope > span")).toBeNull();
    expect(portalTargetFor(shadow.querySelector("button"), () => document.body)).toBe(shadow);
  });

  it("keeps the announcer in its root", () => {
    vi.useFakeTimers();
    const shadow = mountInShadow(<button>anchor</button>);
    announce("three results", shadow.querySelector("button"));
    act(() => vi.advanceTimersByTime(500));
    expect(shadow.querySelector("[data-umriss-announcer]")?.textContent).toBe("three results");
    expect(document.querySelector("body > [data-umriss-announcer]")).toBeNull();
  });

  it("does not open the palette for a '/' typed in an input of the root", () => {
    const onOpen = vi.fn();
    function Shortcut() {
      useCommandPaletteShortcut(onOpen);
      return <input aria-label="inside" />;
    }
    const shadow = mountInShadow(<Shortcut />);
    const input = shadow.querySelector("input")!;
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true, composed: true }));
    expect(onOpen).not.toHaveBeenCalled();
    document.body.dispatchEvent(new KeyboardEvent("keydown", { key: "/", bubbles: true }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("an iframe", () => {
  it("keeps a Popover in the frame's document and listens there", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const doc = frame.contentDocument!;
    const mount = doc.createElement("div");
    doc.body.append(mount);
    const onOpenChange = vi.fn();
    mountHere(mount, <Anchored onOpenChange={onOpenChange} />);
    expect(doc.body.textContent).toContain("panel text");
    expect(document.body.textContent).not.toContain("panel text");
    doc.dispatchEvent(new (doc.defaultView as unknown as typeof globalThis).KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("binds the palette shortcut to a given window", () => {
    const frame = document.createElement("iframe");
    document.body.append(frame);
    const win = frame.contentWindow!;
    const onOpen = vi.fn();
    function Shortcut() {
      useCommandPaletteShortcut(onOpen, { target: win });
      return null;
    }
    render(<Shortcut />);
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "/" }));
    expect(onOpen).not.toHaveBeenCalled();
    win.dispatchEvent(new (win as unknown as typeof globalThis).KeyboardEvent("keydown", { key: "/" }));
    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});

describe("two copies of the library", () => {
  it("share one list of open layers, so that one Escape closes one", () => {
    const stack = (globalThis as unknown as Record<symbol, object[] | undefined>)[Symbol.for("umriss.openPopovers")];
    const before = stack?.length ?? 0;
    const first = vi.fn();
    const second = vi.fn();
    render(
      <>
        <Anchored onOpenChange={first} />
        <Anchored onOpenChange={second} />
      </>,
    );
    expect(stack).toHaveLength(before + 2);
    fireEvent.keyDown(document.body, { key: "Escape" });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});

describe("a Popover's semantics", () => {
  it("is a dialog named by its anchor, and the anchor points at it", () => {
    render(<Anchored />);
    const anchor = screen.getByRole("button", { name: "anchor" });
    const panel = screen.getByRole("dialog", { name: "anchor" });
    expect(anchor.getAttribute("aria-expanded")).toBe("true");
    expect(anchor.getAttribute("aria-controls")).toBe(panel.id);
  });

  it("takes the name it is given and leaves the anchor's own attributes alone", () => {
    function Own() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={ref} id="mine" aria-expanded="false" aria-controls="other">
            anchor
          </button>
          <Popover open onOpenChange={() => undefined} anchorRef={ref} aria-label="Filters">
            x
          </Popover>
        </>
      );
    }
    render(<Own />);
    const anchor = screen.getByRole("button", { name: "anchor" });
    expect(screen.getByRole("dialog", { name: "Filters" })).toBeTruthy();
    expect(anchor.getAttribute("aria-expanded")).toBe("false");
    expect(anchor.getAttribute("aria-controls")).toBe("other");
  });
});

describe("an anchor scrolled out of a clipping container", () => {
  it("is told by the box of the container", () => {
    document.body.innerHTML = '<div id="clip" style="overflow:auto"><button id="a">a</button></div>';
    const clip = document.getElementById("clip")!;
    const anchor = document.getElementById("a")!;
    const box = (top: number, bottom: number) => ({ top, bottom, left: 0, right: 100 }) as DOMRect;
    clip.getBoundingClientRect = () => box(0, 100);
    anchor.getBoundingClientRect = () => box(20, 40);
    expect(clippedAway(anchor)).toBe(false);
    anchor.getBoundingClientRect = () => box(-80, -60);
    expect(clippedAway(anchor)).toBe(true);
  });
});

describe("a fixed box inside an element", () => {
  it("counts from the body unchanged", () => {
    expect(fixedOrigin(document.body)).toEqual({ x: 0, y: 0 });
  });
});

describe("the visual viewport", () => {
  it("is written onto the element while the page is zoomed, and removed after", () => {
    const listeners = new Map<string, () => void>();
    const viewport = {
      scale: 2,
      offsetLeft: 10,
      offsetTop: 20,
      width: 400,
      height: 300,
      addEventListener: (type: string, fn: () => void) => listeners.set(type, fn),
      removeEventListener: () => undefined,
    };
    Object.defineProperty(window, "visualViewport", { value: viewport, configurable: true });
    function Box() {
      const ref = useRef<HTMLDivElement>(null);
      useVisualViewportBox(ref, true);
      return <div ref={ref} data-testid="box" />;
    }
    render(<Box />);
    const box = screen.getByTestId("box");
    expect(box.style.getPropertyValue("--_vv-x")).toBe("10px");
    expect(box.style.getPropertyValue("--_vv-h")).toBe("300px");
    viewport.scale = 1;
    act(() => listeners.get("resize")?.());
    expect(box.style.getPropertyValue("--_vv-x")).toBe("");
    Object.defineProperty(window, "visualViewport", { value: undefined, configurable: true });
  });
});
