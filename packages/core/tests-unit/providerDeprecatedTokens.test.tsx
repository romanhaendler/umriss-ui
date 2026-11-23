/* UmrissProvider names an old token that the application's own stylesheet sets or reads, once. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

describe("UmrissProvider and the renamed tokens", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    document.head.innerHTML = "";
  });

  it("warns once for an old token the application's stylesheet uses", async () => {
    const style = document.createElement("style");
    style.textContent = ".a { --u-shadow-sticky: red; } .b { box-shadow: 0 0 0 1px var(--u-color-edge-hover); }";
    document.head.append(style);
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { UmrissProvider } = await import("../src/lib/provider");
    const { rerender } = render(<UmrissProvider>x</UmrissProvider>);
    rerender(<UmrissProvider density="compact">x</UmrissProvider>);
    const messages = warn.mock.calls.map(([message]) => String(message));
    expect(messages.filter((message) => message.includes("--u-shadow-sticky"))).toHaveLength(1);
    expect(messages.filter((message) => message.includes("--u-color-edge-hover"))).toHaveLength(1);
  });

  it("is silent where no stylesheet names an old token", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { UmrissProvider } = await import("../src/lib/provider");
    render(<UmrissProvider>x</UmrissProvider>);
    expect(warn).not.toHaveBeenCalled();
  });
});
