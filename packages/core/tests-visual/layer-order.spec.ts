/* The layer order the README gives for Tailwind v4 and for a wrapper library
   (Styles). Tailwind is not loaded: two layered rules stand in for it - `base`
   for preflight, `utilities` for a utility - and one rule in a layer of its own
   stands in for a wrapper's token override. Each stand-in is read once before
   core's stylesheet (written at the document's start) and once after it (an
   added style tag). The control: a wrapper layer read before core without the
   declaration does not win, so the checks are not green by accident. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

/* The declarations as core's README gives them. */
const TAILWIND = "@layer theme, base, umriss.tokens, umriss.base, umriss.components, components, utilities;";
const WRAPPER = "@layer umriss.tokens, umriss.base, umriss.components, acme;";

const PREFLIGHT = "@layer base { button { padding: 0; background: none; } }";
const UTILITY = "@layer utilities { .probe { background-color: rgb(10, 200, 30); } }";
const ACME = "@layer acme { :root { --u-color-accent: rgb(200, 10, 20); } }";

type Order = "before" | "after";

/* Writes the sheets, in this order, at the head of the document before the
   page's own stylesheets are read. */
async function atStart(page: Page, sheets: string[]) {
  await page.addInitScript((css: string[]) => {
    const write = () => {
      for (const text of css.reverse()) {
        const style = document.createElement("style");
        style.textContent = text;
        document.head.prepend(style);
      }
    };
    if (document.head) write();
    else {
      const watch = new MutationObserver(() => {
        if (!document.head) return;
        watch.disconnect();
        write();
      });
      watch.observe(document, { childList: true, subtree: true });
    }
  }, sheets);
}

async function place(page: Page, order: Order, css: string, open: () => Promise<unknown>, declaration = "") {
  if (declaration) await atStart(page, [declaration, ...(order === "before" ? [css] : [])]);
  else if (order === "before") await atStart(page, [css]);
  await open();
  if (order === "after") await page.addStyleTag({ content: css });
}

/* Computed values move through the buttons' and boxes' transitions, so they are
   polled to their end. */
const background = (button: Locator) => () => button.evaluate((element) => getComputedStyle(element).backgroundColor);

/* A checked box is drawn in the accent colour. */
const checkedBox = (page: Page) => page.getByRole("checkbox", { name: "Fragile" }).locator("+ *");

for (const order of ["before", "after"] as const) {
  test(`Tailwind's declaration keeps umriss over preflight and under utilities (${order} core's stylesheet)`, { tag: "@quick" }, async ({ page }) => {
    await place(page, order, PREFLIGHT + UTILITY, () => openExample(page, "button", "variants"), TAILWIND);
    const approve = page.getByRole("button", { name: "Approve invoice" });
    expect(await approve.evaluate((button) => getComputedStyle(button).paddingLeft)).not.toBe("0px");
    await expect.poll(background(approve)).not.toBe("rgba(0, 0, 0, 0)");
    const note = page.getByRole("button", { name: "Add a note" });
    await note.evaluate((button) => button.classList.add("probe"));
    await expect.poll(background(note)).toBe("rgb(10, 200, 30)");
  });

  test(`A wrapper's declaration lets its layer set the accent (${order} core's stylesheet)`, { tag: "@quick" }, async ({ page }) => {
    await place(page, order, `${WRAPPER} ${ACME}`, () => openExample(page, "checkbox", "states"));
    await expect.poll(background(checkedBox(page))).toBe("rgb(200, 10, 20)");
  });
}

test("Without the declaration a wrapper's layer read before core's stylesheet loses", { tag: "@quick" }, async ({ page }) => {
  await place(page, "before", ACME, () => openExample(page, "checkbox", "states"));
  const box = checkedBox(page);
  await expect(box).toBeVisible();
  await page.waitForTimeout(500);
  expect(await background(box)()).not.toBe("rgb(200, 10, 20)");
});
