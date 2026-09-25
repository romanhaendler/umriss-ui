/* Interaction tests of the table – the counterparts of the suite that stood in
   the visual tests of @umriss-ui/core until `umriss-table` 14, guarantee for
   guarantee (table-demo, Testing Decisions). The guarantee is the same; the
   selectors follow the new markup, and each one runs against the example that
   shows it.

   Selectors aim at roles and visible texts, not at classes, and always at one
   example: a page shows many tables. Only in the light project – behaviour is
   independent of the theme. Excepted is whatever measures position
   (`@both-themes`): type and borders hang on the theme, and a toolbar that
   grows a line taller in one theme shifts the table only there. */

import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { openExample, openScenario } from "./navigation";

test.beforeEach(({ colorScheme }, testInfo) => {
  testInfo.skip(colorScheme === "dark" && !testInfo.tags.includes("@both-themes"), "Behaviour tests only once (light)");
});

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
});

const example = (page: Page, id: string) => page.locator(`[data-example="${id}"]`);

/* ---------------- The position guard: Scenarios › work through the open orders (table-filters D1) ---------------- */

test("The head of the table stays put while one searches, filters and resets", { tag: "@both-themes" }, async ({ page }) => {
  /* The conditions used to stand as a row of their own between the table
     toolbar and the header and appeared with the first keystroke – the table
     slid downwards, and upwards again when it was cleared. The measurement is
     taken after every step, as soon as the rows show it. */
  await openScenario(page, "work-through-orders");
  const table = page.locator('[data-scenario="work-through-orders"]');
  const rows = table.locator("tbody tr");
  /* Measured against the scenario, not the window: the scenario stands last on
     its page, and a page that grows shorter moves the scroll position. */
  const top = async () => (await table.locator("thead").boundingBox())!.y - (await table.boundingBox())!.y;
  const start = await top();

  await table.getByPlaceholder("Order or customer").pressSequentially("North");
  await expect(rows).toHaveCount(2);
  expect(await top()).toBe(start);

  await table.getByRole("button", { name: "Filter Status" }).click();
  await page.getByRole("dialog").getByText("In progress", { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(rows).toHaveCount(1);
  expect(await top()).toBe(start);

  await table.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(rows).toHaveCount(5);
  expect(await top()).toBe(start);
});

/* ---------------- Table toolbar and sorting: Scenarios › work through the open orders ---------------- */

test.describe("Scenarios › work through the open orders", () => {
  test.beforeEach(async ({ page }) => {
    await openScenario(page, "work-through-orders");
  });

  const table = (page: Page) => page.locator('[data-scenario="work-through-orders"]');
  const searchField = (page: Page) => table(page).getByPlaceholder("Order or customer");
  const conditions = (page: Page) => table(page).getByRole("list", { name: "Active filters" });
  const dataRows = (page: Page) => table(page).locator("tbody tr");

  async function choose(page: Page, column: string, value: string) {
    await table(page).getByRole("button", { name: `Filter ${column}` }).click();
    /* The label, not the input: that one lies invisible beneath the drawn spans
       (docs/testing.md, "Known open"). */
    await page.getByRole("dialog").getByText(value, { exact: true }).click();
    await page.keyboard.press("Escape");
  }

  test("A condition stands in the table toolbar, the search does not", async ({ page }) => {
    await searchField(page).fill("Northworks");
    await expect(conditions(page)).toBeHidden();
    await choose(page, "Status", "Blocked");
    await expect(conditions(page)).toContainText("Status");
    await expect(conditions(page)).toContainText("Blocked");
  });

  test("The table toolbar names the ratio of finds to the total set", async ({ page }) => {
    await searchField(page).fill("Northworks");
    await expect(table(page).getByRole("status").filter({ hasText: " of " })).toHaveText("2 of 12");
  });

  test("Removing one condition leaves the others standing", async ({ page }) => {
    await choose(page, "Line", "Line 1");
    await choose(page, "Status", "Open");
    await expect(conditions(page).getByRole("listitem")).toHaveCount(2);
    await conditions(page).getByRole("button", { name: "Remove Line: Line 1" }).click();
    await expect(conditions(page).getByRole("listitem")).toHaveCount(1);
    await expect(conditions(page)).toContainText("Status");
  });

  test("A click on a condition opens the panel of its filter", async ({ page }) => {
    await choose(page, "Status", "Open");
    await conditions(page).getByRole("button", { name: "Edit Status: Open" }).click();
    await expect(page.getByRole("dialog", { name: "Filter Status" })).toBeVisible();
  });

  test("Reset clears search and conditions", async ({ page }) => {
    await searchField(page).fill("e");
    await choose(page, "Status", "Open");
    await table(page).getByRole("button", { name: "Reset", exact: true }).click();
    await expect(conditions(page)).toBeHidden();
    await expect(searchField(page)).toHaveValue("");
  });

  test("A modifier key appends a second sort level, with rank numbers", async ({ page }) => {
    const customerHeader = table(page).getByRole("columnheader", { name: "Customer" });
    const amountHeader = table(page).getByRole("columnheader", { name: "Quantity" });

    await customerHeader.getByRole("button", { name: "Customer", exact: true }).click();
    await expect(customerHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(amountHeader).toHaveAttribute("aria-sort", "none");

    await amountHeader.getByRole("button", { name: "Quantity", exact: true }).click({ modifiers: ["Shift"] });

    await expect(customerHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(amountHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(customerHeader.getByText("1", { exact: true })).toBeVisible();
    await expect(amountHeader.getByText("2", { exact: true })).toBeVisible();
  });

  /* The counterparts of the table tests from
     `packages/core/tests-visual/features-basics.spec.ts`, which ran there
     against the old demonstration, now a scenario (umriss-table 14). */

  test("A click on the header sorts ascending and descending", async ({ page }) => {
    const first = dataRows(page).first();
    await expect(first).toContainText("A-2041"); // Start: by Order
    const amount = table(page).getByRole("columnheader", { name: "Quantity" }).getByRole("button", { name: "Quantity", exact: true });
    await amount.click();
    await expect(first).toContainText("A-2042"); // smallest amount, 48
    await amount.click();
    await expect(first).toContainText("A-2043"); // largest amount, 1,250
  });

  test("The search filters, and the footer computes over what was found", async ({ page }) => {
    await searchField(page).fill("Northworks");
    await expect(dataRows(page)).toHaveCount(2);
    await expect(dataRows(page).first()).toContainText("Northworks");
    // 1,250 + 560: the sum of the filtered set, not of every row.
    await expect(table(page).locator("tfoot [data-footer='sum']")).toContainText("1,810");
  });

  test("The box in the header selects the filtered set across all pages", async ({ page }) => {
    /* The label, not the input (docs/testing.md, "Known open"). */
    await table(page).getByLabel("Select all").locator("xpath=ancestor::label").click();
    await expect(table(page).getByText("12 selected")).toBeVisible();
  });

  test("Paging shows the remaining rows", async ({ page }) => {
    // 12 orders at page size 5: the third page has 2.
    await expect(dataRows(page)).toHaveCount(5);
    const next = table(page).getByRole("button", { name: "Next", exact: true });
    await next.click();
    await next.click();
    await expect(dataRows(page)).toHaveCount(2);
  });

  test("A bulk action asks once and takes the row out", async ({ page }) => {
    await table(page).getByLabel("Select A-2041").locator("xpath=ancestor::label").click();
    await table(page).getByRole("button", { name: "Archive", exact: true }).click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText("Archive one order?")).toBeVisible();
    await confirm.getByRole("button", { name: "Archive" }).click();
    await expect(table(page).getByText("A-2041 archived")).toBeVisible();
    await expect(table(page).locator("tbody")).not.toContainText("A-2041");
  });
});

/* ---------------- Row detail: RowDetail › detail-row ---------------- */

test.describe("RowDetail › detail-row", () => {
  test.beforeEach(async ({ page }) => {
    await openExample(page, "rowdetail", "detail-row");
  });

  test("A row expands and collapses with the keyboard", async ({ page }) => {
    const table = example(page, "detail-row");
    const expand = table.getByRole("button", { name: "Expand A-2041" });
    await expand.focus();
    await expect(expand).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    const collapse = table.getByRole("button", { name: "Collapse A-2041" });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    // The name of the person responsible stands only in the detail row.
    await expect(table.getByText("M. Weber")).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(table.getByRole("button", { name: "Expand A-2041" })).toHaveAttribute("aria-expanded", "false");
    await expect(table.getByText("M. Weber")).toHaveCount(0);
  });

  test("Several rows stay open at once", async ({ page }) => {
    const table = example(page, "detail-row");
    await table.getByRole("button", { name: "Expand A-2041" }).click();
    await table.getByRole("button", { name: "Expand A-2042" }).click();
    await expect(table.getByRole("button", { name: /Collapse/ })).toHaveCount(2);
  });

  test("An open row stays open when a search hides it for a moment", async ({ page }) => {
    const table = example(page, "detail-row");
    await table.getByRole("button", { name: "Expand A-2041" }).click();
    await table.getByPlaceholder("Search customer").fill("Keller");
    await expect(table.getByRole("button", { name: /A-2041/ })).toHaveCount(0);
    await table.getByPlaceholder("Search customer").fill("");
    await expect(table.getByRole("button", { name: "Collapse A-2041" })).toBeVisible();
  });
});

/* ---------------- Row actions: RowActions ---------------- */

test("Row actions are reachable with the keyboard", async ({ page }) => {
  await openExample(page, "rowactions", "row-actions");
  const table = example(page, "row-actions");
  const open = table.getByRole("button", { name: "Open: A-2041" });
  await open.focus();
  await expect(open).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(table.getByText("A-2041 opened")).toBeVisible();
});

test("The row's overflow menu opens and runs an action", async ({ page }) => {
  await openExample(page, "rowactions", "overflow");
  const table = example(page, "overflow");
  await table.getByRole("button", { name: "Actions: A-2041" }).click();
  await page.getByRole("menuitem", { name: "Archive" }).click();
  await expect(table.getByText("A-2041 archived")).toBeVisible();
});

test("The overflow menu gives the focus back to its trigger", async ({ page }) => {
  await openExample(page, "rowactions", "overflow");
  const trigger = example(page, "overflow").getByRole("button", { name: "Actions: A-2041" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toBeHidden();
  await expect(trigger).toBeFocused();
});

/* ---------------- Column widths: Column › width, Table › initial-view ---------------- */

async function drag(page: Page, header: ReturnType<Page["locator"]>, by: number) {
  const box = (await header.boundingBox())!;
  await header.locator("span[role='presentation']").hover();
  await page.mouse.down();
  await page.mouse.move(box.x + box.width + by, box.y + box.height / 2, { steps: 8 });
  await page.mouse.up();
}

test.describe("Column › width", () => {
  test.beforeEach(async ({ page }) => {
    await openExample(page, "column", "width");
  });

  test("Dragging the grip changes the width and does not sort", async ({ page }) => {
    /* The header cell sorts on a click; a grip without a clean hit area would
       sort when the width was meant. */
    const table = example(page, "width");
    const header = table.getByRole("columnheader", { name: "Customer" });
    const before = (await header.boundingBox())!.width;

    await drag(page, header, 80);

    expect((await header.boundingBox())!.width).toBeGreaterThan(before + 40);
    await expect(header).toHaveAttribute("aria-sort", "none");
    await expect(table.locator("tbody tr").first()).toContainText("A-2041");
  });

  test("A double click on the grip measures the content", async ({ page }) => {
    const header = example(page, "width").getByRole("columnheader", { name: "Note" });
    const box = (await header.boundingBox())!;
    await drag(page, header, -(box.width - 60));
    const narrow = (await header.boundingBox())!.width;

    await header.locator("span[role='presentation']").dblclick();
    expect((await header.boundingBox())!.width).toBeGreaterThan(narrow);
  });

  test("Alt and an arrow key change the width from the keyboard", async ({ page }) => {
    /* Not sortable, but resizable: the header cell itself carries the tab stop. */
    const header = example(page, "width").getByRole("columnheader", { name: "Note" });
    const before = (await header.boundingBox())!.width;
    await header.focus();
    await page.keyboard.press("Alt+ArrowRight");
    await page.keyboard.press("Alt+ArrowRight");
    expect((await header.boundingBox())!.width).toBeGreaterThan(before);
  });
});

test("The dragged width stands in the view", async ({ page }) => {
  await openExample(page, "table", "initial-view");
  const table = example(page, "initial-view");
  await drag(page, table.getByRole("columnheader", { name: "Customer" }), 60);
  await expect(table.locator("[data-role='view']")).toContainText('"widths":{"customer":');
});
