/* A Popover in the body is glued to its trigger: the page scrolls it natively,
   so the distance between the two does not change in any frame. It changes its
   side only when the side it stands on runs out of room, and does not change
   back when the first side has room again. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

type Frame = { scroll: number; gap: number; above: boolean };

/* One reading per frame of where the panel stands against the trigger, while `move` runs. */
async function sampled(page: Page, move: () => Promise<void>): Promise<Frame[]> {
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((b) => b.textContent === "Sprint 14")!;
    const panel = document.querySelector('[role="dialog"][aria-label="Sprint 14"]')!;
    const frames: Frame[] = [];
    const w = window as unknown as { __frames: Frame[]; __stop: boolean };
    w.__frames = frames;
    w.__stop = false;
    const tick = () => {
      const a = button.getBoundingClientRect();
      const p = panel.getBoundingClientRect();
      frames.push({ scroll: scrollY, gap: Math.round((p.top - a.top) * 10) / 10, above: p.bottom <= a.top + 1 });
      if (!w.__stop) requestAnimationFrame(tick);
    };
    tick();
  });
  await move();
  await page.evaluate(() => new Promise((frame) => requestAnimationFrame(frame)));
  return page.evaluate(() => {
    const w = window as unknown as { __frames: Frame[]; __stop: boolean };
    w.__stop = true;
    return w.__frames;
  });
}

/* Within one side the gap is one number (to a subpixel of rounding); a flip is the only change.
   The sides the frames show, in order, each with the spread of its gap. */
function sides(frames: Frame[]) {
  const runs: { above: boolean; spread: number }[] = [];
  for (const side of [false, true]) {
    const gaps = frames.filter((f) => f.above === side).map((f) => f.gap);
    if (gaps.length) runs.push({ above: side, spread: Math.max(...gaps) - Math.min(...gaps) });
  }
  return runs;
}

test("@quick A Popover scrolls with its trigger, flips only when its side runs out and stays", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 260 });
  await openExample(page, "popover", "anchored-surface");
  await page.evaluate(() => scrollTo(0, 120));
  await page.getByRole("button", { name: "Sprint 14", exact: true }).click();
  const panel = page.getByRole("dialog", { name: "Sprint 14" });
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((el) => getComputedStyle(el).position)).toBe("absolute");
  await page.mouse.move(450, 130);

  // Up: the trigger travels towards the bottom edge, the room below runs out, the panel goes above.
  const up = await sampled(page, async () => {
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, -20);
  });
  expect(up.at(-1)!.scroll).toBeLessThan(up[0]!.scroll);
  expect(up[0]!.above).toBe(false);
  expect(up.at(-1)!.above).toBe(true);
  expect(sides(up).map((r) => r.spread).every((spread) => spread < 1)).toBe(true);
  expect(up.findIndex((f) => f.above)).toBeGreaterThan(up.map((f) => f.above).lastIndexOf(false));

  // Down: below has room again, but the panel stays above and does not move against its trigger.
  const down = await sampled(page, async () => {
    for (let i = 0; i < 6; i += 1) await page.mouse.wheel(0, 20);
  });
  expect(down.at(-1)!.scroll).toBeGreaterThan(down[0]!.scroll);
  expect(sides(down).map((r) => r.spread).every((spread) => spread < 1)).toBe(true);
  expect(down.every((f) => f.above)).toBe(true);
});
