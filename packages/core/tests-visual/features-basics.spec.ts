/* Interaction tests – the basic stock, in the features-*.spec.ts pattern.
   Selectors aim at roles and visible texts of the demo, not at CSS classes.
   Run only in the light ui project (behaviour is theme-independent;
   screenshots cover dark). */

import { test, expect, type Locator, type Page } from "@playwright/test";
import { openExample } from "./navigation";
import { failToSave, openTheModal, sampleFrames, seen } from "./insideAModal";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

/* This file touches several pages – layers, tabs, menu. Each test therefore
   opens what it means itself; a shared goto would exist only if the demo
   showed everything at once, and that is exactly what it deliberately does
   not do. */
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

/* The five table tests of this file went with the table (umriss-table 14).
   Their counterparts stand in
   `packages/table/tests-visual/features-table.spec.ts` and run against the
   scenario of the demo of @umriss-ui/table. */

test("Modal opens and closes on Escape", async ({ page }) => {
  await openExample(page, "modal", "a-window");
  await page.getByRole("button", { name: "Open the modal", exact: true }).click();
  await expect(page.getByText("Create a project")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByText("Create a project")).toBeHidden();
});

test("Toast appears with a title and a description", async ({ page }) => {
  await openExample(page, "toast", "show-a-toast");
  await page.getByRole("button", { name: "Show a toast" }).click();
  await expect(page.getByText("Export finished")).toBeVisible();
  await expect(page.getByText("The project list is ready as a CSV.")).toBeVisible();
});

/* toast-refinement: what jsdom cannot show. A click leaves the focus on the
   close button, and the toast goes with it without a blur - the deck once
   stayed open for good. And the deck opens for the keyboard: Alt+T, Escape
   back to where the focus was. */
test("Toast deck closes again after a click on a close button", async ({ page }) => {
  await openExample(page, "toast", "until-closed");
  const trigger = page.getByRole("button", { name: "Go offline" });
  for (let i = 0; i < 3; i++) await trigger.click();
  await page.getByRole("button", { name: "Close message" }).last().click();
  await page.mouse.move(0, 0);
  await expect(page.getByRole("button", { name: "2 messages, show all" })).toBeVisible();
});

test("Toast deck opens with Alt+T and gives the focus back on Escape", async ({ page }) => {
  await openExample(page, "toast", "until-closed");
  const trigger = page.getByRole("button", { name: "Go offline" });
  await trigger.click();
  await trigger.click();
  await trigger.focus();
  await page.keyboard.press("Alt+KeyT");
  await expect(page.getByRole("region", { name: "Messages (Alt+T)" })).toBeFocused();
  await expect(page.getByRole("button", { name: "2 messages, show all" })).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("button", { name: "2 messages, show all" })).toBeVisible();
});

/* A page of the demo is one application: one deck for the toasts of every
   example on it. */
test("Scan four parcels, then Save in the modal: one deck, nothing lies on another, Retry is pressable", async ({ page }) => {
  await openExample(page, "toast", "how-many-stand");
  await page.getByRole("button", { name: "Scan four parcels" }).click();
  await page.getByRole("button", { name: "Edit the profile" }).click();
  const dialog = page.getByRole("dialog", { name: "Edit the profile" });
  await expect(dialog).toBeVisible();

  /* Every frame for 500 ms from the press: how many decks stand, i.e. how
     many places hold toast cards. Cards of one deck stack as it draws them;
     two decks would be two places. */
  await page.evaluate(() => {
    const state = { decks: new Set<number>(), running: true };
    (window as unknown as { __decks: typeof state }).__decks = state;
    const frame = () => {
      const places = new Set([...document.querySelectorAll("[data-toast]")].map((card) => card.closest("[data-edge]")));
      state.decks.add(places.size);
      if (state.running) requestAnimationFrame(frame);
    };
    frame();
  });
  await dialog.getByRole("button", { name: "Save" }).click();
  const region = page.getByRole("region", { name: "Messages (Alt+T)" });
  await expect(region.getByText("Profile not saved")).toBeVisible();
  await page.waitForTimeout(500);
  const decks = await page.evaluate(() => {
    const state = (window as unknown as { __decks: { decks: Set<number>; running: boolean } }).__decks;
    state.running = false;
    return Math.max(...state.decks);
  });
  expect(decks).toBe(1);
  await expect(region).toHaveCount(1);
  const standing = await page.locator("[data-toast]").count();
  await expect(page.getByRole("button", { name: `${standing} messages, show all` })).toBeVisible();

  const retry = region.getByRole("button", { name: "Retry" });
  const box = (await retry.boundingBox())!;
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.textContent,
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(hit).toBe("Retry");
});

test("Go offline, then Scan four parcels: one deck, and Working offline still stands", async ({ page }) => {
  await openExample(page, "toast", "until-closed");
  await page.getByRole("button", { name: "Go offline" }).click();
  await expect(page.getByText("Working offline")).toBeVisible();
  await page.getByRole("button", { name: "Scan four parcels" }).click();
  await page.waitForTimeout(500);
  await expect(page.getByRole("region", { name: "Messages (Alt+T)" })).toHaveCount(1);
  await expect(page.getByText("Working offline")).toBeVisible();
  const places = await page.locator("[data-toast]").evaluateAll((cards) =>
    cards.map((card) => {
      const box = card.getBoundingClientRect();
      return `${Math.round(box.x)},${Math.round(box.y)}`;
    }),
  );
  expect(new Set(places).size, places.join(" ")).toBe(places.length);
});

/* The setting of one example stays when another writes its own key. */
test("Hold the toasts on and off leaves the limit of How many stand at once", async ({ page }) => {
  await openExample(page, "toast", "hold-the-toasts");
  const hold = page.locator('[data-example="hold-the-toasts"]').locator("label", { hasText: "Hold the toasts" });
  await page.getByRole("button", { name: "Scan four parcels" }).click();
  await expect(page.locator("[data-toast]")).toHaveCount(2);
  await hold.click();
  await hold.click();
  await page.getByRole("button", { name: "Send a toast" }).click();
  await page.getByRole("button", { name: "Send a toast" }).click();
  await page.waitForTimeout(500);
  await expect(page.locator("[data-toast]")).toHaveCount(2);
});

/* The toasts above an open modal dialog: the unit setup's dialog makes nothing
   inert, so only a browser shows that a toast in the dialog can be pressed. */
test("A toast above a modal is pressable and closes without closing the modal", async ({ page }) => {
  const { dialog, region } = await failToSave(page);
  const cross = region.getByRole("button", { name: "Close message" });
  const box = (await cross.boundingBox())!;
  const hit = await page.evaluate(
    ({ x, y }) => document.elementFromPoint(x, y)?.closest("button")?.getAttribute("aria-label"),
    { x: box.x + box.width / 2, y: box.y + box.height / 2 },
  );
  expect(hit).toBe("Close message");
  await cross.click();
  await expect(region.getByText("Profile not saved")).toBeHidden();
  await expect(dialog).toBeVisible();
});

test("The action of a toast above a modal runs", async ({ page }) => {
  const { region } = await failToSave(page);
  const first = await region.getByText("Profile not saved").elementHandle();
  await region.getByRole("button", { name: "Retry" }).click();
  /* Retry closes its toast and saves again: a new toast stands in its place. */
  await expect.poll(() => first!.evaluate((element) => element.isConnected)).toBe(false);
  await expect(region.getByText("Profile not saved")).toBeVisible();
});

test("Alt+T inside a modal moves the focus into the toasts, and Escape gives it back and leaves the modal", async ({ page }) => {
  const { dialog, save, region } = await failToSave(page);
  /* WebKit leaves a pressed button unfocused. */
  await save.focus();
  await page.keyboard.press("Alt+KeyT");
  await expect(region).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(save).toBeFocused();
  await expect(dialog).toBeVisible();
});

test("Escape in the deck above a modal leaves the modal open once its exit would have run", async ({ page }) => {
  const { dialog, save, region } = await failToSave(page);
  await save.focus();
  await page.keyboard.press("Alt+KeyT");
  await expect(region).toBeFocused();
  await page.keyboard.press("Escape");
  /* Well past the modal's exit: a cancel that reached it closes it by then. */
  await page.waitForTimeout(800);
  await expect(dialog).toBeVisible();
  await expect(save).toBeFocused();
});

test("A dialog opened with show() leaves the toasts where they were", async ({ page }) => {
  const { dialog, region } = await failToSave(page);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await page.evaluate(() => {
    const plain = document.createElement("dialog");
    plain.textContent = "Not modal";
    document.body.append(plain);
    plain.show();
  });
  await expect(page.getByText("Not modal")).toBeVisible();
  expect(await region.evaluate((element) => element.closest("dialog"))).toBeNull();
});

test("The inset tokens move the toasts above a modal as they do without one", async ({ page }) => {
  const { region } = await failToSave(page);
  await page.addStyleTag({
    content: ":root { --u-toast-inset-top: 72px; --u-toast-inset-bottom: 64px; --u-toast-inset-start: 88px; --u-toast-inset-end: 96px; }",
  });
  const place = region.locator("xpath=ancestor-or-self::*[@data-edge][1]");
  await expect
    .poll(() =>
      place.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return element.getAttribute("data-edge") === "top" ? rect.top : innerHeight - rect.bottom;
      }),
    )
    .toBeCloseTo(await place.evaluate((element) => (element.getAttribute("data-edge") === "top" ? 72 : 64)), 0);
  /* The example's toasts stand at the end side. */
  await expect
    .poll(() => place.evaluate((element) => document.documentElement.clientWidth - element.getBoundingClientRect().right))
    .toBeCloseTo(96, 0);
});

/* Inside a dialog the region stands in the top layer: a dialog that moves,
   clips or fades itself leaves the toast where it was. Every card's box is
   read in every animation frame (`sampleFrames`). */
test("A toast standing before the modal opens, and while it closes, does not move", async ({ page }) => {
  const { dialog, region } = await failToSave(page);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Profile not saved")).toBeVisible();

  const stopOpening = await sampleFrames(page);
  await page.getByRole("button", { name: "Edit the profile" }).click();
  await page.waitForTimeout(600);
  const opening = await stopOpening();
  expect(seen(opening, 0, "x")).toEqual({ values: [expect.any(Number)], missing: 0 });
  expect(seen(opening, 0, "y")).toEqual({ values: [expect.any(Number)], missing: 0 });
  await expect(dialog).toBeVisible();
  await expect(region).toHaveAttribute("popover", "manual");
  await expect(region).toHaveCount(1);

  const stopClosing = await sampleFrames(page);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await page.waitForTimeout(600);
  const closing = await stopClosing();
  expect(seen(closing, 0, "x")).toEqual({ values: seen(opening, 0, "x").values, missing: 0 });
  expect(seen(closing, 0, "y")).toEqual({ values: seen(opening, 0, "y").values, missing: 0 });
});

test("Two toasts standing before the modal opens keep their boxes while it opens and closes", async ({ page }) => {
  const { dialog, save } = await failToSave(page);
  await save.click();
  await expect(page.locator("[data-toast]")).toHaveCount(2);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();

  for (const move of ["opens", "closes"]) {
    const stop = await sampleFrames(page);
    if (move === "opens") await page.getByRole("button", { name: "Edit the profile" }).click();
    else await dialog.getByRole("button", { name: "Cancel" }).click();
    await page.waitForTimeout(600);
    const frames = await stop();
    for (const index of [0, 1]) {
      for (const field of ["x", "y", "width", "height", "surface"] as const) {
        expect(seen(frames, index, field), `${move}: card ${index}, ${field}`).toEqual({ values: [expect.any(Number)], missing: 0 });
      }
    }
  }
});

test("A toast stands still in a dialog that slides by transform and clips its content", async ({ page }) => {
  const { dialog } = await failToSave(page);
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).toBeHidden();
  await expect(page.getByText("Profile not saved")).toBeVisible();

  const at = await page.locator("[data-toast]").filter({ hasText: "Profile not saved" }).boundingBox();
  const stop = await sampleFrames(page);
  await page.evaluate(() => {
    const plain = document.createElement("dialog");
    plain.textContent = "Slides in";
    plain.id = "slides-in";
    plain.style.cssText = "width: 220px; height: 120px; overflow: hidden; padding: 0; transform: translateX(0);";
    document.body.append(plain);
    plain.showModal();
    plain.animate([{ transform: "translateX(-300px)" }, { transform: "translateX(0)" }], { duration: 400, easing: "ease-out" });
    /* Out again: it slides away, then closes. */
    setTimeout(() => {
      plain
        .animate([{ transform: "translateX(0)" }, { transform: "translateX(300px)" }], { duration: 300, fill: "forwards" })
        .finished.then(() => plain.close());
    }, 700);
  });
  await page.waitForTimeout(1300);
  const frames = await stop();
  await page.locator("#slides-in").evaluate((element) => element.remove());
  expect(seen(frames, 0, "x")).toEqual({ values: [Math.round(at!.x)], missing: 0 });
  expect(seen(frames, 0, "y")).toEqual({ values: [Math.round(at!.y)], missing: 0 });
});

/* The entrance takes two seconds here, so that a card cut or restarted at the
   move shows in the opacity: the modal's exit is shorter than the entrance
   it runs into. */
const SLOW_ENTRANCE = ":root { --u-duration-medium: 2000ms; }";

test("A toast arriving as the modal closes goes on with its entrance in the new place", async ({ page }) => {
  await openTheModal(page);
  await page.addStyleTag({ content: SLOW_ENTRANCE });
  const stop = await sampleFrames(page);
  /* "Save" fails and "Cancel" closes in one tick: the move comes some 160 ms into the entrance. */
  await page.evaluate(() => {
    const dialog = document.querySelector("dialog")!;
    const press = (name: string) => [...dialog.querySelectorAll("button")].find((button) => button.textContent === name)!.click();
    press("Save");
    press("Cancel");
  });
  await expect(page.getByRole("dialog")).toBeHidden();
  await page.waitForTimeout(2300);
  const opacities = (await stop()).flatMap((cards) => cards.slice(0, 1).map((card) => card.opacity));
  expect(opacities.at(-1)).toBe(1);
  expect(opacities.length).toBeGreaterThan(20);
  /* No restart (a fall) and no cut (a jump) at the move. */
  const steps = opacities.slice(1).map((opacity, index) => opacity - opacities[index]!);
  expect(Math.min(...steps)).toBeGreaterThanOrEqual(-0.01);
  expect(Math.max(...steps)).toBeLessThan(0.25);
});

test("A toast shown in the tick of a dialog that closes at once enters once, outside it", async ({ page }) => {
  await openTheModal(page);
  await page.addStyleTag({ content: SLOW_ENTRANCE });
  const stop = await sampleFrames(page);
  await page.evaluate(() => {
    const dialog = document.querySelector("dialog")!;
    [...dialog.querySelectorAll("button")].find((button) => button.textContent === "Save")!.click();
    dialog.close();
  });
  await page.waitForTimeout(2300);
  const opacities = (await stop()).flatMap((cards) => cards.slice(0, 1).map((card) => card.opacity));
  expect(opacities[0]).toBeLessThan(0.3);
  expect(opacities.at(-1)).toBe(1);
  const steps = opacities.slice(1).map((opacity, index) => opacity - opacities[index]!);
  expect(Math.min(...steps)).toBeGreaterThanOrEqual(-0.01);
  expect(Math.max(...steps)).toBeLessThan(0.25);
});

test("At a phone's width a toast above a modal takes the window's width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 800 });
  const { region } = await failToSave(page);
  await expect(region).toHaveAttribute("popover", "manual");
  const box = (await region.boundingBox())!;
  expect(box.x).toBeCloseTo(16, 0);
  expect(box.width).toBeCloseTo(390 - 32, 0);
});

test("After Alt+T above a modal the region's focus ring is drawn", async ({ page }) => {
  const { save, region } = await failToSave(page);
  await save.focus();
  await page.keyboard.press("Alt+KeyT");
  await expect(region).toBeFocused();
  expect(await region.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe("none");
});

test("In forced colours the deck above a modal has no box of its own", async ({ page }) => {
  await page.emulateMedia({ forcedColors: "active" });
  const { region } = await failToSave(page);
  const own = await region.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      border: [style.borderTopWidth, style.borderRightWidth, style.borderBottomWidth, style.borderLeftWidth],
      padding: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft],
      background: style.backgroundColor,
    };
  });
  expect(own.background).toMatch(/, 0\)$/);
  expect(own).toMatchObject({ border: ["0px", "0px", "0px", "0px"], padding: ["0px", "0px", "0px", "0px"] });
});

test("With reduced motion a toast above a modal appears and leaves without movement", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const dialog = await openTheModal(page);
  const stopAppearing = await sampleFrames(page);
  await dialog.getByRole("button", { name: "Save" }).click();
  await page.waitForTimeout(400);
  const appearing = await stopAppearing();
  const appeared = { x: seen(appearing, 0, "x").values, y: seen(appearing, 0, "y").values };
  const stands = (await page.locator("[data-toast]").filter({ hasText: "Profile not saved" }).boundingBox())!;
  expect(appeared.x.length).toBeLessThanOrEqual(2);
  expect(appeared.y.length).toBeLessThanOrEqual(2);
  expect(appeared.x.at(-1)).toBe(Math.round(stands.x));
  expect(appeared.y.at(-1)).toBe(Math.round(stands.y));
  const stopLeaving = await sampleFrames(page);
  await page.getByRole("button", { name: "Close message" }).click();
  await page.waitForTimeout(400);
  const leaving = await stopLeaving();
  expect(seen(leaving, 0, "x").values).toEqual(appeared.x.slice(-1));
  expect(seen(leaving, 0, "y").values).toEqual(appeared.y.slice(-1));
});

/* A tooltip in a dialog stands in the top layer, shown later than the toast
   region: it lies above the toasts, a menu does not. The window is narrow so
   that the deck, which takes its width, covers the modal's Preview button. A
   tooltip takes no pointer events; the question is asked with it hit-testable. */
async function previewTip(page: Page, { size = { width: 390, height: 520 }, low = false } = {}) {
  await page.setViewportSize(size);
  const { dialog, region } = await failToSave(page);
  const preview = dialog.getByRole("button", { name: "Preview" });
  /* Low in the window, where the deck stands. */
  if (low) await preview.evaluate((element) => Object.assign(element.style, { position: "fixed", bottom: "60px", left: "40px" }));
  return { dialog, region, preview, tip: await hoverPreview(page, preview) };
}

/* The pointer entering the trigger, which works where it is covered by the
   deck and in every engine. Past the tooltip's entry, so that its box is the
   one it keeps. */
async function hoverPreview(page: Page, preview: Locator) {
  await preview.dispatchEvent("pointerover");
  const tip = page.getByRole("tooltip").filter({ hasText: "Shows the profile" });
  await expect(tip).toBeVisible();
  await page.waitForTimeout(300);
  return tip;
}

function overlap(a: { x: number; y: number; width: number; height: number }, b: typeof a) {
  const left = Math.max(a.x, b.x);
  const top = Math.max(a.y, b.y);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const bottom = Math.min(a.y + a.height, b.y + b.height);
  return right > left && bottom > top ? { x: (left + right) / 2, y: (top + bottom) / 2 } : null;
}

test("A tooltip in a modal lies above a toast where the two overlap", async ({ page }) => {
  const { tip } = await previewTip(page, { low: true });
  await expect(tip).toHaveAttribute("popover", "manual");
  await tip.evaluate((element) => ((element as HTMLElement).style.pointerEvents = "auto"));
  const card = page.locator("[data-toast]").filter({ hasText: "Profile not saved" });
  const point = overlap((await tip.boundingBox())!, (await card.boundingBox())!);
  expect(point).not.toBeNull();
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[role]")?.getAttribute("role"), point!)).toBe("tooltip");
});

test("A list opened in a modal lies under a toast where the two overlap", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 520 });
  const { dialog } = await failToSave(page);
  await dialog.getByRole("combobox", { name: "Language" }).click();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  /* Past the entries of the list and of the toast, so that their boxes are the ones they keep. */
  await page.waitForTimeout(400);
  const card = page.locator("[data-toast]").filter({ hasText: "Profile not saved" });
  const point = overlap((await list.boundingBox())!, (await card.boundingBox())!);
  expect(point).not.toBeNull();
  expect(await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest("[data-toast], [role=listbox]")?.getAttribute("role") ?? "toast", point!)).toBe("toast");
});

test("A tooltip in a modal stands centred above its trigger", async ({ page }) => {
  const { tip, preview } = await previewTip(page, { size: { width: 800, height: 700 } });
  const t = (await tip.boundingBox())!;
  const p = (await preview.boundingBox())!;
  expect(t.x + t.width / 2).toBeCloseTo(p.x + p.width / 2, 0);
  expect(Math.abs(t.y + t.height + 8 - p.y)).toBeLessThanOrEqual(1);
});

test("A tooltip in a modal flips below its trigger where the window ends above", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  const dialog = await openTheModal(page);
  const preview = dialog.getByRole("button", { name: "Preview" });
  /* The button is moved to the window's top, where there is no room above it. */
  await preview.evaluate((element) => {
    element.style.position = "fixed";
    element.style.top = "4px";
    element.style.left = "300px";
  });
  const tip = await hoverPreview(page, preview);
  const t = (await tip.boundingBox())!;
  const p = (await preview.boundingBox())!;
  expect(Math.abs(t.y - (p.y + p.height + 8))).toBeLessThanOrEqual(1);
});

test("A tooltip in a dialog that transforms itself stands at its trigger", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 700 });
  const dialog = await openTheModal(page);
  await dialog.evaluate((element) => ((element as HTMLElement).style.transform = "translate(37px, 23px) scale(1)"));
  const preview = dialog.getByRole("button", { name: "Preview" });
  const tip = await hoverPreview(page, preview);
  const t = (await tip.boundingBox())!;
  const p = (await preview.boundingBox())!;
  expect(t.x + t.width / 2).toBeCloseTo(p.x + p.width / 2, 0);
  expect(Math.abs(t.y + t.height + 8 - p.y)).toBeLessThanOrEqual(1);
});

test("A tooltip outside a dialog carries no popover attribute", async ({ page }) => {
  await openExample(page, "tooltip", "a-tooltip");
  await page.getByRole("button", { name: "Duplicate the board" }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(page.getByRole("tooltip")).not.toHaveAttribute("popover", /.*/);
});

/* The distance from the window's top and bottom edge is a token per edge, the
   distance from its sides a token per side. Unset, the region stands 20 px
   away, 16 px on a phone; set on `:root`, a token moves every position of its
   edge or side at every width and leaves the others alone. On a phone the
   region takes the window's width, so each side token is the room at its side
   at all six positions. */
const TOAST_POSITIONS = ["Top start", "Top center", "Top end", "Bottom start", "Bottom center", "Bottom end"];

async function toastInsets(page: import("@playwright/test").Page, width: number, tokens = "") {
  await page.setViewportSize({ width, height: 800 });
  await openExample(page, "toast", "where-they-stand");
  if (tokens !== "") await page.addStyleTag({ content: `:root { ${tokens} }` });
  const insets: Record<string, { edge: number; start: number; end: number }> = {};
  for (const name of TOAST_POSITIONS) {
    await page.getByRole("button", { name, exact: true }).click();
    const region = page.locator("[data-edge]").filter({ has: page.getByText(`Standing ${name.toLowerCase()}.`) });
    await expect(region).toBeVisible();
    insets[name] = await region.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        edge: element.getAttribute("data-edge") === "top" ? rect.top : innerHeight - rect.bottom,
        start: rect.left,
        end: document.documentElement.clientWidth - rect.right,
      };
    });
  }
  return insets;
}

for (const width of [1280, 320]) {
  const unset = width === 320 ? 16 : 20;
  const phone = width === 320;
  /* A position stands at its own side, on a phone at both; a center one above
     600 px at neither, in the middle of the window. */
  const expectSides = (name: string, inset: { start: number; end: number }, start: number, end: number) => {
    if (phone || name.endsWith("start")) expect(inset.start, name).toBeCloseTo(start, 0);
    if (phone || name.endsWith("end")) expect(inset.end, name).toBeCloseTo(end, 0);
    if (!phone && name.endsWith("center")) expect(inset.start, name).toBeCloseTo(inset.end, 0);
  };

  test(`Toasts stand where they always stood without the tokens (${width} px)`, async ({ page }) => {
    for (const [name, inset] of Object.entries(await toastInsets(page, width))) {
      expect(inset.edge, name).toBeCloseTo(unset, 0);
      expectSides(name, inset, unset, unset);
    }
  });

  test(`The top token moves the top toasts only (${width} px)`, async ({ page }) => {
    const insets = await toastInsets(page, width, "--u-toast-inset-top: 72px;");
    for (const [name, inset] of Object.entries(insets)) {
      expect(inset.edge, name).toBeCloseTo(name.startsWith("Top") ? 72 : unset, 0);
      expectSides(name, inset, unset, unset);
    }
  });

  test(`The bottom token moves the bottom toasts only (${width} px)`, async ({ page }) => {
    const insets = await toastInsets(page, width, "--u-toast-inset-bottom: 64px;");
    for (const [name, inset] of Object.entries(insets)) {
      expect(inset.edge, name).toBeCloseTo(name.startsWith("Bottom") ? 64 : unset, 0);
      expectSides(name, inset, unset, unset);
    }
  });

  test(`The start token moves the toasts' start side only (${width} px)`, async ({ page }) => {
    const insets = await toastInsets(page, width, "--u-toast-inset-start: 88px;");
    for (const [name, inset] of Object.entries(insets)) {
      expect(inset.edge, name).toBeCloseTo(unset, 0);
      expectSides(name, inset, 88, unset);
    }
  });

  test(`The end token moves the toasts' end side only (${width} px)`, async ({ page }) => {
    const insets = await toastInsets(page, width, "--u-toast-inset-end: 88px;");
    for (const [name, inset] of Object.entries(insets)) {
      expect(inset.edge, name).toBeCloseTo(unset, 0);
      expectSides(name, inset, unset, 88);
    }
  });
}

/* The toast's width is a token an application reads to decide whether the
   deck has room beside a surface, and may set. On a phone the toast keeps the
   window's width minus the side tokens. */
for (const width of [1280, 320]) {
  test(`The width token sets the toast's width above a phone's width only (${width} px)`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await openExample(page, "toast", "where-they-stand");
    await page.addStyleTag({ content: ":root { --u-toast-width: 420px; }" });
    await page.getByRole("button", { name: "Top end", exact: true }).click();
    const card = page.locator("[data-toast]").filter({ hasText: "Standing top end." });
    await expect(card).toBeVisible();
    /* Polled: the entrance scales the card up to its width. */
    await expect.poll(async () => (await card.boundingBox())!.width).toBeCloseTo(width === 1280 ? 420 : 320 - 2 * 16, 0);
  });
}

/** Waits until the deck's entrance and transitions have run. */
async function deckAtRest(page: Page) {
  const region = page.locator("[data-edge]:has([data-toast])");
  await expect.poll(() => region.evaluate((element) => element.getAnimations({ subtree: true }).length)).toBe(0);
}

/* The deck glides when the application changes its distance from the window,
   in the time and easing of its height. The region's box is read in every
   animation frame in which a card is seen (a held card is not). */
type DeckFrame = { top: number; bottom: number; end: number };
async function sampleTheDeck(page: Page): Promise<() => Promise<DeckFrame[]>> {
  await page.evaluate(() => {
    const state = { running: true, frames: [] as { top: number; bottom: number; end: number }[] };
    (window as unknown as { __deck: typeof state }).__deck = state;
    const frame = () => {
      const card = document.querySelector("[data-toast]");
      const region = card?.closest("[hidden]") ? null : card?.closest("[data-edge]");
      if (region) {
        const box = region.getBoundingClientRect();
        const { clientWidth, clientHeight } = document.documentElement;
        state.frames.push({ top: Math.round(box.top), bottom: Math.round(clientHeight - box.bottom), end: Math.round(clientWidth - box.right) });
      }
      if (state.running) requestAnimationFrame(frame);
    };
    frame();
  });
  return () =>
    page.evaluate(() => {
      const state = (window as unknown as { __deck: { running: boolean; frames: DeckFrame[] } }).__deck;
      state.running = false;
      return state.frames;
    });
}

async function standingTopEnd(page: Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "where-they-stand");
  await page.getByRole("button", { name: "Top end", exact: true }).click();
  await expect(page.getByText("Standing top end.")).toBeVisible();
  await deckAtRest(page);
}

for (const [token, side] of [["--u-toast-inset-top", "top"], ["--u-toast-inset-end", "end"]] as const) {
  test(`A change of ${token} while toasts are seen glides the deck to its new place`, async ({ page }) => {
    await standingTopEnd(page);
    const stop = await sampleTheDeck(page);
    await page.addStyleTag({ content: `:root { ${token}: 96px; }` });
    await page.waitForTimeout(600);
    const values = [...new Set((await stop()).map((frame) => frame[side]))];
    expect(values[0]).toBe(20);
    expect(values.at(-1)).toBe(96);
    expect(values.some((value) => value > 20 && value < 96), `between: ${values.join(", ")}`).toBe(true);
  });

  test(`With reduced motion a change of ${token} moves the deck at once`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await standingTopEnd(page);
    const stop = await sampleTheDeck(page);
    await page.addStyleTag({ content: `:root { ${token}: 96px; }` });
    await page.waitForTimeout(600);
    expect([...new Set((await stop()).map((frame) => frame[side]))]).toEqual([20, 96]);
  });
}

test("The first toast stands at its place in its first frame, though the token changed just before", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "where-they-stand");
  const stop = await sampleTheDeck(page);
  await page.addStyleTag({ content: ":root { --u-toast-inset-top: 96px; --u-toast-inset-end: 96px; }" });
  await page.getByRole("button", { name: "Top end", exact: true }).click();
  await page.waitForTimeout(600);
  const frames = await stop();
  expect(frames.length).toBeGreaterThan(0);
  expect([...new Set(frames.map((frame) => frame.top))]).toEqual([96]);
  expect([...new Set(frames.map((frame) => frame.end))]).toEqual([96]);
});

test("Setting a token again to the value it has moves nothing", async ({ page }) => {
  await standingTopEnd(page);
  const stop = await sampleTheDeck(page);
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => document.documentElement.style.setProperty("--u-toast-inset-top", "20px"));
    await page.waitForTimeout(30);
  }
  expect([...new Set((await stop()).map((frame) => frame.top))]).toEqual([20]);
});

/* A modal that opens or closes in the moment the application changes the
   distance: the region is built anew inside or outside the dialog and starts
   where the old one was seen. Both happen in one task, so in one frame. */
async function modalWithTheTop(page: Page, open: boolean, top: number) {
  await page.evaluate(
    ({ open, top }) => {
      let dialog = document.getElementById("moving-modal") as HTMLDialogElement | null;
      if (!dialog) {
        dialog = document.createElement("dialog");
        dialog.id = "moving-modal";
        dialog.textContent = "A modal";
        document.body.append(dialog);
      }
      if (open) dialog.showModal();
      else dialog.close();
      document.documentElement.style.setProperty("--u-toast-inset-top", `${top}px`);
    },
    { open, top },
  );
}

for (const reducedMotion of ["no-preference", "reduce"] as const) {
  test(`A modal opening and closing as the top token changes ${reducedMotion === "reduce" ? "moves the deck at once with reduced motion" : "glides the deck between the two places"}`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await standingTopEnd(page);
    for (const [open, from, to] of [[true, 20, 96], [false, 96, 20]] as const) {
      const stop = await sampleTheDeck(page);
      await modalWithTheTop(page, open, to);
      await page.waitForTimeout(600);
      await expect(page.locator("#moving-modal [data-edge]:has([data-toast])")).toHaveCount(open ? 1 : 0);
      const values = [...new Set((await stop()).map((frame) => frame.top))];
      const move = open ? "opening" : "closing";
      if (reducedMotion === "reduce") expect(values, move).toEqual([from, to]);
      else {
        expect(values[0], move).toBe(from);
        expect(values.at(-1), move).toBe(to);
        expect(values.some((value) => value > Math.min(from, to) && value < Math.max(from, to)), `${move}, between: ${values.join(", ")}`).toBe(true);
      }
    }
  });
}

test("In a right-to-left page the start token is the distance from the right", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "where-they-stand");
  await page.addStyleTag({ content: ":root { --u-toast-inset-start: 88px; }" });
  await page.evaluate(() => document.documentElement.setAttribute("dir", "rtl"));
  await page.getByRole("button", { name: "Top start", exact: true }).click();
  const region = page.locator("[data-edge]").filter({ has: page.getByText("Standing top start.") });
  await expect(region).toBeVisible();
  const fromTheRight = await region.evaluate((element) => document.documentElement.clientWidth - element.getBoundingClientRect().right);
  expect(fromTheRight).toBeCloseTo(88, 0);
});

/* Held back, the toasts are no invisible wall: what lies under the cross is
   the page's and takes the click, and Tab passes the deck by. After the hold
   the cross is there again, where it stood. */
test("Held toasts leave the page under them to be hit, and come back where they stood", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "hold-the-toasts");
  const example = page.locator('[data-example="hold-the-toasts"]');
  const hold = async (on: boolean) => {
    await example.locator("label", { hasText: "Hold the toasts" }).click();
    await expect(example.getByRole("switch", { name: "Hold the toasts" })).toBeChecked({ checked: on });
  };
  await example.getByRole("button", { name: "Send a toast" }).click();
  const cross = page.getByRole("button", { name: "Close message" });
  await expect(cross).toBeVisible();
  await deckAtRest(page);
  const stood = (await cross.boundingBox())!;
  const point = { x: stood.x + stood.width / 2, y: stood.y + stood.height / 2 };
  const atThePoint = () =>
    page.evaluate(({ x, y }) => {
      const element = document.elementFromPoint(x, y);
      return element?.closest("[data-edge]") ? (element.closest("button")?.getAttribute("aria-label") ?? "toasts") : "page";
    }, point);
  /* Tab from just before the region, which stands last in the body. */
  const tabIntoTheToasts = async () => {
    await page.evaluate(() => {
      const before = document.createElement("button");
      before.id = "before-the-toasts";
      document.querySelector("[data-edge]")!.before(before);
      before.focus();
    });
    await page.keyboard.press("Tab");
    return page.evaluate(() => {
      document.getElementById("before-the-toasts")?.remove();
      const active = document.activeElement;
      return active?.closest("[data-edge]") ? (active.getAttribute("aria-label") ?? "toasts") : "page";
    });
  };

  await hold(true);
  expect(await atThePoint()).toBe("page");
  const clicked = page.evaluate(
    () =>
      new Promise<boolean>((resolve) =>
        document.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            resolve(!(event.target as Element).closest("[data-edge]"));
          },
          { capture: true, once: true },
        ),
      ),
  );
  await page.mouse.click(point.x, point.y);
  expect(await clicked).toBe(true);
  expect(await tabIntoTheToasts()).toBe("page");

  await hold(false);
  await expect(cross).toBeVisible();
  await expect.poll(async () => {
    const box = (await cross.boundingBox())!;
    return [box.x, box.y].map(Math.round);
  }).toEqual([stood.x, stood.y].map(Math.round));
  expect(await atThePoint()).toBe("Close message");
  expect(await tabIntoTheToasts()).toBe("Close message");
});

/* Nothing glides while nothing is seen: a distance changed during a hold is
   taken at once, and when the hold ends the deck appears at its new place -
   also when the hold ends in the frame the distance changes, and when a modal
   closes in that frame too. The example's toasts stand at the bottom, so the
   bottom token moves them. */
async function holdingOneToast(page: Page) {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "hold-the-toasts");
  const example = page.locator('[data-example="hold-the-toasts"]');
  await example.getByRole("button", { name: "Send a toast" }).click();
  await expect(page.getByRole("button", { name: "Close message" })).toBeVisible();
  await deckAtRest(page);
  await example.locator("label", { hasText: "Hold the toasts" }).click();
  await expect(example.getByRole("switch", { name: "Hold the toasts" })).toBeChecked();
}

/* In one task: the modal closes, the hold ends, the bottom token changes
   (or the token first, or in an animation frame callback queued after the
   hold ended, as an application writes a token in every frame). */
type TokenAt = "after" | "first" | "frame";
async function endTheHold(page: Page, { bottom, closeTheModal = false, token = "after" }: { bottom?: number; closeTheModal?: boolean; token?: TokenAt }) {
  await page.evaluate(
    ({ bottom, closeTheModal, token }) => {
      const setToken = () => bottom !== undefined && document.documentElement.style.setProperty("--u-toast-inset-bottom", `${bottom}px`);
      if (closeTheModal) (document.getElementById("moving-modal") as HTMLDialogElement).close();
      if (token === "first") setToken();
      const label = [...document.querySelectorAll('[data-example="hold-the-toasts"] label')].find((element) => element.textContent?.includes("Hold the toasts"));
      (label as HTMLElement).click();
      if (token === "after") setToken();
      if (token === "frame") requestAnimationFrame(setToken);
    },
    { bottom, closeTheModal, token },
  );
}

test("A change of the distance during a hold is taken at once: after the hold the deck is first seen at the new place", async ({ page }) => {
  await holdingOneToast(page);
  await page.evaluate(() => document.documentElement.style.setProperty("--u-toast-inset-bottom", "96px"));
  await page.waitForTimeout(300);
  const stop = await sampleTheDeck(page);
  await endTheHold(page, {});
  await page.waitForTimeout(600);
  const frames = await stop();
  expect(frames.length).toBeGreaterThan(0);
  expect([...new Set(frames.map((frame) => frame.bottom))]).toEqual([96]);
});

for (const token of ["after", "first", "frame"] as const) {
  const order = { after: "hold first", first: "token first", frame: "token in a later frame callback" }[token];
  test(`The hold ending in the frame the distance changes (${order}) shows the deck at the new place, nothing in between`, async ({ page }) => {
    await holdingOneToast(page);
    const stop = await sampleTheDeck(page);
    await endTheHold(page, { bottom: 96, token });
    await page.waitForTimeout(600);
    const frames = await stop();
    expect(frames.length).toBeGreaterThan(0);
    /* A token written in a later callback of the first frame comes after the
       sampler's reading in that frame, which still finds the old place. */
    expect([...new Set(frames.map((frame) => frame.bottom))]).toEqual(token === "frame" ? [20, 96] : [96]);
  });
}

test("A modal closing as the hold ends and the distance changes shows the deck at the new place, nothing in between", async ({ page }) => {
  await holdingOneToast(page);
  await page.evaluate(() => {
    const dialog = document.createElement("dialog");
    dialog.id = "moving-modal";
    dialog.textContent = "A modal";
    document.body.append(dialog);
    dialog.showModal();
  });
  await expect(page.locator("#moving-modal [data-edge]:has([data-toast])")).toHaveCount(1);
  const stop = await sampleTheDeck(page);
  await endTheHold(page, { bottom: 96, closeTheModal: true });
  await page.waitForTimeout(600);
  await expect(page.getByRole("switch", { name: "Hold the toasts" })).not.toBeChecked();
  await expect(page.locator("#moving-modal [data-edge]:has([data-toast])")).toHaveCount(0);
  const frames = await stop();
  expect(frames.length).toBeGreaterThan(0);
  expect([...new Set(frames.map((frame) => frame.bottom))]).toEqual([96]);
});

/* An open deck casts no shadow on its cards: the card lower on the screen
   lies above the one above it, wherever the deck stands, so each shadow falls
   under the next card. Read from the picture: the face of the middle card is
   as light just below its top edge as near its bottom. */
async function deckOfThree(page: Page, position: "Top end" | "Bottom end") {
  await page.setViewportSize({ width: 1280, height: 800 });
  await openExample(page, "toast", "where-they-stand");
  for (let i = 0; i < 3; i++) await page.getByRole("button", { name: position, exact: true }).click();
  const cards = page.locator("[data-toast]");
  await expect(cards).toHaveCount(3);
  await deckAtRest(page);
  return cards;
}

/** The mean grey of a line across the card's face, `y` px below its top (negative: above its bottom). */
async function faceGrey(page: Page, card: Locator, ys: number[]) {
  const box = (await card.boundingBox())!;
  const png = await page.screenshot({ clip: box, scale: "css", animations: "disabled" });
  return page.evaluate(
    async ({ data, ys }) => {
      const bytes = Uint8Array.from(atob(data), (c) => c.charCodeAt(0));
      const image = await createImageBitmap(new Blob([bytes], { type: "image/png" }));
      const ctx = new OffscreenCanvas(image.width, image.height).getContext("2d")!;
      ctx.drawImage(image, 0, 0);
      return ys.map((y) => {
        const row = ctx.getImageData(40, y < 0 ? image.height + y : y, image.width - 80, 1).data;
        let sum = 0;
        for (let i = 0; i < row.length; i += 4) sum += (row[i]! + row[i + 1]! + row[i + 2]!) / 3;
        return sum / (row.length / 4);
      });
    },
    { data: png.toString("base64"), ys },
  );
}

for (const colorScheme of ["light", "dark"] as const)
  for (const position of ["Top end", "Bottom end"] as const)
    test(`An open deck at ${position.toLowerCase()} casts no shadow on its middle card (${colorScheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      const cards = await deckOfThree(page, position);
      await cards.last().hover();
      await deckAtRest(page);
      const [top, bottom] = await faceGrey(page, cards.nth(1), [3, -4]);
      expect(Math.abs(top! - bottom!), `top ${top}, bottom ${bottom}`).toBeLessThan(1.5);
    });

/* While a top deck opens and closes the cards overlap: the front card must lie
   in front in every frame, or an older card would cover it for a moment. */
async function sampleTheFront(page: Page): Promise<() => Promise<boolean[]>> {
  await page.evaluate(() => {
    const state = { running: true, frames: [] as boolean[] };
    (window as unknown as { __front: typeof state }).__front = state;
    const frame = () => {
      const front = [...document.querySelectorAll("[data-toast]")].at(-1)!;
      const box = front.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.bottom - 6);
      state.frames.push((hit?.closest("[data-toast]") ?? hit?.querySelector(":scope > [data-toast]")) === front);
      if (state.running) requestAnimationFrame(frame);
    };
    frame();
  });
  return () =>
    page.evaluate(() => {
      const state = (window as unknown as { __front: { running: boolean; frames: boolean[] } }).__front;
      state.running = false;
      return state.frames;
    });
}

test("While a deck at the top opens, its front card lies in front in every frame", async ({ page }) => {
  const cards = await deckOfThree(page, "Top end");
  await page.mouse.move(0, 0);
  const stop = await sampleTheFront(page);
  await cards.last().hover();
  await page.waitForTimeout(700);
  const frames = await stop();
  expect(frames.length).toBeGreaterThan(10);
  expect(frames.indexOf(false), `${frames.length} frames`).toBe(-1);
});

test("While a deck at the top closes, its front card lies in front in every frame", async ({ page }) => {
  const cards = await deckOfThree(page, "Top end");
  await cards.last().hover();
  await deckAtRest(page);
  const stop = await sampleTheFront(page);
  await page.mouse.move(0, 0);
  await page.waitForTimeout(700);
  const frames = await stop();
  expect(frames.length).toBeGreaterThan(10);
  expect(frames.indexOf(false), `${frames.length} frames`).toBe(-1);
});

/* A card closed in an open deck drops behind the others at once: the cards
   closing up over its place lie above it in every frame in which they
   overlap. A leaving card takes no pointer, so for the reading only, every
   card is made hittable: the element at a point is then the one painted on
   top. */
test("In an open deck at the bottom, the cards closing up lie above the card that leaves", async ({ page }) => {
  const cards = await deckOfThree(page, "Bottom end");
  await cards.last().hover();
  await deckAtRest(page);
  await page.addStyleTag({ content: "[data-edge] * { pointer-events: auto !important; }" });
  const leaving = await cards.last().getAttribute("data-toast");
  await page.evaluate((leaving) => {
    const state = { running: true, frames: [] as boolean[] };
    (window as unknown as { __over: typeof state }).__over = state;
    const frame = () => {
      const card = document.querySelector(`[data-toast="${leaving}"]`);
      if (card) {
        const box = card.getBoundingClientRect();
        for (const other of document.querySelectorAll("[data-toast]")) {
          if (other === card) continue;
          const near = other.getBoundingClientRect();
          const top = Math.max(box.top, near.top);
          const bottom = Math.min(box.bottom, near.bottom);
          const left = Math.max(box.left, near.left);
          const right = Math.min(box.right, near.right);
          if (bottom - top < 4 || right - left < 4) continue;
          const hit = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
          state.frames.push(hit?.closest("[data-toast]") === other);
        }
      }
      if (state.running) requestAnimationFrame(frame);
    };
    frame();
  }, leaving);
  await cards.last().getByRole("button", { name: "Close message" }).click();
  await expect(page.locator(`[data-toast="${leaving}"]`)).toHaveCount(0);
  const frames = await page.evaluate(() => {
    const state = (window as unknown as { __over: { running: boolean; frames: boolean[] } }).__over;
    state.running = false;
    return state.frames;
  });
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.indexOf(false), `${frames.length} frames`).toBe(-1);
});

test("Tabs change the content", async ({ page }) => {
  await openExample(page, "tabs", "loading-and-empty-panels");
  const example = page.locator('[data-example="loading-and-empty-panels"]');
  await example.getByRole("tab", { name: "Leave" }).click();
  await expect(example.getByText("No leave planned")).toBeVisible();
  await example.getByRole("tab", { name: "Profile" }).click();
  await expect(example.getByText("No leave planned")).toBeHidden();
});

test("Menu opens and triggers an action", async ({ page }) => {
  await openExample(page, "menu", "actions");
  await page.getByRole("button", { name: "Actions", exact: true }).click();
  await page.getByRole("menuitem", { name: "Export as CSV" }).click();
  await expect(page.getByText("Last: Exported as CSV")).toBeVisible();
});

/* The context menu's one novelty is that it opens at a point, and jsdom has no
   layout to check that in (schedule-refinement 08). */
test("ContextMenu opens at the point of the right-click", async ({ page }) => {
  await openExample(page, "contextmenu", "at-the-pointer");
  const surface = page.locator('[data-example="at-the-pointer"] div', { hasText: "Right-click anywhere in here" }).last();
  const box = (await surface.boundingBox())!;
  const at = { x: Math.round(box.x + 40), y: Math.round(box.y + 30) };
  await page.mouse.click(at.x, at.y, { button: "right" });

  const menu = page.getByRole("menu", { name: "Actions for the surface" });
  await expect(menu).toBeVisible();
  const panel = (await menu.boundingBox())!;
  /* At the point, the way every popover of this library hangs from its
     anchor - a few pixels of the popover's own spacing aside. */
  expect(Math.abs(panel.x - at.x)).toBeLessThan(24);
  expect(Math.abs(panel.y - at.y)).toBeLessThan(24);
});

test("ContextMenu flips and stays inside the window at its edge", async ({ page }) => {
  await openExample(page, "contextmenu", "at-the-pointer");
  /* A window small enough that the surface reaches its corner: the panel
     cannot open down and to the right without leaving the window. */
  await page.setViewportSize({ width: 460, height: 340 });
  const surface = page.locator('[data-example="at-the-pointer"] div', { hasText: "Right-click anywhere in here" }).last();
  await surface.scrollIntoViewIfNeeded();
  const box = (await surface.boundingBox())!;
  const viewport = page.viewportSize()!;
  await page.mouse.click(Math.min(box.x + box.width - 4, viewport.width - 4), Math.min(box.y + box.height - 4, viewport.height - 4), {
    button: "right",
  });
  const menu = page.getByRole("menu", { name: "Actions for the surface" });
  await expect(menu).toBeVisible();
  // Where it comes to rest: the entrance slides it 6px, and a box measured
  // mid-slide lies outside by just that.
  await menu.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const panel = (await menu.boundingBox())!;
  expect(panel.x + panel.width).toBeLessThanOrEqual(viewport.width);
  expect(panel.y + panel.height).toBeLessThanOrEqual(viewport.height);
});

/* ---------------- The foundations (core-foundations) ----------------

   What jsdom cannot show of them: the platform's keys on the native controls,
   the dialog's focus trap and focus return, the drawer's motion under reduced
   motion, and a breadcrumb folding at a real width. */

test("Switch toggles on Space and on its label", async ({ page }) => {
  await openExample(page, "switch", "on-and-off");
  /* The example's switch, not the configurator's of the same name above it. */
  const control = page.locator('[data-example="on-and-off"]').getByRole("switch", { name: "Page me at night", exact: true });
  await expect(control).toBeChecked();
  await control.focus();
  await page.keyboard.press("Space");
  await expect(control).not.toBeChecked();
  await page.locator('[data-example="on-and-off"]').getByText("Page me at night").click();
  await expect(control).toBeChecked();
});

/* The hidden input hangs from its own row. It hung from the nearest
   positioned ancestor - in the multi-select's panel the panel, past the list
   that scrolls - and the focus a click gave it scrolled the whole panel down
   to where the row would stand unscrolled: a long list went white. */
test("Checkbox, switch and radio hold their input in their row", async ({ page }) => {
  const ownRow = (input: Element) => (input as HTMLElement).offsetParent === input.closest("label");

  await openExample(page, "multiselect", "chips-in-the-field");
  await page.locator('[data-example="chips-in-the-field"] [aria-haspopup="dialog"]').first().click();
  const boxes = page.getByRole("dialog").getByRole("checkbox");
  await expect(boxes.first()).toBeVisible();
  for (const box of await boxes.all()) expect(await box.evaluate(ownRow)).toBe(true);

  await openExample(page, "switch", "on-and-off");
  expect(await page.locator('[data-example="on-and-off"]').getByRole("switch", { name: "Page me at night", exact: true }).evaluate(ownRow)).toBe(true);

  await openExample(page, "radiogroup", "states");
  expect(await page.locator('[data-example="states"]').getByRole("radio").first().evaluate(ownRow)).toBe(true);
});

test("Slider follows the keys of the slider pattern", async ({ page }) => {
  await openExample(page, "slider", "canary-traffic");
  /* The example's slider, not the configurator's of the same name above it. */
  const slider = page.locator('[data-example="canary-traffic"]').getByRole("slider", { name: "Canary traffic, %" });
  /* The ring stands on the thumb, a pseudo-element neither the own-base probe
     nor getComputedStyle reads - so it is looked at: the focused slider has
     to look different from the resting one. */
  const resting = await slider.screenshot({ animations: "disabled" });
  await page.keyboard.press("Tab"); // a keyboard focus, so :focus-visible holds
  await slider.focus();
  const focused = await slider.screenshot({ animations: "disabled" });
  expect(focused.equals(resting)).toBe(false);
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("15");
  await page.keyboard.press("PageUp");
  await expect(slider).toHaveValue("25");
  await page.keyboard.press("End");
  await expect(slider).toHaveValue("100");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
  await expect(slider).toHaveAttribute("aria-valuetext", "0");
});

test("Drawer holds the focus, closes on Escape and gives the focus back", async ({ page }) => {
  await openExample(page, "drawer", "a-detail-from-the-edge");
  const opener = page.getByRole("button", { name: "Show the shipment" });
  await opener.click();
  const drawer = page.getByRole("dialog", { name: "Shipment SH-1042" });
  await expect(drawer).toBeVisible();
  // It stands at the right edge of the window, once it has come in. The toast
  // region stands in the open dialog too, and is not the sheet.
  const sheet = drawer.locator("> div:not([data-edge])");
  await sheet.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const box = (await sheet.boundingBox())!;
  expect(Math.round(box.x + box.width)).toBe(page.viewportSize()!.width);
  /* Across more Tabs than the drawer has stops, the focus never lands on the
     page behind it. Chrome lets it pass through its own chrome between the
     last stop and the first - the page then reports the body - and that is
     the platform's trap, not a leak. */
  for (let i = 0; i < 4; i++) {
    await page.keyboard.press("Tab");
    const where = await drawer.evaluate((el) =>
      el.contains(document.activeElement) ? "inside" : document.activeElement === document.body ? "chrome" : "page",
    );
    expect(where).not.toBe("page");
  }
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(opener).toBeFocused();
});

/* The browser gives a modal dialog `overflow: auto`; the focus landing in
   the sheet while it still stood off-screen scrolled the dialog towards it,
   and the sheet shot in too far and jumped back at the end (reported by the
   user). The entrance is a path: the sheet's left edge only ever moves left,
   and the dialog never scrolls. */
test("Drawer enters along its path, without the dialog scrolling", async ({ page }) => {
  await openExample(page, "drawer", "a-detail-from-the-edge");
  await page.getByRole("button", { name: "Show the shipment" }).click();
  const samples: { x: number; scroll: number }[] = [];
  for (let i = 0; i < 12; i++) {
    samples.push(
      await page.evaluate(() => {
        const dialog = document.querySelector("dialog[open]") as HTMLDialogElement;
        const sheet = dialog.querySelector(":scope > div") as HTMLElement;
        return { x: sheet.getBoundingClientRect().x, scroll: dialog.scrollLeft };
      }),
    );
    await page.waitForTimeout(25);
  }
  expect(samples.every((s) => s.scroll === 0)).toBe(true);
  for (let i = 1; i < samples.length; i++) {
    expect(samples[i]!.x).toBeLessThanOrEqual(samples[i - 1]!.x + 0.5);
  }
  expect(samples[0]!.x).toBeGreaterThan(samples.at(-1)!.x);
});

test("Drawer appears and goes at once under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openExample(page, "drawer", "a-detail-from-the-edge");
  await page.getByRole("button", { name: "Show the shipment" }).click();
  const drawer = page.getByRole("dialog", { name: "Shipment SH-1042" });
  await expect(drawer).toBeVisible();
  expect(await drawer.locator("> div:not([data-edge])").evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
});

test("Accordion walks its headers by the arrows and opens on Enter", async ({ page }) => {
  await openExample(page, "accordion", "one-section-at-a-time");
  const example = page.locator('[data-example="one-section-at-a-time"]');
  const goal = example.getByRole("button", { name: "Sprint goal" });
  await goal.focus();
  await page.keyboard.press("ArrowDown");
  const finished = example.getByRole("button", { name: "Finished work" });
  await expect(finished).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(finished).toHaveAttribute("aria-expanded", "true");
  await expect(goal).toHaveAttribute("aria-expanded", "false");
  await expect(example.getByRole("region", { name: "Finished work" })).toBeVisible();
});

test("Breadcrumb folds at a narrow width and is walked through its menu", async ({ page }) => {
  await openExample(page, "breadcrumb", "fold-when-narrow");
  const example = page.locator('[data-example="fold-when-narrow"]');
  const narrow = example.getByRole("navigation").first();
  const wide = example.getByRole("navigation").nth(1);
  // Both keep the ends; the narrow one folds more than the wide one.
  for (const nav of [narrow, wide]) {
    await expect(nav.getByRole("link", { name: "Quillmere" })).toBeVisible();
    await expect(nav.locator('[aria-current="page"]')).toHaveText("Timeline");
  }
  const shown = (nav: typeof narrow) => nav.locator("ol:not([aria-hidden]) > li").count();
  expect(await shown(narrow)).toBeLessThan(await shown(wide));
  // Nothing of the narrow trail runs past its place.
  expect(await narrow.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);

  const more = narrow.getByRole("button", { name: "Show the levels in between" });
  await more.focus();
  await page.keyboard.press("Enter");
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  const first = menu.getByRole("menuitem").first();
  await expect(first).toHaveText("Services");
  await expect(first).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(menu.getByRole("menuitem").nth(1)).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(more).toBeFocused();
});

/* ---------------- The layout tier (core-layout-extras) ----------------

   What jsdom cannot show of it: a pane's real size under the keys and the
   pointer, and the platform's file dialog behind the file input's key. */

test("Splitter follows its keys and the pointer, and the panes follow it", async ({ page }) => {
  await openExample(page, "splitter", "two-panes");
  const line = page.locator('[data-example="two-panes"]').getByRole("separator", { name: "Resize the panes" });
  const first = line.locator("xpath=preceding-sibling::div[1]");
  const box = (await line.locator("xpath=..").boundingBox())!;
  const share = async () => ((await first.boundingBox())!.width / box.width) * 100;

  await page.keyboard.press("Tab"); // a keyboard focus, so :focus-visible holds
  await line.focus();
  await expect(line).toHaveAttribute("aria-valuenow", "35");
  await page.keyboard.press("ArrowRight");
  await expect(line).toHaveAttribute("aria-valuenow", "40");
  // The pane's share of the whole box: the separator's strip is taken off
  // before the rest is shared, so it lies a little under the value.
  expect(Math.abs((await share()) - 40)).toBeLessThan(1.5);
  await page.keyboard.press("Enter");
  await expect(line).toHaveAttribute("aria-valuenow", "0");
  expect((await first.boundingBox())!.width).toBe(0);
  await page.keyboard.press("Enter");
  await expect(line).toHaveAttribute("aria-valuenow", "40");

  const handle = (await line.boundingBox())!;
  await page.mouse.move(handle.x + handle.width / 2, handle.y + handle.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.7, handle.y + 20, { steps: 4 });
  await page.mouse.up();
  await expect(line).toHaveAttribute("aria-valuenow", "70");
  expect(Math.abs((await share()) - 70)).toBeLessThan(1.5);
});

test("FileInput opens the platform's dialog on its keys and takes a drop", async ({ page }) => {
  await openExample(page, "fileinput", "one-file");
  const example = page.locator('[data-example="one-file"]');
  const input = example.getByLabel("Bank statement");

  for (const key of ["Space", "Enter"]) {
    await input.focus();
    const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.keyboard.press(key)]);
    expect(chooser.isMultiple()).toBe(false);
    await chooser.setFiles({ name: `statement-${key}.csv`, mimeType: "text/csv", buffer: Buffer.from("date;amount\n2026-03-16;-4860.00\n") });
    await expect(example.getByRole("listitem")).toHaveText(new RegExp(`statement-${key}\\.csv`));
  }

  /* A drop is built in the page, as the platform hands it over: a data
     transfer with the files, on the zone. The PDF is refused by `accept`,
     and the input holds what the list shows. */
  const zone = example.locator(".exampleStage input[type=file]").locator("xpath=../..");
  await zone.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.items.add(new File(["date;amount\n"], "dropped.csv", { type: "text/csv" }));
    transfer.items.add(new File(["%PDF"], "manual.pdf", { type: "application/pdf" }));
    for (const type of ["dragenter", "dragover", "drop"]) {
      element.dispatchEvent(new DragEvent(type, { dataTransfer: transfer, bubbles: true, cancelable: true }));
    }
  });
  await expect(example.getByRole("listitem")).toHaveText(/dropped\.csv/);
  await expect(example.getByText("manual.pdf is not an accepted type")).toBeVisible();
  expect(await input.evaluate((el: HTMLInputElement) => [...(el.files ?? [])].map((f) => f.name))).toEqual(["dropped.csv"]);

  await example.getByRole("button", { name: "Remove dropped.csv" }).click();
  await expect(example.getByRole("listitem")).toHaveCount(0);
  expect(await input.evaluate((el: HTMLInputElement) => el.files?.length)).toBe(0);
});

/* A horizontal stepper measures its room (fit.ts): on a phone five steps take
   a column, at the desktop's width the same list stands in a row - and in
   neither does one label run into another's box. */
test("Stepper takes a column on a phone and a row on the desktop, and no label overruns", async ({ page }) => {
  const labelsApart = () =>
    page.evaluate(() => {
      const list = document.querySelector('[data-example="where-a-procedure-stands"] ol')!;
      const boxes = [...list.querySelectorAll(":scope > li")].map((step) => step.getBoundingClientRect());
      const texts = [...list.querySelectorAll(":scope > li > span:last-child")].map((text) => text.getBoundingClientRect());
      return texts.every((text, i) => text.right <= boxes[i]!.right + 0.5 && text.width > 0);
    });
  const list = page.locator('[data-example="where-a-procedure-stands"] ol');

  await openExample(page, "stepper", "where-a-procedure-stands");
  await expect(list).toHaveAttribute("data-fit", "row");
  expect(await labelsApart()).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(list).toHaveAttribute("data-fit", "column");
  expect(await labelsApart()).toBe(true);
});

/* A tooltip stands on ink: `Text` inside it took the ink as its own colour
   and stood black on black. Measured, not looked at - every tone must read
   on the tooltip's ground at 4.5:1, in both themes. */
for (const colorScheme of ["light", "dark"] as const) test(`Text inside a tooltip reads on its ground in every tone (${colorScheme})`, async ({ page }) => {
  await page.emulateMedia({ colorScheme });
  await openExample(page, "tooltip", "a-calculation");
  await page.getByText("37.50 €", { exact: true }).hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const ratios = await tooltip.evaluate((tip) => {
    /* The canvas turns any colour syntax (color-mix, light-dark) into sRGB
       bytes, and lays a translucent colour over the ground as the eye sees it. */
    const ctx = document.createElement("canvas").getContext("2d")!;
    const background = getComputedStyle(tip).backgroundColor;
    const luminance = (...layers: string[]) => {
      for (const layer of layers) {
        ctx.fillStyle = layer;
        ctx.fillRect(0, 0, 1, 1);
      }
      const [r = 0, g = 0, b = 0] = [...ctx.getImageData(0, 0, 1, 1).data].map((v) => {
        const c = v / 255;
        return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const ground = luminance(background);
    return [...tip.querySelectorAll("p")].map((p) => {
      const ink = luminance(background, getComputedStyle(p).color);
      return (Math.max(ink, ground) + 0.05) / (Math.min(ink, ground) + 0.05);
    });
  });
  expect(ratios).toHaveLength(2);
  for (const ratio of ratios) expect(ratio).toBeGreaterThanOrEqual(4.5);
});

/* ADR-0043: under a mouse and the keys the select opens the Combobox's list,
   not the system's; the <select> keeps the value, and the field its width. */
test("Select opens its own list under the mouse and the keys, and holds its width", async ({ page }) => {
  await openExample(page, "select", "select");
  const field = page.getByRole("combobox", { name: "Cost centre" });
  const width = (await field.boundingBox())!.width;

  await field.click();
  const list = page.getByRole("listbox", { name: "Cost centre" });
  await expect(list).toBeVisible();
  await expect(field).toHaveAttribute("aria-expanded", "true");
  // The system's own list stays shut.
  expect(await field.evaluate((element) => element.matches(":open"))).toBe(false);
  await list.getByRole("option", { name: "CC-2200 Design" }).click();
  await expect(list).toBeHidden();
  await expect(field).toHaveValue("CC-2200");
  await expect(field).toBeFocused();
  expect((await field.boundingBox())!.width).toBe(width);

  await page.keyboard.press("ArrowDown");
  await expect(list).toBeVisible();
  await expect(list.getByRole("option", { name: "CC-2200 Design" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Enter");
  await expect(field).toHaveValue("CC-2100");
  await page.keyboard.press("Space");
  await page.keyboard.press("Escape");
  await expect(list).toBeHidden();
  await expect(field).toBeFocused();
});

/* A panel refreshing in place: the button carries the spinner, and the card
   does not move - the spinner once took the button's place and the card shrank
   by the difference. */
test("Spinner in a card's head leaves the card's height alone", async ({ page }) => {
  await openExample(page, "spinner", "a-panel-refreshing");
  const card = page.getByRole("region", { name: "Refresh a panel in place" }).locator("section");
  const height = (await card.boundingBox())!.height;
  await card.getByRole("button", { name: "Refresh" }).click();
  await expect(card.getByRole("button", { name: "Refresh" })).toHaveAttribute("aria-busy", "true");
  expect((await card.boundingBox())!.height).toBe(height);
});

/* The palette's close cross is in the markup for every device; CSS shows it
   under a finger only. */
test.describe("the palette's close", () => {
  const open = async (page: Page) => {
    await openExample(page, "commandpalette", "commands");
    await page.getByRole("button", { name: "Open the palette" }).click();
    return page.getByRole("dialog").getByRole("button", { name: "Close" });
  };

  test("is hidden under a fine pointer", async ({ page }) => {
    await expect(await open(page)).toBeHidden();
  });

  test.describe("under a finger", () => {
    test.use({ hasTouch: true });

    test("is visible and closes the palette", async ({ page }) => {
      const close = await open(page);
      await expect(close).toBeVisible();
      await close.click();
      await expect(page.getByRole("dialog")).toBeHidden();
    });
  });
});
