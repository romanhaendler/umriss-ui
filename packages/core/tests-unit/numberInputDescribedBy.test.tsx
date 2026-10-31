/* A caller's aria-describedby is joined with the unit's description, not replacing it. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NumberInput } from "../src";

describe("NumberInput aria-describedby", () => {
  it("keeps the unit's description beside the caller's", () => {
    render(<NumberInput aria-label="Mass" aria-describedby="hint" suffix="kg" value={5} onValueChange={() => {}} />);
    const ids = (screen.getByRole("textbox", { name: "Mass" }).getAttribute("aria-describedby") ?? "").split(" ");
    expect(ids).toContain("hint");
    expect(ids.length).toBe(2);
  });
});
