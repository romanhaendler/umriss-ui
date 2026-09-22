/* The dock (floating-dock 02, 03, 05).

   What is checked is what a person observes: where the tab stop stands, where
   the arrow keys lead, what is marked and what is reported. What is not checked
   is the zone arithmetic - that stands in dockPlace.test.ts, purely and without
   a DOM - and not the transition: an animation that does not take place in jsdom
   cannot be observed there either (ADR-0014, ticket 04).

   The models are baumBedienung.test.tsx (the keyboard) and tag.test.tsx (the
   roving tab stop). */

import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { Dock, type DockPlace, type DockTool } from "../src/components/Dock";

const GLYPH = <svg aria-hidden="true" />;

const TOOLS: DockTool[] = [
  { id: "zoom-in", label: "Zoom in", icon: GLYPH },
  { id: "zoom-out", label: "Zoom out", icon: GLYPH, disabled: true },
  { id: "raster", label: "Grid", icon: GLYPH },
  { id: "messen", label: "Measure", icon: GLYPH },
];

function Harness(props: Partial<React.ComponentProps<typeof Dock>> = {}) {
  return (
    <div style={{ position: "relative" }}>
      <Dock data-testid="dock" tools={TOOLS} {...props} />
    </div>
  );
}

const grip = () => screen.getByRole("button", { name: "Move dock" });
const strip = () => screen.getByRole("group");
const placeNow = () => strip().getAttribute("data-place");
const tool = (name: string) => screen.getByRole("button", { name });
const tools = () =>
  Array.from(strip().querySelectorAll<HTMLButtonElement>("[data-tool]"));

/** Gives the host an extent. jsdom reports every element as zero-sized, and
    without a rectangle there are no zones. */
function giveHostAnArea(width = 800, height = 400) {
  const root = screen.getByTestId("dock");
  root.getBoundingClientRect = () =>
    ({
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      width,
      height,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    }) as DOMRect;
}

describe("Dock - the resting state", () => {
  it("lies at the bottom without a value", () => {
    render(<Harness />);
    expect(placeNow()).toBe("bottom");
  });

  it("starts at defaultPlace", () => {
    render(<Harness defaultPlace="right" />);
    expect(placeNow()).toBe("right");
  });

  it("names every tool, without anybody having to point at it", () => {
    render(<Harness />);
    for (const t of TOOLS) expect(tool(t.label)).toBeTruthy();
  });

  it("still shows disabled tools", () => {
    render(<Harness />);
    expect((tool("Zoom out") as HTMLButtonElement).disabled).toBe(true);
    expect(tools()).toHaveLength(4);
  });
});

describe("Dock - one tab stop for the grip, a roving one for the tools", () => {
  it("gives the grip a stop of its own and the tools one between them", () => {
    render(<Harness />);
    expect(grip().tabIndex).toBe(0);
    const stops = tools().filter((t) => t.tabIndex === 0);
    expect(stops).toHaveLength(1);
    // The first USABLE one - the disabled second does not carry it.
    expect(stops[0]?.getAttribute("data-tool")).toBe("zoom-in");
  });

  it("runs across the tools with the arrow keys and skips disabled ones", () => {
    render(<Harness />);
    const first = tool("Zoom in");
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    // "Zoom out" is disabled and is passed over.
    expect(document.activeElement).toBe(tool("Grid"));
    fireEvent.keyDown(tool("Grid"), { key: "ArrowRight" });
    expect(document.activeElement).toBe(tool("Measure"));
  });

  it("runs all the way round", () => {
    render(<Harness />);
    const last = tool("Measure");
    act(() => last.focus());
    fireEvent.keyDown(last, { key: "ArrowRight" });
    expect(document.activeElement).toBe(tool("Zoom in"));
    fireEvent.keyDown(tool("Zoom in"), { key: "ArrowLeft" });
    expect(document.activeElement).toBe(tool("Measure"));
  });

  it("listens on both axes, because the transition changes which one runs along", () => {
    render(<Harness />);
    const first = tool("Zoom in");
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowDown" });
    expect(document.activeElement).toBe(tool("Grid"));
    fireEvent.keyDown(tool("Grid"), { key: "ArrowUp" });
    expect(document.activeElement).toBe(tool("Zoom in"));
  });

  it("gives only one tool the stop after the arrows have run", () => {
    render(<Harness />);
    const first = tool("Zoom in");
    act(() => first.focus());
    fireEvent.keyDown(first, { key: "ArrowRight" });
    expect(tools().filter((t) => t.tabIndex === 0)).toHaveLength(1);
    expect(tool("Grid").tabIndex).toBe(0);
  });
});

describe("Dock - the four arrows on the grip", () => {
  it("reaches all four from every place, absolutely and not relatively", () => {
    render(<Harness />);
    giveHostAnArea();
    const keys: Array<[string, DockPlace]> = [
      ["ArrowUp", "top"],
      ["ArrowRight", "right"],
      ["ArrowDown", "bottom"],
      ["ArrowLeft", "left"],
    ];
    for (const [key, place] of keys) {
      fireEvent.keyDown(grip(), { key });
      expect(placeNow()).toBe(place);
    }
    // And once more across, so that "absolutely" is really checked.
    fireEvent.keyDown(grip(), { key: "ArrowRight" });
    expect(placeNow()).toBe("right");
    fireEvent.keyDown(grip(), { key: "ArrowUp" });
    expect(placeNow()).toBe("top");
  });

  it("reports every change exactly once", () => {
    const reported = vi.fn();
    render(<Harness onPlaceChange={reported} />);
    giveHostAnArea();
    fireEvent.keyDown(grip(), { key: "ArrowLeft" });
    expect(reported).toHaveBeenCalledExactlyOnceWith("left");
    // The same place once more is not a change.
    fireEvent.keyDown(grip(), { key: "ArrowLeft" });
    expect(reported).toHaveBeenCalledTimes(1);
  });

  it("lets other keys through instead of swallowing them", () => {
    render(<Harness />);
    const event = fireEvent.keyDown(grip(), { key: "Enter" });
    expect(event).toBe(true);
  });
});

describe("Dock - controlled", () => {
  it("does not move itself but reports and waits", () => {
    const reported = vi.fn();
    render(<Harness place="bottom" onPlaceChange={reported} />);
    giveHostAnArea();
    fireEvent.keyDown(grip(), { key: "ArrowRight" });
    expect(reported).toHaveBeenCalledWith("right");
    expect(placeNow()).toBe("bottom");
  });

  it("follows the caller when it brings the place along", () => {
    function Controlled() {
      const [place, setPlace] = useState<DockPlace>("bottom");
      return (
        <div style={{ position: "relative" }}>
          <Dock data-testid="dock" tools={TOOLS} place={place} onPlaceChange={setPlace} />
        </div>
      );
    }
    render(<Controlled />);
    giveHostAnArea();
    fireEvent.keyDown(grip(), { key: "ArrowRight" });
    expect(placeNow()).toBe("right");
  });
});

describe("Dock - the mode", () => {
  it("marks nothing as long as none is set", () => {
    render(<Harness />);
    for (const t of tools()) expect(t.hasAttribute("aria-pressed")).toBe(false);
  });

  it("marks exactly one when one is set", () => {
    render(<Harness mode="raster" />);
    const pressed = tools().filter((t) => t.hasAttribute("aria-pressed"));
    expect(pressed).toHaveLength(1);
    expect(pressed[0]?.getAttribute("data-tool")).toBe("raster");
    expect(pressed[0]?.getAttribute("aria-pressed")).toBe("true");
  });

  it("does NOT say of the others that they were switched-off switches", () => {
    render(<Harness mode="raster" />);
    /* `aria-pressed="false"` would mean "this is a switch that is currently
       off". But which tools are modes is known only to the caller - in the demo
       it is two out of five. So only the mode carries the attribute. */
    expect(tool("Measure").hasAttribute("aria-pressed")).toBe(false);
    expect(tool("Zoom in").hasAttribute("aria-pressed")).toBe(false);
  });

  it("invents no mode when a tool is taken", () => {
    const changed = vi.fn();
    render(<Harness onUse={vi.fn()} onModeChange={changed} />);
    fireEvent.click(tool("Grid"));
    expect(changed).not.toHaveBeenCalled();
  });

  it("reports a change only if it really is one", () => {
    const changed = vi.fn();
    render(<Harness mode="raster" onModeChange={changed} />);
    fireEvent.click(tool("Grid"));
    expect(changed).not.toHaveBeenCalled();
    fireEvent.click(tool("Measure"));
    expect(changed).toHaveBeenCalledExactlyOnceWith("messen");
  });

  it("reports every taking through onUse", () => {
    const taken = vi.fn();
    render(<Harness onUse={taken} />);
    fireEvent.click(tool("Measure"));
    expect(taken).toHaveBeenCalledExactlyOnceWith("messen");
  });
});

describe("Dock - the drag on the grip", () => {
  const drag = (x: number, y: number) =>
    fireEvent.pointerMove(grip(), { pointerId: 1, clientX: x, clientY: y });

  it("snaps into the zone the pointer goes into", () => {
    render(<Harness />);
    giveHostAnArea();
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 400, clientY: 380 });
    // (780, 200): dx = +0.95 - dy = 0 -> the right-hand zone.
    drag(780, 200);
    expect(placeNow()).toBe("right");
    // Back to the bottom: dy = +0.9 against dx = 0.
    drag(400, 380);
    expect(placeNow()).toBe("bottom");
    fireEvent.pointerUp(grip(), { pointerId: 1 });
  });

  it("lets the grip follow the pointer and the dock not", () => {
    render(<Harness />);
    giveHostAnArea();
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 400, clientY: 380 });
    drag(430, 380);
    // The grip carries a travel; the strip carries none.
    expect(grip().style.transform).not.toBe("");
    expect(strip().style.transform).toBe("");
    fireEvent.pointerUp(grip(), { pointerId: 1 });
    expect(grip().style.transform).toBe("");
  });

  it("stays at a place even when the pointer leaves the host", () => {
    render(<Harness />);
    giveHostAnArea();
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 400, clientY: 380 });
    drag(-2000, 200);
    expect(placeNow()).toBe("left");
    fireEvent.pointerUp(grip(), { pointerId: 1 });
  });

  it("restores with Escape the place the drag started with", () => {
    const reported = vi.fn();
    render(<Harness onPlaceChange={reported} />);
    giveHostAnArea();
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 400, clientY: 380 });
    drag(780, 200);
    expect(placeNow()).toBe("right");
    fireEvent.keyDown(window, { key: "Escape" });
    expect(placeNow()).toBe("bottom");
    // Reported are the way there and the way back - and nothing else.
    expect(reported.mock.calls).toEqual([["right"], ["bottom"]]);
    // And the drag is over: a further pointer path moves nothing any more.
    drag(780, 200);
    expect(placeNow()).toBe("bottom");
  });

  /* Its Escape listener sits on the window. Unmounted in the middle of a drag,
     the dock used to leave it there, and a later Escape reported a place for
     a dock that no longer existed. */
  it("ends with the dock when it unmounts in the middle", () => {
    const reported = vi.fn();
    const { unmount } = render(<Harness onPlaceChange={reported} />);
    giveHostAnArea();
    fireEvent.pointerDown(grip(), { pointerId: 1, button: 0, clientX: 400, clientY: 380 });
    drag(780, 200);
    unmount();
    reported.mockClear();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(reported).not.toHaveBeenCalled();
  });
});
