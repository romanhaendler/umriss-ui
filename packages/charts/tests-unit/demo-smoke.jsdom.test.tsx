// @vitest-environment jsdom

/* Smoke test of the demo of @umriss-ui/charts: it mounts in jsdom, every page
   renders, every example renders and has a title (R-7.4).

   The cheapest place at which an example that does not run at all shows up -
   the browser suite pays for the same proof with two pictures per example. The
   shape is the one the demo of @umriss-ui/table uses, because since ADR-0020
   the two run in the same shell. */

import { describe, expect, it, vi } from "vitest";
import { StrictMode, act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { DEFAULT_WORDING } from "@umriss-ui/core";
import { Page } from "@umriss-ui/demo";
import { App } from "../demo/App";
import { DEMO } from "../demo/examples";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES = DEMO.examples;

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
    expect(host.textContent).toContain("umriss-ui");
    await unmount();
  });

  it("runs no example on the front door", async () => {
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

  it("links the Chart page's keys from the Line page, and says on the Chart page what a screen reader meets", async () => {
    const page = (id: string) => ALL_PAGES.find((one) => one.id === id)!;
    const line = await mount(<Page demo={DEMO} page={page("line")} />);
    const keyboard = line.host.querySelector('section[aria-labelledby="keyboard-line"]');
    expect(keyboard?.textContent).toContain("The keys of Chart apply here.");
    expect(keyboard?.querySelector("a")?.getAttribute("href")).toBe("/chart/#keyboard-chart");
    await line.unmount();

    const chart = await mount(<Page demo={DEMO} page={page("chart")} />);
    const sections = [...chart.host.querySelectorAll(".section h2")].map((h) => h.textContent);
    expect(sections.indexOf("Accessibility")).toBe(sections.indexOf("Keyboard") + 1);
    expect(chart.host.querySelector("#keyboard-chart")).not.toBeNull();
    expect(chart.host.querySelector('section[aria-labelledby="accessibility-chart"] p')).not.toBeNull();
    await chart.unmount();
  });

  it.each(EXAMPLES.map((b) => [`${b.pageId}/${b.id}`, b] as const))("renders the example %s", async (_name, example) => {
    const { unmount } = await mount(<example.Component />);
    await unmount();
  });

  it.each(DEMO.scenarios.map((s) => [s.id, s] as const))("renders the scenario %s", async (_name, scenario) => {
    const { unmount } = await mount(<scenario.Component />);
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

  it("show no stale or lost feed when the page is loaded in 2030", async () => {
    /* A world has a fixed moment; a feed's freshness counts from page load.
       The modules are loaded anew under the clock, as a visitor's page would
       be: a scenario that ties its feed to the world's date shows it lost. */
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2030, 0, 1));
    try {
      vi.resetModules();
      const { DEMO: loaded } = await import("../demo/examples");
      for (const scenario of loaded.scenarios) {
        const { host, unmount } = await mount(<scenario.Component />);
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessDisconnected);
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessStale);
        await unmount();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("leave no page without an example", () => {
    const without = ALL_PAGES.filter((s) => !EXAMPLES.some((b) => b.pageId === s.id)).map((s) => s.id);
    expect(without).toEqual([]);
  });
});
