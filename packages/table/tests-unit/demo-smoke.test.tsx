/* Smoke test of the demo of @umriss-ui/table: it mounts in jsdom, every page
   renders, every example renders and has a title.

   The cheapest place at which an example that does not run at all shows up – the
   browser suite pays for the same proof with two pictures per example. */

import { describe, expect, it, vi } from "vitest";
import { StrictMode, act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { DEFAULT_WORDING, ToastProvider } from "@umriss-ui/core";
import { Page } from "@umriss-ui/demo";
import { App } from "../demo/App";
import { DEMO } from "../demo/examples";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES = DEMO.examples;

/** Renders, and gives back the node together with its teardown – the teardown
    belongs to the test: an example that throws only while being cleaned up is
    just as broken. */
async function mount(content: ReactNode): Promise<{ host: HTMLDivElement; unmount: () => Promise<void> }> {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const root = createRoot(host);
  await act(async () => {
    root.render(
      <StrictMode>
        <ToastProvider>{content}</ToastProvider>
      </StrictMode>,
    );
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

  it.each(ALL_PAGES.map((s) => [s.name, s] as const))("renders the page %s with its tables", async (_name, pageData) => {
    const { host, unmount } = await mount(<Page demo={DEMO} page={pageData} />);
    expect(host.querySelector(`[data-block="${pageData.id}"]`)).not.toBeNull();
    /* The generated page: an entry for every export, by its anchor. */
    if (pageData.body === "api-index") {
      const ids = new Set([...host.querySelectorAll("[id]")].map((one) => one.id));
      for (const anchor of DEMO.apiIndex!.anchors) expect(ids.has(anchor), anchor).toBe(true);
    }
    /* Installation and the API index document no type: they have no API table. */
    if (pageData.types.length > 0) {
      expect(host.querySelectorAll(".apiTable tbody tr").length).toBeGreaterThan(0);
    }
    await unmount();
  });

  it("links First table's keys and core's Input keys from the Search page, and says on First table what a screen reader meets", async () => {
    const page = (id: string) => ALL_PAGES.find((one) => one.id === id)!;
    const search = await mount(<Page demo={DEMO} page={page("search")} />);
    const keyboard = search.host.querySelector('section[aria-labelledby="keyboard-search"]');
    expect(keyboard?.textContent).toContain("The keys of First table and Input apply here.");
    expect([...(keyboard?.querySelectorAll("a") ?? [])].map((a) => a.getAttribute("href"))).toEqual([
      "/first-table/#keyboard-first-table",
      "/core/input/#keyboard-input",
    ]);
    await search.unmount();

    const first = await mount(<Page demo={DEMO} page={page("first-table")} />);
    const sections = [...first.host.querySelectorAll(".section h2")].map((h) => h.textContent);
    expect(sections.indexOf("Accessibility")).toBe(sections.indexOf("Keyboard") + 1);
    expect(first.host.querySelector('section[aria-labelledby="accessibility-first-table"] p')).not.toBeNull();
    await first.unmount();
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
      expect(example.source, where).toContain('from "@umriss-ui/table"');
    }
  });

  it.each(DEMO.scenarios.map((s) => [s.id, s] as const))("renders the scenario %s", async (_name, scenario) => {
    const { unmount } = await mount(<scenario.Component />);
    await unmount();
  });

  it("show no stale or lost feed when the page is loaded in 2030", async () => {
    /* A world has a fixed moment; a feed's freshness counts from page load.
       The modules are loaded anew under the clock, as a visitor's page would
       be: a scenario that ties its feed to the world's date shows it lost. */
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2030, 0, 1));
    try {
      vi.resetModules();
      const [{ DEMO: loaded }, core] = await Promise.all([import("../demo/examples"), import("@umriss-ui/core")]);
      for (const scenario of loaded.scenarios) {
        const { host, unmount } = await mount(
          <core.ToastProvider>
            <scenario.Component />
          </core.ToastProvider>,
        );
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessDisconnected);
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessStale);
        await unmount();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("leave no written page without an example", () => {
    const without = ALL_PAGES.filter((s) => s.body === undefined && !EXAMPLES.some((b) => b.pageId === s.id));
    expect(without.map((s) => s.id)).toEqual([]);
  });
});
