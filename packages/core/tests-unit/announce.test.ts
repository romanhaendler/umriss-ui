/* The shared announcer (listbox-announcements 01).

   What a screen reader would hear is what the one polite region holds once
   the announcements rest - read here as its text, and as a NEW node each
   time, because a region only speaks what was added to it. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { announce } from "../src/lib/announce";

const regions = () => Array.from(document.querySelectorAll<HTMLElement>("[data-umriss-announcer]"));
const spoken = (host: Element = document.body) =>
  regions().find((r) => r.parentElement === host)?.textContent ?? null;

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  document.body.innerHTML = "";
});

describe("announce", () => {
  it("speaks once the announcements rest, the last one only", () => {
    announce("12 options");
    announce("3 options");
    vi.advanceTimersByTime(149);
    expect(spoken()).toBe("");
    vi.advanceTimersByTime(1);
    expect(spoken()).toBe("3 options");
  });

  it("stands as a polite region before anything is written into it", () => {
    announce("12 options");
    const [region] = regions();
    expect(region?.getAttribute("role")).toBe("status");
    expect(region?.getAttribute("aria-live")).toBe("polite");
  });

  it("says the same words again as new words", () => {
    announce("Alpha");
    vi.advanceTimersByTime(150);
    const first = regions()[0]!.firstChild;
    announce("Alpha");
    vi.advanceTimersByTime(150);
    expect(spoken()).toBe("Alpha");
    expect(regions()[0]!.firstChild).not.toBe(first);
  });

  it("speaks inside the dialog its anchor stands in, where the page behind is inert", () => {
    const dialog = document.createElement("dialog");
    const input = document.createElement("input");
    dialog.append(input);
    document.body.append(dialog);
    announce("2 finds", input);
    vi.advanceTimersByTime(150);
    expect(spoken(dialog)).toBe("2 finds");
    expect(spoken(document.body)).toBeNull();
  });

  it("keeps one region per place, however many callers speak", () => {
    announce("one");
    announce("two", document.createElement("input"));
    vi.advanceTimersByTime(150);
    expect(regions()).toHaveLength(1);
    expect(spoken()).toBe("two");
  });

  it("builds a region anew when the page threw its own away", () => {
    announce("one");
    vi.advanceTimersByTime(150);
    document.body.innerHTML = "";
    announce("two");
    vi.advanceTimersByTime(150);
    expect(spoken()).toBe("two");
  });
});
