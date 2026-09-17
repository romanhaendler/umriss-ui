// @vitest-environment jsdom

/* Smoke test of the demo of @umriss-ui/charts: it mounts in jsdom, every page
   renders, every example renders and has a title (R-7.4).

   The cheapest place at which an example that does not run at all shows up -
   the browser suite pays for the same proof with two pictures per example. The
   shape is the one the demo of @umriss-ui/table uses, because since ADR-0020
   the two run in the same shell. */

import { describe, expect, it } from "vitest";
import { StrictMode, act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { Page } from "@umriss-ui/demo";
import { App } from "../demo/App";
import { DEMO } from "../demo/examples";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES = DEMO.examples;

/** The pages that carry no example of their own - each one shown inside a
    composed example on another page. A named exception (CONTEXT.md): a sixth
    page without an example is a gap and fails here. */
const WITHOUT_AN_EXAMPLE: Readonly<Record<string, string>> = {
  area: "drawn in the mixed example on the Chart page - a corridor needs a series beside it to be one",
  bar: "drawn in the mixed example and in the Pareto",
  scatter: "drawn in the mixed example",
  stateband: "drawn in the limits-and-state example, where the lanes stand under the curve they explain",
  tooltip: "shown in nearly every example; a page of its own would photograph a hover",
};

async function mount(content: ReactNode): Promise<{ host: HTMLDivElement; unmount: () => Promise<void> }> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(<StrictMode>{content}</StrictMode>);
  });
  return {
    host,
    unmount: async () => {
      await act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

describe("Demo smoke test", () => {
  it("mounts the shell without an error", async () => {
    const { host, unmount } = await mount(<App />);
    expect(host.querySelector("main")).not.toBeNull();
    expect(host.textContent).toContain("Umriss Charts");
    await unmount();
  });

  it("shows no chart on the front door", async () => {
    /* Not a matter of taste: the benchmark measures the moment it exists, and a
       front door is to measure nothing. */
    window.history.replaceState({}, "", "/");
    const { host, unmount } = await mount(<App />);
    expect(host.querySelectorAll("[data-example]")).toHaveLength(0);
    await unmount();
  });

  it.each(ALL_PAGES.map((s) => [s.name, s] as const))("renders the page %s", async (_name, pageData) => {
    const { host, unmount } = await mount(<Page demo={DEMO} page={pageData} />);
    expect(host.querySelector(`[data-block="${pageData.id}"]`)).not.toBeNull();
    if (pageData.types.length > 0) {
      expect(host.querySelectorAll(".apiTable tbody tr").length).toBeGreaterThan(0);
    }
    await unmount();
  });

  it.each(EXAMPLES.map((b) => [`${b.pageId}/${b.id}`, b] as const))("renders the example %s", async (_name, example) => {
    const { unmount } = await mount(<example.Component />);
    await unmount();
  });
});

describe("The examples as a set", () => {
  it("each one carries a title", () => {
    for (const example of EXAMPLES) {
      expect(example.title.trim(), `${example.pageId}/${example.id}`).not.toBe("");
    }
  });

  it("have unique anchors per page", () => {
    const seen = new Set<string>();
    for (const example of EXAMPLES) {
      const key = `${example.pageId}/${example.id}`;
      expect(seen.has(key), key).toBe(false);
      seen.add(key);
    }
  });

  it("name the package by name and carry no title in the source", () => {
    for (const example of EXAMPLES) {
      const where = `${example.pageId}/${example.id}`;
      expect(example.source, where).not.toContain("export const title");
      expect(example.source, where).not.toContain("../../../src");
      expect(example.source, where).toContain('from "@umriss-ui/charts"');
    }
  });

  it("leaves no page without an example that is not a named exception", () => {
    const without = ALL_PAGES.filter((s) => !EXAMPLES.some((b) => b.pageId === s.id)).map((s) => s.id);
    expect(without.sort()).toEqual(Object.keys(WITHOUT_AN_EXAMPLE).sort());
  });
});
