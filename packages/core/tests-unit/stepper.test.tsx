/* The stepper at the seam a caller has (core-layout-extras 02): an ordered
   list of steps, each done, current, upcoming or failed. The state is said as
   a word to a screen reader - `aria-current="step"` for the one being worked
   on, a hidden word for the others - and never by colour alone. Moving on is
   the caller's: the stepper shows where a procedure stands, it does not run it. */

import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { LanguageProvider, Stepper } from "../src";
import { GERMAN_WORDING } from "../src/lib/language/de";

const STEPS = [
  { label: "Drain" },
  { label: "Clean", description: "CIP, 20 minutes" },
  { label: "Rinse" },
  { label: "Release" },
];

const items = () => within(screen.getByRole("list")).getAllByRole("listitem");

describe("Stepper", () => {
  it("is an ordered list with one item per step, in order", () => {
    render(<Stepper aria-label="Changeover" steps={STEPS} current={1} />);
    const list = screen.getByRole("list", { name: "Changeover" });
    expect(list.tagName).toBe("OL");
    expect(items().map((item) => item.textContent)).toEqual([
      expect.stringContaining("Drain"),
      expect.stringContaining("Clean"),
      expect.stringContaining("Rinse"),
      expect.stringContaining("Release"),
    ]);
  });

  it("marks the current step with aria-current, and only that one", () => {
    render(<Stepper steps={STEPS} current={2} />);
    const marked = items().filter((item) => item.getAttribute("aria-current") === "step");
    expect(marked).toHaveLength(1);
    expect(marked[0]?.textContent).toContain("Rinse");
  });

  it("says the state of every other step as a word", () => {
    render(<Stepper steps={STEPS} current={1} />);
    const [drain, clean, rinse] = items();
    expect(drain?.textContent).toContain("Done");
    expect(clean?.textContent).not.toMatch(/Done|Upcoming/);
    expect(rinse?.textContent).toContain("Upcoming");
    expect(items().map((item) => item.getAttribute("data-state"))).toEqual(["done", "current", "upcoming", "upcoming"]);
  });

  it("says a failed step as failed, current or not", () => {
    const steps = [{ label: "Drain" }, { label: "Clean", failed: true }, { label: "Rinse" }];
    const { rerender } = render(<Stepper steps={steps} current={1} />);
    expect(items()[1]?.getAttribute("aria-current")).toBe("step");
    expect(items()[1]?.textContent).toContain("Failed");
    expect(items()[1]?.getAttribute("data-state")).toBe("failed");
    rerender(<Stepper steps={steps} current={2} />);
    expect(items()[1]?.textContent).toContain("Failed");
    expect(items()[1]?.textContent).not.toContain("Done");
  });

  it("stands all done when current is past the last step", () => {
    render(<Stepper steps={STEPS} current={STEPS.length} />);
    expect(items().every((item) => item.getAttribute("data-state") === "done")).toBe(true);
    expect(items().some((item) => item.hasAttribute("aria-current"))).toBe(false);
  });

  it("shows a step's description beneath its label", () => {
    render(<Stepper steps={STEPS} current={0} />);
    expect(items()[1]?.textContent).toContain("CIP, 20 minutes");
  });

  it("says the states in German under the German wording", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <Stepper steps={[{ label: "A" }, { label: "B", failed: true }, { label: "C" }, { label: "D" }]} current={2} />
      </LanguageProvider>,
    );
    const [a, b, , d] = items();
    expect(a?.textContent).toContain("Erledigt");
    expect(b?.textContent).toContain("Fehlgeschlagen");
    expect(d?.textContent).toContain("Ausstehend");
  });

  it("lays out along its orientation", () => {
    const { rerender } = render(<Stepper steps={STEPS} current={0} />);
    expect(screen.getByRole("list").getAttribute("aria-orientation")).toBeNull();
    expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("horizontal");
    rerender(<Stepper steps={STEPS} current={0} orientation="vertical" />);
    expect(screen.getByRole("list").getAttribute("data-orientation")).toBe("vertical");
  });
});
