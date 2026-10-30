/* A frame that stands stays framed while its parent's height still resolves
   the percentage, also when the parent's height comes to depend on the table
   (a neighbour shrank below it); it becomes framed only when the parent is
   independent of the table. The probe never destroys the frame's boxes. */

import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTable } from "../src";

const parent = { keeps: true };
const watchers = new Set<() => void>();
const styles: string[] = [];

function Case() {
  const t = useTable([{ id: "a" }], { rowKey: (r) => r.id });
  return (
    <t.Table aria-label="Rows">
      <output>{String(t.framed)}</output>
      <t.Column value="id" label="Id" rowHeader />
    </t.Table>
  );
}

beforeEach(() => {
  watchers.clear();
  styles.length = 0;
  parent.keeps = true;
  vi.stubGlobal("ResizeObserver", class { constructor(cb: () => void) { watchers.add(cb); } observe() {} disconnect() {} });
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const asked = this.style.height.startsWith("calc(100% - ");
    const isParent = this.parentElement === document.body;
    /* The parent's height depends on the table unless the frame is out of flow. */
    const out = /position: absolute|display: none/.test(this.firstElementChild?.getAttribute("style") ?? "");
    if (this.firstElementChild?.getAttribute("style")) styles.push(this.firstElementChild.getAttribute("style")!);
    const height = isParent ? (parent.keeps || out ? 100 : 0) : asked ? 93 : 100;
    return { height, top: 0, left: 0, bottom: height, right: 0, width: 0, x: 0, y: 0, toJSON: () => ({}) };
  });
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

const framed = () => screen.getByRole("status").textContent;
const probe = () => act(() => watchers.forEach((cb) => cb()));

describe("framed under a parent that comes to depend on the table", () => {
  it("stays framed while the percentage resolves", () => {
    render(<Case />);
    expect(framed()).toBe("true");
    parent.keeps = false;
    probe();
    expect(framed()).toBe("true");
  });

  it("becomes framed only when the parent keeps its height", () => {
    parent.keeps = false;
    render(<Case />);
    expect(framed()).toBe("false");
    probe();
    expect(framed()).toBe("false");
    parent.keeps = true;
    probe();
    expect(framed()).toBe("true");
  });

  it("takes the frame out of flow, not out of the tree, for the read", () => {
    render(<Case />);
    expect(styles.some((style) => style.includes("display: none"))).toBe(false);
  });
});
