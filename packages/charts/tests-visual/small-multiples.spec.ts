/* Small multiples on one y domain: equal domains give equal tick labels, so the
   six plot areas start at the same x. A layout check, not a picture; light only. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";

test("the six plot areas of the small multiples start at one x", { tag: "@quick" }, async ({ page }) => {
  test.skip(test.info().project.name.endsWith("dark"), "a layout check runs once (light)");
  await openExample(page, "axis", "small-multiples-on-one-y-domain");
  const example = page.locator('[data-example="small-multiples-on-one-y-domain"]');
  await example.scrollIntoViewIfNeeded();
  const plots = example.locator(".uc-plot");
  await expect(plots).toHaveCount(6);
  /* Each chart has its own root, so the plot areas' offsets from it must be equal. */
  const offsets = await plots.evaluateAll((els) =>
    els.map((el) => el.getBoundingClientRect().left - (el.closest(".uc-root") as HTMLElement).getBoundingClientRect().left),
  );
  expect(new Set(offsets.map((x) => Math.round(x * 100) / 100)).size).toBe(1);
});
