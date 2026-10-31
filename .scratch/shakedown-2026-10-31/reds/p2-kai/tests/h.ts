import { Page } from "@playwright/test";
export const row = (p: Page, id: string) => p.locator(`tr[data-grid-line="row:${id}"]`);
export const watch = (p: Page) => {
  const errs: string[] = [];
  p.on("console", (m) => { if (["error", "warning"].includes(m.type())) errs.push(m.type() + ": " + m.text()); });
  p.on("pageerror", (e) => errs.push("pageerror: " + e.message));
  return errs;
};
export const count = (p: Page) => p.locator("#count").innerText();
