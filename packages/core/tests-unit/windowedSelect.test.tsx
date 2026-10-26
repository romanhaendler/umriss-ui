/* A Select's windowed list: positions in the set, and End reaches the last
   option and draws it. 2,000 options stand for thousands, as jsdom reads
   native options in quadratic time. */

import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Select } from "../src/components/Select";

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(240);
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({ height: 32 } as DOMRect);
});
afterEach(() => vi.restoreAllMocks());

it("tells each option's place in the set, and End makes the last active and draws it", () => {
  render(
    <Select aria-label="Centre" defaultValue="">
      {Array.from({ length: 2000 }, (_, i) => (
        <option key={i} value={`v${i + 1}`}>{`Centre ${i + 1}`}</option>
      ))}
    </Select>,
  );
  const trigger = screen.getByRole("combobox");
  fireEvent.pointerDown(trigger, { pointerType: "mouse", button: 0 });
  fireEvent.mouseDown(trigger, { button: 0 });
  const list = within(screen.getByRole("listbox"));
  const first = list.getAllByRole("option")[0]!;
  expect(first.getAttribute("aria-setsize")).toBe("2000");
  expect(first.getAttribute("aria-posinset")).toBe("1");
  expect(list.getAllByRole("option").length).toBeLessThan(100);

  fireEvent.keyDown(trigger, { key: "End" });
  const last = list.getByRole("option", { name: "Centre 2000" });
  expect(last.getAttribute("aria-posinset")).toBe("2000");
  expect(trigger.getAttribute("aria-activedescendant")).toBe(last.id);
  expect(list.getAllByRole("option").length).toBeLessThan(100);
}, 60000);
