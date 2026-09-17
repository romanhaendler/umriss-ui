/* Smoke test of the demo of @umriss-ui/schedule: it mounts in jsdom, every
   page renders, every example renders and has a title.

   The cheapest place at which an example that does not run at all shows up – the
   browser suite pays for the same proof with two pictures per example. */

import { describe, expect, it } from "vitest";
import { StrictMode, act } from "react";
import type { ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { ToastProvider } from "@umriss-ui/core";
import { Page } from "@umriss-ui/demo";
import { App } from "../demo/App";
import { DEMO } from "../demo/examples";
import { ALL_PAGES } from "../demo/outline";

const EXAMPLES = DEMO.examples;

/** Named exceptions: pages without a props table, each with its reason.

    Most of them share one. Since the demo was cut by feature
    (schedule-lane-groups 05 and 06) a chapter is one thing `<Schedule>` can
    do, and the props that do it are props of `<Schedule>` - whose table stands
    once, on *First schedule*. Repeating that table on thirteen chapters would
    be thirteen copies of one thing to keep true, and a reader who wants the
    whole surface has one page to go to. */
const A_CHAPTER = "A feature of `<Schedule>`; its props stand once, in `ScheduleProps` on *First schedule*.";

const WITHOUT_TABLE: Readonly<Record<string, string>> = {
  ripple: "A function with positional parameters of types documented on their own pages - it has no props.",
  "time-axis": A_CHAPTER,
  "pan-and-zoom": A_CHAPTER,
  "now-line": A_CHAPTER,
  "bar-labels": A_CHAPTER,
  appearances: A_CHAPTER,
  overlap: A_CHAPTER,
  routes: A_CHAPTER,
  selection: A_CHAPTER,
  "linked-schedules": A_CHAPTER,
  handle: A_CHAPTER,
  "move-and-lane": A_CHAPTER,
  stretch: A_CHAPTER,
  snapping: A_CHAPTER,
  placing: A_CHAPTER,
  "where-it-may-go": A_CHAPTER,
  demonstration: A_CHAPTER,
};

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
    expect(host.textContent).toContain("Umriss Schedule");
    await unmount();
  });

  it.each(ALL_PAGES.map((s) => [s.name, s] as const))("renders the page %s with its tables", async (_name, pageData) => {
    const { host, unmount } = await mount(<Page demo={DEMO} page={pageData} />);
    expect(host.querySelector(`[data-block="${pageData.id}"]`)).not.toBeNull();
    if (WITHOUT_TABLE[pageData.id] === undefined) {
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
      expect(example.source, where).toContain('from "@umriss-ui/schedule"');
    }
  });

  it("carry at most one demonstration per page, and it stands last", () => {
    for (const pageData of ALL_PAGES) {
      const own = EXAMPLES.filter((b) => b.pageId === pageData.id);
      const demonstrations = own.filter((b) => b.demonstration);
      expect(demonstrations.length, pageData.id).toBeLessThanOrEqual(1);
      if (demonstrations.length === 1) expect(own[own.length - 1]!.demonstration, pageData.id).toBe(true);
    }
  });

  it("leave no page without an example", () => {
    const without = ALL_PAGES.filter((s) => !EXAMPLES.some((b) => b.pageId === s.id));
    expect(without.map((s) => s.id)).toEqual([]);
  });
});
