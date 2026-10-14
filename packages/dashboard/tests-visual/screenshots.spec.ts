/* Screenshot comparisons of the demo of @umriss-ui/dashboard, light and dark
   (through the projects in playwright.config.ts): one picture per example with
   the code collapsed, one per page from the head down. Both derived, not
   enumerated (`pages.ts`). */

import { test, expect } from "@playwright/test";
import { EXAMPLE_ADDRESSES, PAGES } from "./pages";
import { open, openExample } from "./navigation";

/* Not the API index: its content is text, which the guards hold (ADR-0044). */
for (const pageId of PAGES.filter((one) => one !== "api")) {
  test(`Page head ${pageId}`, { tag: "@quick" }, async ({ page }, testInfo) => {
    await open(page, pageId);
    const target = page.locator(`[data-block="${pageId}"] .pageHead`);
    await target.scrollIntoViewIfNeeded();
    await expect(target).toHaveScreenshot(`page-${pageId}-${testInfo.project.name}.png`);
  });
}

for (const { pageId, exampleId, name } of EXAMPLE_ADDRESSES) {
  test(`Example ${name}`, async ({ page }, testInfo) => {
    await openExample(page, pageId, exampleId);
    const target = page.locator(`[data-example="${exampleId}"]`);
    await target.scrollIntoViewIfNeeded();
    await expect(target.locator(".codeBlock")).toBeHidden();
    await expect(target).toHaveScreenshot(`example-${name}-${testInfo.project.name}.png`);
  });
}
