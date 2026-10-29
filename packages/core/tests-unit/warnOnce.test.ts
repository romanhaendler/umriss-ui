/* The warn-once helper that the packages on core share: one warning per package and reason, the package
   named in the prefix, silent in production. */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("warnOnce", () => {
  beforeEach(() => {
    vi.resetModules();
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("warns once per package and reason, naming the package in the prefix", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { warnOnce } = await import("../src");
    warnOnce("@umriss-ui/table", "rows", "first");
    warnOnce("@umriss-ui/table", "rows", "second");
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenLastCalledWith("@umriss-ui/table: first");
    warnOnce("@umriss-ui/schedule", "rows", "third");
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenLastCalledWith("@umriss-ui/schedule: third");
  });

  it("reports whether a package has been warned for a reason", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const { hasWarned, warnOnce } = await import("../src");
    expect(hasWarned("@umriss-ui/table", "stale")).toBe(false);
    warnOnce("@umriss-ui/table", "stale", "warned");
    expect(hasWarned("@umriss-ui/table", "stale")).toBe(true);
    expect(hasWarned("@umriss-ui/calculation", "stale")).toBe(false);
  });

  it("is silent in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { warnOnce } = await import("../src");
    warnOnce("@umriss-ui/table", "rows", "message");
    expect(warn).not.toHaveBeenCalled();
  });
});
