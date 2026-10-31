// @vitest-environment jsdom
/* A theme switch on any ancestor of a chart - a `.dark` class or a `color-scheme` on a container - tells the
   charts, not only one on <html>; a change inside a chart or beside it does not. */

import { afterEach, describe, expect, it, vi } from "vitest";
import { invalidateTheme, resolveTheme, subscribeTheme } from "../src/theme";

afterEach(() => {
  invalidateTheme();
  document.body.innerHTML = "";
});

function mount() {
  const container = document.body.appendChild(document.createElement("div"));
  const root = container.appendChild(document.createElement("div"));
  root.className = "uc-root";
  const inner = root.appendChild(document.createElement("div"));
  const beside = document.body.appendChild(document.createElement("div"));
  resolveTheme(root);
  const notify = vi.fn();
  subscribeTheme(notify);
  return { container, root, inner, beside, notify };
}

const tick = () => new Promise((r) => setTimeout(r, 0));

describe("theme observer", () => {
  it("a class on a container above the chart invalidates", async () => {
    const { container, notify } = mount();
    container.classList.add("dark");
    await tick();
    expect(notify).toHaveBeenCalled();
  });

  it("a color-scheme on a container above the chart invalidates", async () => {
    const { container, notify } = mount();
    container.style.colorScheme = "dark";
    await tick();
    expect(notify).toHaveBeenCalled();
  });

  it("a change inside the chart, or in a subtree without one, does not", async () => {
    const { root, inner, beside, notify } = mount();
    inner.classList.add("hover");
    root.style.touchAction = "pan-y";
    beside.classList.add("x");
    await tick();
    expect(notify).not.toHaveBeenCalled();
  });
});
