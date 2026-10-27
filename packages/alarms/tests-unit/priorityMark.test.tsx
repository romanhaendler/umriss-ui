/* The priority mark: what an operator can tell from it - its name, its number,
   whether it calls for attention - and what its stylesheet promises where jsdom
   cannot compute a media query. */

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@umriss-ui/core";
import { GERMAN_WORDING } from "@umriss-ui/core/wording/de";
import { PriorityMark } from "../src";
import type { PriorityMarkProps } from "../src";
import CSS from "../src/PriorityMark.module.css?raw";

describe("PriorityMark", () => {
  it.each([
    ["critical", "Priority 1, critical", "1"],
    ["high", "Priority 2, high", "2"],
    ["medium", "Priority 3, medium", "3"],
    ["low", "Priority 4, low", "4"],
  ] as const)("is named and numbered for %s", (priority, name, number) => {
    render(<PriorityMark priority={priority} />);
    expect(screen.getByRole("img", { name }).textContent).toBe(number);
  });

  it("is named in German with the German wording", () => {
    render(
      <LanguageProvider wording={GERMAN_WORDING}>
        <PriorityMark priority="critical" />
      </LanguageProvider>,
    );
    expect(screen.getByRole("img", { name: "Priorität 1, kritisch" })).toBeTruthy();
  });

  it("takes the root contract: rest props, a ref and its own aria-label", () => {
    let node: HTMLSpanElement | null = null;
    render(<PriorityMark priority="high" aria-label="Pump 3" data-x="1" ref={(n) => void (node = n)} />);
    expect(screen.getByRole("img", { name: "Pump 3" }).getAttribute("data-x")).toBe("1");
    expect(node).toBe(screen.getByRole("img"));
  });

  it("flashes only for an active, unacknowledged alarm in service", () => {
    const flashes = (props: Partial<PriorityMarkProps>) => {
      const { unmount } = render(<PriorityMark priority="high" {...props} />);
      const result = screen.getByRole("img").hasAttribute("data-flashing");
      unmount();
      return result;
    };
    expect(flashes({ lifecycle: "active-unacknowledged" })).toBe(true);
    expect(flashes({ lifecycle: "active-acknowledged" })).toBe(false);
    expect(flashes({ lifecycle: "resolved-unacknowledged" })).toBe(false);
    expect(flashes({ lifecycle: "resolved-acknowledged" })).toBe(false);
    expect(flashes({ lifecycle: "active-unacknowledged", availability: "snoozed" })).toBe(false);
    expect(flashes({})).toBe(false);
  });

  it("is neutral when the alarm is not in service, and keeps its number", () => {
    for (const availability of ["snoozed", "suppressed", "disabled"] as const) {
      const { unmount } = render(<PriorityMark priority="low" availability={availability} />);
      const mark = screen.getByRole("img");
      expect(mark.hasAttribute("data-neutral")).toBe(true);
      expect(mark.textContent).toBe("4");
      unmount();
    }
    render(<PriorityMark priority="low" />);
    expect(screen.getByRole("img").hasAttribute("data-neutral")).toBe(false);
  });
});

describe("PriorityMark stylesheet", () => {
  it("runs the flash on a token, so that `none` turns it off", () => {
    expect(CSS).toMatch(/animation:[^;]*var\(--u-duration-alarm-flash\)/);
  });

  it("stands still under reduced motion and rings the unacknowledged mark instead", () => {
    const block = CSS.slice(CSS.indexOf("@media (prefers-reduced-motion: reduce)"));
    expect(block).toMatch(/animation:\s*none/);
    expect(block).toMatch(/\[data-flashing\][^{]*\{[^}]*outline/);
  });

  it("keeps the shapes' fill in forced colours", () => {
    expect(CSS).toMatch(/@media \(forced-colors: active\)[\s\S]*forced-color-adjust:\s*none/);
  });
});
