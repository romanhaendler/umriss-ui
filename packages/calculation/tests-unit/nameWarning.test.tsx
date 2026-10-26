import { afterEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

/* The DEV flag and warnOnce's once-only memory are read at module load, so each
   case loads a fresh copy of the package. */
const load = async () => {
  vi.resetModules();
  return import("../src");
};

const nameWarnings = (warning: { mock: { calls: unknown[][] } }) =>
  warning.mock.calls.filter(([text]) => String(text).includes("accessible name"));

describe("A Calculation without a name", () => {
  const original = process.env.NODE_ENV;
  afterEach(() => {
    process.env.NODE_ENV = original;
    vi.restoreAllMocks();
  });

  it("warns once in development when neither aria-label nor aria-labelledby is given", async () => {
    const { Calculation, Given, Sum } = await load();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const tree = (
      <Calculation>
        <Sum label="Output" unit="pcs">
          <Given label="Early shift" value={512} unit="pcs" />
          <Given label="Late shift" value={488} unit="pcs" />
        </Sum>
      </Calculation>
    );
    render(tree).unmount();
    render(tree);
    expect(nameWarnings(warning)).toHaveLength(1);
    expect(String(nameWarnings(warning)[0]![0])).toMatch(/^@umriss-ui\/calculation: /);
  });

  it("stays silent with aria-label", async () => {
    const { Calculation, Given, Sum } = await load();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Calculation aria-label="Output">
        <Sum label="Output" unit="pcs">
          <Given label="Early shift" value={512} unit="pcs" />
        </Sum>
      </Calculation>,
    );
    expect(nameWarnings(warning)).toHaveLength(0);
  });

  it("stays silent with aria-labelledby", async () => {
    const { Calculation, Given, Sum } = await load();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <div>
        <h2 id="output-heading">Output</h2>
        <Calculation aria-labelledby="output-heading">
          <Sum label="Output" unit="pcs">
            <Given label="Early shift" value={512} unit="pcs" />
          </Sum>
        </Calculation>
      </div>,
    );
    expect(nameWarnings(warning)).toHaveLength(0);
  });

  it("is silent in production", async () => {
    process.env.NODE_ENV = "production";
    const { Calculation, Given, Sum } = await load();
    const warning = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    render(
      <Calculation>
        <Sum label="Output" unit="pcs">
          <Given label="Early shift" value={512} unit="pcs" />
        </Sum>
      </Calculation>,
    );
    expect(nameWarnings(warning)).toHaveLength(0);
  });
});
