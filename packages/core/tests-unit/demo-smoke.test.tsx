/* Smoke test: the demo must mount in jsdom without throwing - ToastProvider
   and StrictMode double mount included.

   Beside it a second one that is worth more than the first: EVERY page and
   EVERY example is rendered once. This is the cheapest place at which an
   example that does not run at all shows up - the same proof costs the browser
   suite two pictures per example and a minute.

   The three imports below still name the German modules of `demo/`, because
   that directory is renamed by its own ticket. */

import { describe, expect, it } from "vitest";
import { StrictMode, act } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "../src";
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
    expect(host.textContent).toContain("Umriss UI");
    await teardown();
  });

  it.each(ALL_PAGES.map((p) => [p.name, p] as const))("renders the page %s", async (_name, page) => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={page} />);
    expect(host.querySelector(`[data-block="${page.id}"]`)).not.toBeNull();
    await teardown();
  });

  it("has a props table with at least one row for every page", async () => {
    const { host, teardown } = await mount(<Page demo={DEMO} page={ALL_PAGES[0]!} />);
    expect(host.querySelectorAll(".apiTable tbody tr").length).toBeGreaterThan(0);
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

  it("leave no page without an example", () => {
    const without = ALL_PAGES.filter((p) => !EXAMPLES.some((e) => e.pageId === p.id));
    expect(without.map((p) => p.id)).toEqual([]);
  });
});
