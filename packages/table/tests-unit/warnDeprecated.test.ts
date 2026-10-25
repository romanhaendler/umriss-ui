/* The deprecation warning: one wording, once per old name, silent in production. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("warnDeprecated", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("warns once per old name, in the fixed wording", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { warnDeprecated } = await import("../src/dev");
    warnDeprecated("oldName", "newName");
    warnDeprecated("oldName", "newName");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith("@umriss-ui/table: oldName is deprecated and goes in the next minor release; use newName.");
    warnDeprecated("otherName", "newName");
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it("is silent in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { warnDeprecated } = await import("../src/dev");
    warnDeprecated("oldName", "newName");
    expect(warn).not.toHaveBeenCalled();
  });
});
