/* Smoke test: the demo must mount in jsdom without throwing - ToastProvider
   and StrictMode double mount included.

   Beside it a second one that is worth more than the first: EVERY page and
   EVERY example is rendered once. This is the cheapest place at which an
   example that does not run at all shows up - the same proof costs the browser
   suite two pictures per example and a minute.

   The three imports below still name the German modules of `demo/`, because
   that directory is renamed by its own ticket. */

import { describe, expect, it, vi } from "vitest";
import { StrictMode, act } from "react";
import { createRoot } from "react-dom/client";
import { DEFAULT_WORDING, ToastProvider } from "../src";
import { Page } from "@umriss-ui/demo";
import { App } from "../demo/App";
import { DEMO } from "../demo/examples";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES = DEMO.examples;

/** Renders, and returns the node together with its teardown - the teardown
    belongs to the test: an example that throws only while being cleaned up is
    just as broken. */
async function mount(
  content: React.ReactNode,
): Promise<{ host: HTMLDivElement; teardown: () => Promise<void> }> {
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
    teardown: async () => {
      await act(async () => {
        root.unmount();
      });
      host.remove();
    },
  };
}

describe("Demo smoke test", () => {
  it("mounts the shell without an error", async () => {
    const { host, teardown } = await mount(<App />);
    expect(host.querySelector("main")).not.toBeNull();
    expect(host.textContent).toContain("umriss-ui");
    await teardown();
  });

  it.each(ALL_PAGES.map((p) => [p.name, p] as const))("renders the page %s", async (_name, page) => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={page} />);
    expect(host.querySelector(`[data-block="${page.id}"]`)).not.toBeNull();
    /* The generated page: an entry for every export, by its anchor. */
    if (page.body === "api-index") {
      /* Read once: core's index has some 250 anchors. */
      const ids = new Set([...host.querySelectorAll("[id]")].map((one) => one.id));
      for (const anchor of DEMO.apiIndex!.anchors) expect(ids.has(anchor), anchor).toBe(true);
    } else {
      /* "On this page" names every section heading and the configurator, in
         the page's order. */
      const listed = [...host.querySelectorAll('nav[aria-label="On this page"] a')].map((a) => a.getAttribute("href")!.split("#")[1]);
      const anchors = [...host.querySelectorAll(".sectionTitle[id], .configurator[id]")].map((el) => el.id);
      expect(listed.filter((id) => anchors.includes(id!))).toEqual(anchors);
    }
    await teardown();
  });

  it("links a hook in a page's import line to its entry on the API index (ADR-0044)", async () => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={ALL_PAGES.find((p) => p.id === "toast")!} />);
    const links = [...host.querySelectorAll(".importLine a")].map((a) => [a.textContent, a.getAttribute("href")]);
    expect(links).toEqual([["useToast", "/api/#useToast"]]);
    await teardown();
  });

  it("has a props table with at least one row for the first page with types", async () => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={ALL_PAGES.find((p) => p.types.length > 0)!} />);
    expect(host.querySelectorAll(".apiTable tbody tr").length).toBeGreaterThan(0);
    await teardown();
  });

  /* A configurator renders in its page's first slot, and at rest its code is
     the bare element - every control starts at its default
     (.scratch/configurator). */
  it("has a configurator on every page that can be configured", () => {
    expect(DEMO.configurators.map((one) => one.name).sort()).toEqual([
      "Alert", "Badge", "Button", "Checkbox", "Combobox", "DatePicker", "DateRangePicker", "DateTimePicker",
      "DateTimeRangePicker", "Divider", "FormField", "IconButton", "Input", "Meter", "MultiSelect", "NumberInput",
      "ProgressBar", "RadioGroup", "Select", "Skeleton", "Slider", "Sparkline", "Stat", "Switch", "Tag", "Text",
      "Textarea",
    ]);
  });

  it.each(DEMO.configurators.map((c) => [c.name, c] as const))("renders the configurator of %s at rest", async (name, configurator) => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={ALL_PAGES.find((p) => p.id === configurator.pageId)!} />);
    const code = host.querySelector(`[data-configurator="${configurator.pageId}"] pre code`)?.textContent ?? "";
    const element = code.split("\n\n")[1] ?? "";
    expect(element.startsWith(`<${name}`)).toBe(true);
    /* The attributes it carries are the required ones, and no other - a
       required glyph stands between the tags. */
    const open = element.replace(/"[^"]*"/g, '""');
    const attributes = [...open.slice(0, open.indexOf(">")).matchAll(/ ([\w-]+)(?==|[ />])/g)].map(([, prop]) => prop);
    expect(attributes).toEqual(Object.keys(configurator.required).filter((prop) => prop !== "children"));
    await teardown();
  });

  it.each(EXAMPLES.map((e) => [`${e.pageId}/${e.id}`, e] as const))(
    "renders the example %s",
    async (_name, example) => {
      const { teardown } = await mount(<example.Component />);
      await teardown();
    },
  );
});

describe("The examples as a set", () => {
  it("all lie on a page that exists", () => {
    const pageIds = new Set(ALL_PAGES.map((p) => p.id));
    for (const example of EXAMPLES) {
      expect(pageIds.has(example.pageId), `${example.pageId}/${example.id}`).toBe(true);
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

  it("show neither a title nor a library path in their source", () => {
    for (const example of EXAMPLES) {
      expect(example.source, `${example.pageId}/${example.id}`).not.toContain("export const title");
      expect(example.source, `${example.pageId}/${example.id}`).not.toContain("../../../src");
      expect(example.source).toContain("@umriss-ui/core");
    }
  });

  it.each(DEMO.scenarios.map((s) => [s.id, s] as const))("renders the scenario %s", async (_name, scenario) => {
    const { teardown } = await mount(<scenario.Component />);
    await teardown();
  });

  it("show no stale or lost feed when the page is loaded in 2030", async () => {
    /* A world has a fixed moment; a feed's freshness counts from page load.
       The modules are loaded anew under the clock, as a visitor's page would
       be: a scenario that ties its feed to the world's date shows it lost. */
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2030, 0, 1));
    try {
      vi.resetModules();
      const [{ DEMO: loaded }, core] = await Promise.all([import("../demo/examples"), import("../src")]);
      for (const scenario of loaded.scenarios) {
        const { host, teardown } = await mount(
          <core.ToastProvider>
            <scenario.Component />
          </core.ToastProvider>,
        );
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessDisconnected);
        expect(host.textContent, scenario.id).not.toContain(DEFAULT_WORDING.freshnessStale);
        await teardown();
      }
    } finally {
      vi.useRealTimers();
    }
  });

  it("leave no written page without an example", () => {
    const without = ALL_PAGES.filter((p) => p.body === undefined && !EXAMPLES.some((e) => e.pageId === p.id));
    expect(without.map((p) => p.id)).toEqual([]);
  });
});
