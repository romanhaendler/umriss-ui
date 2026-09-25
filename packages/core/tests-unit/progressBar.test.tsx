/* The progress bar at the seam a caller has (core-foundations 04): how far a
   task has come, as a screen reader hears it. A progress bar is not a meter -
   it carries no verdict and no tone - and without a value it says that the
   task runs without saying how far. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressBar, UmrissProvider } from "../src";
import { GERMAN_WORDING } from "../src/lib/language/de";

describe("ProgressBar", () => {
  it("determinate: says its share in per cent", () => {
    render(<ProgressBar value={0.42} label="Import of the batch records" />);
    const bar = screen.getByRole("progressbar", { name: "Import of the batch records" });
    expect(bar.getAttribute("aria-valuemin")).toBe("0");
    expect(bar.getAttribute("aria-valuemax")).toBe("100");
    expect(bar.getAttribute("aria-valuenow")).toBe("42");
  });

  it("clamps what lies outside 0 to 1", () => {
    render(<ProgressBar value={1.7} label="Upload" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("100");
  });

  it("says a caller's text where a share is not the way to say it", () => {
    render(<ProgressBar value={0.25} label="Pallets" valueText="3 of 12 pallets" />);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuetext")).toBe("3 of 12 pallets");
  });

  it("indeterminate: no value at all, only that it runs", () => {
    render(<ProgressBar label="Connecting to the controller" />);
    const bar = screen.getByRole("progressbar", { name: "Connecting to the controller" });
    expect(bar.hasAttribute("aria-valuenow")).toBe(false);
    expect(bar.hasAttribute("aria-valuetext")).toBe(false);
    expect(bar.getAttribute("data-indeterminate")).not.toBeNull();
  });

  it("shows the share beside the bar on request, and never for the indeterminate one", () => {
    const { rerender } = render(<ProgressBar value={0.5} label="Upload" showLabel />);
    expect(screen.getByText("50%")).toBeTruthy();
    rerender(<ProgressBar label="Upload" showLabel />);
    expect(screen.queryByText(/%/)).toBeNull();
  });

  it("takes its default name from the wording, in either language", () => {
    const { rerender } = render(<ProgressBar value={0.1} />);
    expect(screen.getByRole("progressbar", { name: "Progress" })).toBeTruthy();
    rerender(
      <UmrissProvider language={{ wording: GERMAN_WORDING }}>
        <ProgressBar value={0.1} />
      </UmrissProvider>,
    );
    expect(screen.getByRole("progressbar", { name: "Fortschritt" })).toBeTruthy();
  });

  it("keeps its role and value against a caller's", () => {
    render(<ProgressBar value={0.3} label="Upload" {...({ role: "meter", "aria-valuenow": 99 } as object)} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("aria-valuenow")).toBe("30");
  });
});
