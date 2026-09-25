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

/* ---------------- The position guard: Scenarios › find a late shipment (table-filters D1) ---------------- */

test("The head of the table stays put while one searches, filters and resets", { tag: "@both-themes" }, async ({ page }) => {
  /* The conditions used to stand as a row of their own between the table
     toolbar and the header and appeared with the first keystroke – the table
     slid downwards, and upwards again when it was cleared. The measurement is
     taken after every step, as soon as the rows show it. */
  await openScenario(page, "find-a-late-shipment");
  const table = page.locator('[data-scenario="find-a-late-shipment"]');
  const rows = table.locator("tbody tr");
  /* Measured against the scenario, not the window: the scenario stands last on
     its page, and a page that grows shorter moves the scroll position. */
  const top = async () => (await table.locator("thead").boundingBox())!.y - (await table.boundingBox())!.y;
  const start = await top();

  await table.getByPlaceholder("Shipment or customer").pressSequentially("Northfold");
  await expect(rows).toHaveCount(6);
  expect(await top()).toBe(start);

  await table.getByRole("button", { name: "Filter Status" }).click();
  await page.getByRole("dialog").getByText("Out for delivery", { exact: true }).click();
  await page.keyboard.press("Escape");
  await expect(rows).toHaveCount(1);
  expect(await top()).toBe(start);

  await table.getByRole("button", { name: "Reset", exact: true }).click();
  await expect(rows).toHaveCount(10);
  expect(await top()).toBe(start);
});

/* ---------------- Table toolbar and sorting: Scenarios › find a late shipment ---------------- */

test.describe("Scenarios › find a late shipment", () => {
  test.beforeEach(async ({ page }) => {
    await openScenario(page, "find-a-late-shipment");
  });

  const table = (page: Page) => page.locator('[data-scenario="find-a-late-shipment"]');
  const searchField = (page: Page) => table(page).getByPlaceholder("Shipment or customer");
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
    await searchField(page).fill("Northfold");
    await expect(conditions(page)).toBeHidden();
    await choose(page, "Status", "Delivered");
    await expect(conditions(page)).toContainText("Status");
    await expect(conditions(page)).toContainText("Delivered");
  });

  test("The table toolbar names the ratio of finds to the total set", async ({ page }) => {
    await searchField(page).fill("Northfold");
    await expect(table(page).getByRole("status").filter({ hasText: " of " })).toHaveText("6 of 70");
  });

  test("Removing one condition leaves the others standing", async ({ page }) => {
    await choose(page, "Depot", "North depot");
    await choose(page, "Status", "Delivered");
    await expect(conditions(page).getByRole("listitem")).toHaveCount(2);
    await conditions(page).getByRole("button", { name: "Remove Depot: North depot" }).click();
    await expect(conditions(page).getByRole("listitem")).toHaveCount(1);
    await expect(conditions(page)).toContainText("Status");
  });

  test("A click on a condition opens the panel of its filter", async ({ page }) => {
    await choose(page, "Status", "Delivered");
    await conditions(page).getByRole("button", { name: "Edit Status: Delivered" }).click();
    await expect(page.getByRole("dialog", { name: "Filter Status" })).toBeVisible();
  });

  test("Reset clears search and conditions", async ({ page }) => {
    await searchField(page).fill("e");
    await choose(page, "Status", "Delivered");
    await table(page).getByRole("button", { name: "Reset", exact: true }).click();
    await expect(conditions(page)).toBeHidden();
    await expect(searchField(page)).toHaveValue("");
  });

  test("A modifier key appends a second sort level, with rank numbers", async ({ page }) => {
    const customerHeader = table(page).getByRole("columnheader", { name: "Customer" });
    const amountHeader = table(page).getByRole("columnheader", { name: "Weight (kg)" });

    await customerHeader.getByRole("button", { name: "Customer", exact: true }).click();
    await expect(customerHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(amountHeader).toHaveAttribute("aria-sort", "none");

    await amountHeader.getByRole("button", { name: "Weight (kg)", exact: true }).click({ modifiers: ["Shift"] });

    await expect(customerHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(amountHeader).toHaveAttribute("aria-sort", "ascending");
    await expect(customerHeader.getByText("1", { exact: true })).toBeVisible();
    await expect(amountHeader.getByText("2", { exact: true })).toBeVisible();
  });

  /* The counterparts of the table tests from
     `packages/core/tests-visual/features-basics.spec.ts`, which ran there
     against the order list that is now a scenario (umriss-table 14). */

  test("A click on the header sorts ascending and descending", async ({ page }) => {
    const first = dataRows(page).first();
    await expect(first).toContainText("FP-1004210"); // Start: by shipment
    const customer = table(page).getByRole("columnheader", { name: "Customer" }).getByRole("button", { name: "Customer", exact: true });
    await customer.click();
    await expect(first).toContainText("Ashcombe Dental");
    await customer.click();
    await expect(first).toContainText("Tamsin's Bakery");
  });

  test("The search filters, and the footer computes over what was found", async ({ page }) => {
    await searchField(page).fill("Northfold");
    await expect(dataRows(page)).toHaveCount(6);
    await expect(dataRows(page).first()).toContainText("Northfold");
    // 23 + 21 + 17 + 15 + 13 + 11 kg: the sum of the filtered set, not of every row.
    await expect(table(page).locator("tfoot [data-footer='sum']")).toContainText("100");
  });

  test("The box in the header selects the filtered set across all pages", async ({ page }) => {
    /* The label, not the input (docs/testing.md, "Known open"). */
    await table(page).getByLabel("Select all").locator("xpath=ancestor::label").click();
    await expect(table(page).getByText("70 selected")).toBeVisible();
  });

  test("Paging shows the remaining rows", async ({ page }) => {
    // 25 shipments out for delivery at page size 10: the third page has 5.
    await choose(page, "Status", "Out for delivery");
    await expect(dataRows(page)).toHaveCount(10);
    const next = table(page).getByRole("button", { name: "Next", exact: true });
    await next.click();
    await next.click();
    await expect(dataRows(page)).toHaveCount(5);
  });

  test("A bulk action asks once and takes the row out", async ({ page }) => {
    await table(page).getByLabel("Select FP-1004210").locator("xpath=ancestor::label").click();
    await table(page).getByRole("button", { name: "Archive", exact: true }).click();
    const confirm = page.getByRole("dialog");
    await expect(confirm.getByText("Archive one shipment?")).toBeVisible();
    await confirm.getByRole("button", { name: "Archive" }).click();
    await expect(table(page).getByText("FP-1004210 archived")).toBeVisible();
    await expect(table(page).locator("tbody")).not.toContainText("FP-1004210");
  });
});

/* ---------------- Row detail: RowDetail › open-a-detail, keep-rows-open-while-searching ---------------- */

test.describe("RowDetail › open-a-detail", () => {
  test.beforeEach(async ({ page }) => {
    await openExample(page, "rowdetail", "open-a-detail");
  });

  test("A row expands and collapses with the keyboard", async ({ page }) => {
    const table = example(page, "open-a-detail");
    const expand = table.getByRole("button", { name: "Expand FP-1004210" });
    await expand.focus();
    await expect(expand).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Enter");
    const collapse = table.getByRole("button", { name: "Collapse FP-1004210" });
    await expect(collapse).toHaveAttribute("aria-expanded", "true");
    // The address stands only in the detail row.
    await expect(table.getByText("12 Orchard Lane, Ashcombe")).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(table.getByRole("button", { name: "Expand FP-1004210" })).toHaveAttribute("aria-expanded", "false");
    await expect(table.getByText("12 Orchard Lane, Ashcombe")).toHaveCount(0);
  });

  test("Several rows stay open at once", async ({ page }) => {
    const table = example(page, "open-a-detail");
    await table.getByRole("button", { name: "Expand FP-1004210" }).click();
    await table.getByRole("button", { name: "Expand FP-1004223" }).click();
    await expect(table.getByRole("button", { name: /Collapse/ })).toHaveCount(2);
  });
});

test("RowDetail › an open row stays open when a search hides it for a moment", async ({ page }) => {
  await openExample(page, "rowdetail", "keep-rows-open-while-searching");
  const table = example(page, "keep-rows-open-while-searching");
  await table.getByRole("button", { name: "Expand FP-1004210" }).click();
  await table.getByPlaceholder("Search customer").fill("Brixley");
  await expect(table.getByRole("button", { name: /FP-1004210/ })).toHaveCount(0);
  await table.getByPlaceholder("Search customer").fill("");
  await expect(table.getByRole("button", { name: "Collapse FP-1004210" })).toBeVisible();
});

/* ---------------- Row actions: RowActions ---------------- */

test("Row actions are reachable with the keyboard", async ({ page }) => {
  await openExample(page, "rowactions", "two-actions");
  const table = example(page, "two-actions");
  const open = table.getByRole("button", { name: "Open: INV-26-0318" });
  await open.focus();
  await expect(open).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(table.getByText("INV-26-0318 opened")).toBeVisible();
});

test("The row's overflow menu opens and runs an action", async ({ page }) => {
  await openExample(page, "rowactions", "more-than-two");
  const table = example(page, "more-than-two");
  await table.getByRole("button", { name: "Actions: INV-26-0318" }).click();
  await page.getByRole("menuitem", { name: "Reject" }).click();
  await expect(table.getByText("INV-26-0318 rejected")).toBeVisible();
});

test("The overflow menu gives the focus back to its trigger", async ({ page }) => {
  await openExample(page, "rowactions", "more-than-two");
  const trigger = example(page, "more-than-two").getByRole("button", { name: "Actions: INV-26-0318" });
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
    await openExample(page, "width-and-pinning", "width");
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
    await expect(table.locator("tbody tr").first()).toContainText("FP-1004210");
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
  await openExample(page, "view", "initial-view");
  const table = example(page, "initial-view");
  await drag(page, table.getByRole("columnheader", { name: "Supplier" }), 60);
  await expect(table.locator("[data-role='view']")).toContainText('"widths":{"supplier":');
});
