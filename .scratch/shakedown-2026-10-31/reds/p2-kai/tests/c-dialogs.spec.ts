import { test, expect } from "@playwright/test";
import { row, watch } from "./h";

const openEdit = async (page: any, id = "1007") => {
  await page.getByLabel("Actions: " + id).click();
  await page.getByRole("menuitem", { name: "Edit" }).click();
};
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; return (a?.tagName ?? "") + "|" + (a?.getAttribute?.("aria-label") ?? a?.textContent?.slice(0, 20) ?? ""); });

test("edit modal keeps typing and focus over refreshes", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await openEdit(page);
  console.log("focus on open:", await act(page));
  const input = page.getByLabel("Customer");
  await input.fill("Typed by Kai");
  await page.waitForTimeout(1700);
  console.log("value:", await input.inputValue(), "focus:", await act(page), "open:", await page.getByRole("dialog").count());
  expect.soft(await input.inputValue()).toBe("Typed by Kai");
  expect.soft(await act(page)).toContain("Customer");
  console.log(errs.join("\n"));
});

test("Escape and backdrop in nested confirm close only the confirm", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=0&mode=client");
  await page.waitForTimeout(500);
  await openEdit(page);
  await page.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByRole("dialog", { name: /Delete order/ })).toBeVisible();
  console.log("focus in confirm:", await act(page));
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  const dlgs = await page.getByRole("dialog").count();
  console.log("after Esc dialogs:", dlgs, "focus:", await act(page));
  expect.soft(await page.getByRole("dialog", { name: /Edit order/ }).count(), "edit modal survives Esc in confirm").toBe(1);
  // again with backdrop
  await page.getByRole("button", { name: "Delete" }).click();
  await page.waitForTimeout(300);
  await page.mouse.click(5, 5);
  await page.waitForTimeout(400);
  console.log("after backdrop dialogs:", await page.getByRole("dialog").count(), "edit open:", await page.getByRole("dialog", { name: /Edit order/ }).count(), "focus:", await act(page));
  expect.soft(await page.getByRole("dialog", { name: /Edit order/ }).count(), "edit modal survives backdrop click in confirm").toBe(1);
  console.log(errs.join("\n"));
});

test("confirm delete closes both, toast undo restores, focus ends somewhere sane", async ({ page }) => {
  const errs = watch(page);
  await page.goto("/?refresh=500&mode=client");
  await page.waitForTimeout(800);
  await openEdit(page);
  await page.getByRole("button", { name: "Delete" }).click();
  await page.getByRole("button", { name: "Delete" }).last().click();
  await page.waitForTimeout(700);
  console.log("dialogs:", await page.getByRole("dialog").count(), "row gone:", await row(page, "1007").count() === 0, "focus:", await act(page));
  const toast = page.getByText("Order 1007 deleted");
  await expect(toast).toBeVisible();
  await page.screenshot({ path: "shots/toast.png" });
  await page.getByRole("button", { name: "Undo" }).click();
  await page.waitForTimeout(1200);
  console.log("row back:", await row(page, "1007").count(), "focus:", await act(page));
  expect.soft(await row(page, "1007").count()).toBe(1);
  console.log(errs.join("\n"));
});
