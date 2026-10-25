/* Content beyond a card's size scrolls inside its body: nothing is cut and the
   card does not grow. Every card of the example fits except the open alerts,
   which have more rows than their size shows. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

const ALERTS = "a1";

const example = (page: Page) => page.locator('[data-example="dispatcher"]');

/** Every card's body by id, as how much it has to scroll on each axis. */
const overflows = (page: Page) =>
  example(page).locator("[data-widget]").evaluateAll((els) =>
    els.flatMap((el) => {
      const body = [...el.children].find((child) => child.className.includes("body"));
      return body ? [{ id: el.getAttribute("data-widget")!, y: body.scrollHeight - body.clientHeight, x: body.scrollWidth - body.clientWidth }] : [];
    }),
  );

const fitting = async (page: Page) => (await overflows(page)).filter(({ id }) => id !== ALERTS);

for (const width of [1280, 390]) {
  test(`@quick at ${width} px every card but the open alerts fits its body, at rest and in the editing mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openExample(page, "dashboard", "dispatcher");
    const rest = await fitting(page);
    expect(rest.length).toBeGreaterThan(0);
    expect(rest.filter(({ x, y }) => x > 0 || y > 0)).toEqual([]);
    await example(page).getByRole("button", { name: "Edit" }).click();
    await expect(example(page).locator("[data-widget][data-editing]").first()).toBeVisible();
    expect((await fitting(page)).filter(({ x, y }) => x > 0 || y > 0)).toEqual([]);
  });

  test(`@quick at ${width} px the open alerts scroll in their body, by wheel and by keys, and stand still in the editing mode`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await openExample(page, "dashboard", "dispatcher");
    const card = example(page).locator(`[data-widget="${ALERTS}"]`);
    const body = card.locator('[class*="body"]');
    const top = () => body.evaluate((el) => el.scrollTop);
    const last = () => body.evaluate((el) => Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) < 1);

    // The card keeps its size's height: four rows of 50 px and three gaps of 12 px.
    expect((await card.boundingBox())!.height).toBeCloseTo(236, 0);
    await expect(body).toHaveAttribute("tabindex", "0");
    await expect(body).toHaveAccessibleName("Open alerts");

    await body.hover();
    await page.mouse.wheel(0, 2000);
    await expect.poll(last).toBe(true);
    await body.evaluate((el) => (el.scrollTop = 0));

    // Tab reaches the body, a card that fits is skipped, and the arrow keys scroll it.
    await example(page).getByRole("button", { name: "Edit" }).focus();
    const reached: string[] = [];
    for (let i = 0; i < 12; i++) {
      await page.keyboard.press("Tab");
      reached.push(await page.evaluate(() => document.activeElement?.closest("[data-widget]")?.getAttribute("data-widget") ?? ""));
      if (reached.at(-1) === ALERTS) break;
    }
    expect(reached.at(-1)).toBe(ALERTS);
    expect(reached.filter((id) => id && id !== ALERTS && id !== "t1")).toEqual([]);
    /* The browser animates a key's scroll, so the end is polled while the key is pressed. */
    await expect
      .poll(async () => {
        await page.keyboard.press("ArrowDown");
        return last();
      })
      .toBe(true);
    await body.evaluate((el) => (el.scrollTop = 40));

    // In the mode neither the wheel nor the keys scroll it, and it stands where it stood.
    await example(page).getByRole("button", { name: "Edit" }).click();
    await expect(card).toHaveAttribute("data-editing");
    await expect(body).not.toHaveAttribute("tabindex", /.*/);
    const box = (await body.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 2000);
    await page.keyboard.press("ArrowDown");
    expect(await top()).toBe(40);
    await example(page).getByRole("button", { name: "Done" }).click();
    await expect(card).not.toHaveAttribute("data-editing");
    expect(await top()).toBe(40);
  });
}
