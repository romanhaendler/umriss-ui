/* What a picture cannot say about the calculation: that the line a reader
   clicks stays where it is, and that its derivation opens beneath it. */

import { test, expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";
import { openExample } from "./navigation";

test.skip(({ colorScheme }) => colorScheme === "dark", "behaviour tests once only (light)");

test("a derivation opens beneath the line that was clicked, and the line does not move", async ({ page }) => {
  await openExample(page, "calculation", "invoice");
  const target = page.locator('[data-example="invoice"]');
  const button = target.getByRole("button", { name: "Show how Discount is derived" });
  const before = await button.boundingBox();
  await button.click();
  /* Its name says what a click does next, so it is found anew. */
  const opened = target.getByRole("button", { name: "Hide how Discount is derived" });
  const after = await opened.boundingBox();
  expect(after!.y).toBe(before!.y);
  const list = target.locator(`[id="${await opened.getAttribute("aria-controls")}"]`);
  await expect(list).toBeVisible();
  expect((await list.boundingBox())!.y).toBeGreaterThan(after!.y);
  await expect(list).toContainText("= Discount");
});

test("a chain in view stands open: every line and interim, nothing to fold but the trees in its lines", async ({ page }) => {
  await openExample(page, "chain", "payslip");
  const target = page.locator('[data-example="payslip"]');
  for (const line of ["Gross salary", "Income tax", "Church tax", "Net salary", "Travel allowance", "Amount paid out"]) {
    /* The first place it stands is its line in the chain; later ones are
       references inside folded trees. */
    await expect(target.getByText(line, { exact: true }).first()).toBeVisible();
  }
  await expect(target.getByRole("list", { name: "Payslip, March" }).getByRole("button")).toHaveCount(1);
  const pension = target.getByText("Pension insurance", { exact: true });
  await expect(pension).toBeHidden();
  await target.getByRole("button", { name: "Show how Social security contributions is derived" }).click();
  await expect(pension).toBeVisible();
  await expect(target.getByText("= Social security contributions")).toBeVisible();
});

/* Metrics (ADR-0038): the figures move beneath the label only where they
   leave it too little room - measured, not a breakpoint - and never push the
   frame wider than its place. The frame is set to the widths the spec names;
   the component measures its own width, not the window's. */
const frameOf = (page: Page, exampleId: string) => page.locator(`[data-example="${exampleId}"] [class*=frame]`);
const setWidth = (frame: Locator, width: number) => frame.evaluate((el, w) => void ((el as HTMLElement).style.width = `${w}px`), width);
/** Errors thrown on the page - a flag that flips on every measure ends in
    React's update-depth error and an example gone. */
const errorsOf = (page: Page) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  return errors;
};

test("two metrics stay on one line down to 300 px; three go to two lines at 360 px", async ({ page }) => {
  const errors = errorsOf(page);
  await openExample(page, "metrics", "two-teams");
  const two = frameOf(page, "two-teams");
  await setWidth(two, 300);
  await expect(two).not.toHaveAttribute("data-two-lines");
  const three = frameOf(page, "whole-company");
  await setWidth(three, 900);
  await expect(three).not.toHaveAttribute("data-two-lines");
  await setWidth(three, 360);
  await expect(three).toHaveAttribute("data-two-lines", "");
  /* Beneath the label, not beside it. */
  const label = await three.getByText("Commercial", { exact: true }).boundingBox();
  const figure = await three.getByText("276.1", { exact: true }).first().boundingBox();
  expect(figure!.y).toBeGreaterThan(label!.y + label!.height / 2);
  /* And back, once there is room again. */
  await setWidth(three, 900);
  await expect(three).not.toHaveAttribute("data-two-lines");
  expect(errors).toEqual([]);
});

test("metrics never push the frame wider than its place, at any width on the way down", async ({ page }) => {
  const errors = errorsOf(page);
  await openExample(page, "metrics", "two-teams");
  /* Every 10 px, so that no width where the flag could flip is skipped. */
  for (let width = 900; width >= 300; width -= 10) {
    for (const id of ["two-teams", "not-recorded", "business-line", "staff-movement", "staff-cost", "whole-company"]) {
      const frame = frameOf(page, id);
      await setWidth(frame, width);
      const [scroll, client] = await frame.evaluate((el) => [el.scrollWidth, el.clientWidth]);
      expect(scroll, `${id} at ${width} px`).toBe(client);
    }
  }
  expect(errors).toEqual([]);
});
