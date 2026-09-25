/* Interaction tests of the dock (floating-dock 03, 04, 05).

   They stand here and not in jsdom, because nothing of it would be observable
   there: jsdom reports every element as zero-sized, so there are no zones, no
   space requirement and no refusal - and `Element.animate` does not exist
   either, so no transition. The zone arithmetic itself is checked separately
   and without a DOM (`tests-unit/dockPlace.test.ts`); what stands here is the
   gesture. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openScenario, standstill } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await openScenario(page, "arrange-tool-panels");
});

/* The page shows TWO docks - a spacious one and a flat one. Every selector
   therefore names the one it means; a name alone would hit both. */
const spacious = (page: Page) => page.locator('[data-dock="spacious"]');
const flat = (page: Page) => page.locator('[data-dock="flat"]');
const strip = (where: Locator) => where.getByRole("group", { name: "Tools" });
const grip = (where: Locator) => where.getByRole("button", { name: "Move dock" });

/** An element's box, rounded to whole pixels. */
async function box(target: Locator) {
  const b = await target.boundingBox();
  if (b === null) throw new Error("no box");
  return { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
}

/** Drags the dock's grip to a point IN the host, without letting go. */
async function dragTo(page: Page, where: Locator, fractionX: number, fractionY: number) {
  const host = await box(where);
  await page.mouse.move(host.x + host.w * fractionX, host.y + host.h * fractionY);
}

/* First bring it into view. `boundingBox` yields coordinates in the viewport,
   and the page stands far down: without that the mouse aims at a point that
   does not exist on screen - and hits nothing. The keyboard tests do not fall
   for it, because `focus()` needs no coordinates. */
async function grab(page: Page, where: Locator) {
  await where.scrollIntoViewIfNeeded();
  const g = await box(grip(where));
  await page.mouse.move(g.x + g.w / 2, g.y + g.h / 2);
  await page.mouse.down();
}

test("A drag into the right zone snaps right and stands the strip up", async ({ page }) => {
  const where = spacious(page);
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await grab(page, where);
  await dragTo(page, where, 0.95, 0.5);
  await expect(strip(where)).toHaveAttribute("data-place", "right");
  await page.mouse.up();
  await standstill(page);
  await expect(strip(where)).toHaveCSS("flex-direction", "column");
  // Back down, and the strip lies down again.
  await grab(page, where);
  await dragTo(page, where, 0.5, 0.95);
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await page.mouse.up();
  await standstill(page);
  await expect(strip(where)).toHaveCSS("flex-direction", "row");
});

const PLACES = ["top", "right", "bottom", "left"] as const;

test("The dock stands at a named place in every frame", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  const seen = new Set<string>();
  const route: ReadonlyArray<readonly [number, number]> = [
    [0.9, 0.5],
    [0.5, 0.1],
    [0.1, 0.5],
    [0.5, 0.9],
    [0.5, 0.5],
  ];
  for (const [x, y] of route) {
    await dragTo(page, where, x, y);
    const place = await strip(where).getAttribute("data-place");
    expect(place).not.toBeNull();
    seen.add(place as string);
  }
  await page.mouse.up();
  /* All four occurred on the way - and never anything else. Both sides are
     sorted, so that the assertion does not depend on the order the four places
     happen to be named in: it was written against the German literals, whose
     alphabetical order is a different one. */
  expect([...seen].sort()).toEqual([...PLACES].sort());
});

test("Several changes in one drag make ONE motion, not a queue", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  /* Four zones in one drag. Every change breaks off the running one and starts
     where the dock currently LOOKS - otherwise four animations would queue up
     here, and the dock would still be on its way when the hand has long since
     stopped (ADR-0014). What is counted is therefore how many animations run
     at once per element: never more than one. */
  const route: ReadonlyArray<readonly [number, number]> = [
    [0.9, 0.5],
    [0.5, 0.1],
    [0.1, 0.5],
    [0.5, 0.9],
  ];
  for (const [x, y] of route) {
    await dragTo(page, where, x, y);
    const perElement = await strip(where).evaluate((el) =>
      [el, ...Array.from(el.children)].map((c) => (c as Element).getAnimations().length),
    );
    expect(Math.max(...perElement)).toBeLessThanOrEqual(1);
  }
  await page.mouse.up();
  await standstill(page);
  // And at the end it stands still, at a named place.
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
});

test("Even under fast dragging the tools stay in the strip", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  /* Four zones so quickly one after another that every change meets the
     previous one in the middle of its motion. That is exactly where the defect
     lay: the new resting position was measured WHILE the old animation was
     still pulling at the strip's position and shape - the measured distances
     were thereby computed against a layout that did not exist, and the tools
     flew out of their capsule.

     What is checked is therefore what a person sees: every tool lies within the
     strip in every frame. */
  const route: ReadonlyArray<readonly [number, number]> = [
    [0.95, 0.5],
    [0.5, 0.05],
    [0.05, 0.5],
    [0.5, 0.95],
    [0.95, 0.5],
  ];
  for (const [x, y] of route) {
    await dragTo(page, where, x, y);
    const outside = await strip(where).evaluate((el) => {
      const s = el.getBoundingClientRect();
      // A tolerance of one pixel for the rounding of the intermediate frames.
      return (Array.from(el.children) as HTMLElement[])
        .map((c) => c.getBoundingClientRect())
        .filter(
          (c) =>
            c.left < s.left - 1 || c.top < s.top - 1 || c.right > s.right + 1 || c.bottom > s.bottom + 1,
        ).length;
    });
    expect(outside).toBe(0);
  }
  await page.mouse.up();
});

test("The grip follows the pointer, the dock does not", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  /* Measured AFTER grabbing: `grab` first brings the page into view, and a box
     from before would be off by the scroll height. */
  const before = await box(strip(where));
  // A small distance that does not leave the lower zone.
  const host = await box(where);
  await page.mouse.move(host.x + host.w / 2 + 40, host.y + host.h - 10);
  const transform = await grip(where).evaluate((el) => getComputedStyle(el).transform);
  expect(transform).not.toBe("none");
  // The strip itself stands where it stood.
  expect(await box(strip(where))).toEqual(before);
  await page.mouse.up();
  await expect
    .poll(() => grip(where).evaluate((el) => getComputedStyle(el).transform))
    .toBe("none");
});

test("Escape in the middle of a drag restores the place from the start", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  await dragTo(page, where, 0.95, 0.5);
  await expect(strip(where)).toHaveAttribute("data-place", "right");
  await page.keyboard.press("Escape");
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  // The drag is over: a further pointer move shifts nothing any more.
  await dragTo(page, where, 0.95, 0.5);
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await page.mouse.up();
});

test("The four arrows on the grip are the four resting places", async ({ page }) => {
  const where = spacious(page);
  await grip(where).focus();
  for (const [key, place] of [
    ["ArrowUp", "top"],
    ["ArrowRight", "right"],
    ["ArrowDown", "bottom"],
    ["ArrowLeft", "left"],
    // Absolute and not relative: from the left it goes straight to the right.
    ["ArrowRight", "right"],
  ] as const) {
    await page.keyboard.press(key);
    await expect(strip(where)).toHaveAttribute("data-place", place);
    await standstill(page);
  }
});

test("A zone without room refuses visibly instead of keeping silent", async ({ page }) => {
  const where = flat(page);
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await grab(page, where);
  await dragTo(page, where, 0.95, 0.5);
  // The dock stays where it was - and the refusal is visible as long as the
  // pointer stands in the zone.
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await expect(where.locator("[data-refusal]")).toBeVisible();
  await expect(where.locator("[data-refusal]")).toHaveAttribute("data-place", "right");
  // Back into a zone with room: the refusal is gone.
  await dragTo(page, where, 0.5, 0.1);
  await expect(strip(where)).toHaveAttribute("data-place", "top");
  await expect(where.locator("[data-refusal]")).toHaveCount(0);
  await page.mouse.up();
});

test("The same place is not reachable with an arrow key either - and not mute", async ({ page }) => {
  const where = flat(page);
  await grip(where).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await expect(where.locator("[data-refusal]")).toBeVisible();
  // The refusal is heard as well: the message stands in the status line.
  await expect(where.getByRole("status")).toHaveText(/No room for the dock/);
});

test("If the host becomes too small, the dock goes to the next place that fits", async ({ page }) => {
  const where = spacious(page);
  await grip(where).focus();
  await page.keyboard.press("ArrowLeft");
  await expect(strip(where)).toHaveAttribute("data-place", "left");
  await standstill(page);
  // The area becomes flat - there is no more room for a standing dock.
  await where.locator("> div").evaluate((el: HTMLElement) => {
    el.style.height = "120px";
  });
  await expect(strip(where)).toHaveAttribute("data-place", "bottom");
  await standstill(page);
  // And it does not stick out.
  const host = await box(where);
  const dock = await box(strip(where));
  expect(dock.x).toBeGreaterThanOrEqual(host.x);
  expect(dock.x + dock.w).toBeLessThanOrEqual(host.x + host.w);
  expect(dock.y).toBeGreaterThanOrEqual(host.y);
  expect(dock.y + dock.h).toBeLessThanOrEqual(host.y + host.h);
});

test("The strip carries the translucent material (ADR-0012)", async ({ page }) => {
  const style = await strip(spacious(page)).evaluate((el) => {
    const s = getComputedStyle(el);
    return { filter: s.backdropFilter, background: s.backgroundColor };
  });
  expect(style.filter).toContain("blur");
  // And the colour underneath carries an alpha - an opaque pane would be a card
  // and not a window.
  expect(style.background).toMatch(/rgba\(/);
});

test("Under reduced motion the transition falls away, and the position is right all the same", async ({ page }) => {
  const where = spacious(page);
  await grip(where).focus();
  await page.keyboard.press("ArrowRight");
  await standstill(page);
  const withMotion = await box(strip(where));

  await page.emulateMedia({ reducedMotion: "reduce" });
  await openScenario(page, "arrange-tool-panels");
  const where2 = spacious(page);
  await grip(where2).focus();
  await page.keyboard.press("ArrowRight");
  // Immediately afterwards: nothing is running, and the position is already the
  // final one.
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  expect(await box(strip(where2))).toEqual(withMotion);
});

test("Nothing on the dock rotates", async ({ page }) => {
  const where = spacious(page);
  await grab(page, where);
  await dragTo(page, where, 0.95, 0.5);
  // In the middle of the transition: no element of the dock carries a rotation.
  const transforms = await strip(where).evaluate((el) =>
    [el, ...Array.from(el.querySelectorAll("*"))].map(
      (c) => getComputedStyle(c as Element).transform,
    ),
  );
  await page.mouse.up();
  for (const matrix of transforms) {
    if (matrix === "none") continue;
    // matrix(a, b, c, d, e, f): b and c are 0 for a pure translation.
    const parts = matrix.replace(/^matrix\(|\)$/g, "").split(",").map(Number);
    if (parts.length !== 6) continue;
    expect(Math.abs(parts[1] as number)).toBeLessThan(0.001);
    expect(Math.abs(parts[2] as number)).toBeLessThan(0.001);
  }
});
