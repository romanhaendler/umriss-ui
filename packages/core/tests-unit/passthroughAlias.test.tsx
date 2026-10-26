import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import * as core from "../src";

const noop = () => undefined;

describe("Combobox field defaults", () => {
  it("a caller's autoComplete and enterKeyHint win", () => {
    const { getByRole } = render(
      <core.Combobox options={[]} value={null} onChange={noop} aria-label="Tag" enterKeyHint="go" {...({ autoComplete: "on" } as object)} />,
    );
    expect(getByRole("combobox").getAttribute("autocomplete")).toBe("on");
    expect(getByRole("combobox").getAttribute("enterkeyhint")).toBe("go");
  });
});
