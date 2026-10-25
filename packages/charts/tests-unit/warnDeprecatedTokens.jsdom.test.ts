// @vitest-environment jsdom

/* The stylesheet scan: an old token that the application's CSS sets or reads is named once, in development. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sheet = (css: string) => {
  const style = document.createElement("style");
  style.textContent = css;
  document.head.append(style);
};
const tokens = { "--u-old-set": "--u-new-set", "--u-old-read": "--u-new-read" };

describe("warnDeprecatedTokens", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    document.head.innerHTML = "";
  });

  const run = async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { warnDeprecatedTokens } = await import("../src/dev");
    warnDeprecatedTokens(tokens);
    return { warn, warnDeprecatedTokens };
  };
  const wording = (old: string, replacement: string) =>
    `@umriss-ui/charts: ${old} is deprecated and goes in the next minor release; use ${replacement}.`;

  it("warns once for a name the page sets and once for one it reads", async () => {
    sheet(".a { --u-old-set: red; } .b { color: var(--u-old-read, blue); }");
    const { warn, warnDeprecatedTokens } = await run();
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledWith(wording("--u-old-set", "--u-new-set"));
    expect(warn).toHaveBeenCalledWith(wording("--u-old-read", "--u-new-read"));
    warnDeprecatedTokens(tokens);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("finds a name inside a media rule", async () => {
    sheet("@media screen { .a { --u-old-set: red; } }");
    const { warn } = await run();
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("ignores the umriss layers", async () => {
    sheet("@layer umriss.tokens { :root { --u-old-set: red; } .b { color: var(--u-old-read); } }");
    const { warn } = await run();
    expect(warn).not.toHaveBeenCalled();
  });

  it("does not take a longer name for the old one", async () => {
    sheet(".a { --u-old-set-more: red; }");
    const { warn } = await run();
    expect(warn).not.toHaveBeenCalled();
  });

  it("is silent in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    sheet(".a { --u-old-set: red; }");
    const { warn } = await run();
    expect(warn).not.toHaveBeenCalled();
  });
});
