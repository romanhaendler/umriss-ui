/* Interaction tests of the tree – in the features-*.spec.ts pattern.

   They stand here and not only in jsdom for a concrete reason: the checkbox
   lies inside a label, and a click ran through two paths for a while - the
   checkbox's onChange and the onClick of the surrounding span. Toggling twice
   means not toggling at all. In the browser nothing happened; jsdom covered it
   up, because both calls computed the same thing from the same state and the
   test compared the result instead of counting the gestures. What a person does
   with the mouse is therefore checked here. */

import { test, expect } from "@playwright/test";
import { openExample } from "./navigation";
import type { Page } from "@playwright/test";

test.skip(({ colorScheme }) => colorScheme === "dark", "Behaviour tests only once (light)");

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-03-17T10:30:00"));
  await openExample(page, "treeview", "demonstration");
  await page.locator('[data-example="demonstration"]').scrollIntoViewIfNeeded();
});

const demonstration = (page: Page) => page.locator('[data-example="demonstration"]');
/* The page shows three trees side by side; every selector therefore names the
   one it means. Without that a name would hit several. */
const tree = (page: Page, label: string) =>
  demonstration(page).getByRole("tree", { name: label });
const row = (page: Page, name: RegExp) =>
  tree(page, "Filing with a selection").getByRole("treeitem", { name });
const checkedLine = async (page: Page) =>
  ((await demonstration(page).innerText()).split("\n").find((l) => l.startsWith("Checked")) ?? "").trim();

test("A click on the checkbox toggles exactly once", async ({ page }) => {
  const target = row(page, /Single orders/);
  await expect(target).toHaveAttribute("aria-checked", "false");
  await target.locator("label").click();
  await expect(target).toHaveAttribute("aria-checked", "true");
  await target.locator("label").click();
  await expect(target).toHaveAttribute("aria-checked", "false");
});

test("Checking cascades to nodes that do not stand in the document", async ({ page }) => {
  // "Single orders" is closed: its children are rendered nowhere.
  await expect(row(page, /Order 4711/)).toHaveCount(0);
  await row(page, /Single orders/).locator("label").click();
  expect(await checkedLine(page)).toContain("so-4711");
  expect(await checkedLine(page)).toContain("so-4712");
});

test("A partly checked branch reports itself as mixed", async ({ page }) => {
  await row(page, /Single orders/).locator("label").click();
  await expect(row(page, /Contracts/).first()).toHaveAttribute("aria-checked", "mixed");
});

test("Unchecking a child takes the branch out with it", async ({ page }) => {
  const frame = row(page, /Framework contracts/);
  await expect(frame).toHaveAttribute("aria-checked", "true");
  await row(page, /Nordwerk/).locator("label").click();
  await expect(frame).toHaveAttribute("aria-checked", "mixed");
  expect(await checkedLine(page)).not.toContain("fc-north");
});

test("The chevron folds open without activating", async ({ page }) => {
  const single = row(page, /Single orders/);
  await expect(single).toHaveAttribute("aria-expanded", "false");
  await single.locator("span").first().click();
  await expect(single).toHaveAttribute("aria-expanded", "true");
  await expect(row(page, /Order 4711/)).toHaveCount(1);
});

test("The keyboard travels, opens and checks", async ({ page }) => {
  await row(page, /Terminations/).click();
  await page.keyboard.press("ArrowUp");
  await expect(row(page, /Single orders/)).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(row(page, /Single orders/)).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("ArrowRight");
  await expect(row(page, /Order 4711/)).toBeFocused();
  await page.keyboard.press(" ");
  await expect(row(page, /Order 4711/)).toHaveAttribute("aria-checked", "true");
});

test("The search shows the find with its path", async ({ page }) => {
  const searched = tree(page, "Filing, searched");
  const field = demonstration(page).getByLabel("Search the filing").nth(1);
  await field.fill("termination");
  await expect(searched.getByRole("treeitem", { name: /Terminations/ })).toHaveCount(1);
  // "Contracts" stands there only as a signpost – but it stands there.
  await expect(searched.getByRole("treeitem", { name: /Contracts/ })).toHaveCount(1);
  await field.fill("rainbow");
  /* No find – but "Inbox" stays standing: it is unloaded and cannot be
     searched, so it is never said of it that it contains nothing (ADR-0005).
     The empty state therefore does not appear: the view is not empty, it is
     only without finds. */
  await expect(searched.getByRole("treeitem")).toHaveCount(1);
  await expect(searched.getByRole("treeitem", { name: /Inbox/ })).toHaveCount(1);
});

test("Showing a node brings it into the window and focuses it", async ({ page }) => {
  const large = tree(page, "Large body");
  // Virtualised: only a fraction of the 240 nodes stands in the document.
  expect(await large.getByRole("treeitem").count()).toBeLessThan(60);
  await expect(large.getByRole("treeitem", { name: "Sheet 33.2" })).toHaveCount(0);

  await demonstration(page).locator('[data-role="reveal-deep"]').click();

  // The path has been folded open, the row brought into the window – and the
  // focus sits on it. That is exactly what jsdom cannot prove.
  await expect(large.getByRole("treeitem", { name: "Sheet 33.2" })).toBeFocused();
  expect(await demonstration(page).innerText()).toContain("Last revealed: f33-2");
});

test("Folding everything open and closed", async ({ page }) => {
  const large = tree(page, "Large body");
  const closed = await large.getByRole("treeitem").count();
  await demonstration(page).getByRole("button", { name: "Expand all" }).click();
  // Do more rows fit into the same window when folded open? No – the number of
  // rendered ones stays the same, but the leaves are below them now.
  await expect(large.getByRole("treeitem", { name: "Sheet 0.0" })).toHaveCount(1);
  await demonstration(page).getByRole("button", { name: "Collapse all" }).click();
  await expect(large.getByRole("treeitem", { name: "Sheet 0.0" })).toHaveCount(0);
  expect(await large.getByRole("treeitem").count()).toBe(closed);
});

test("Type-ahead: typing moves the focus without stirring the tree", async ({ page }) => {
  const large = tree(page, "Large body");
  await large.getByRole("treeitem", { name: "Folder 0", exact: true }).click();
  await page.keyboard.press("f");
  await expect(large.getByRole("treeitem", { name: "Folder 1", exact: true })).toBeFocused();
  // Nothing has been folded open.
  await expect(large.getByRole("treeitem", { name: "Sheet 1.0", exact: true })).toHaveCount(0);
});

test("Type-ahead: the second character refines instead of jumping on", async ({ page }) => {
  const large = tree(page, "Large body");
  await large.getByRole("treeitem", { name: "Folder 0", exact: true }).click();
  // The first character already jumps on: "f" lands on "Folder 1".
  // The second only refines - "Folder 1" begins with "fo" too, so the focus
  // stays there. A matcher that searched on behind the current node for the
  // second character too would land on "Folder 2".
  await page.keyboard.type("fo", { delay: 40 });
  await expect(large.getByRole("treeitem", { name: "Folder 1", exact: true })).toBeFocused();
});

test("Type-ahead: after a pause the buffer starts again from the front", async ({ page }) => {
  const large = tree(page, "Large body");
  await large.getByRole("treeitem", { name: "Folder 0", exact: true }).click();
  await page.keyboard.press("f");
  await expect(large.getByRole("treeitem", { name: "Folder 1", exact: true })).toBeFocused();
  // This is the place a wrong version passes and a real browser does not:
  // without a reset "f" would become "ff".
  await page.waitForTimeout(900);
  await page.keyboard.press("f");
  await expect(large.getByRole("treeitem", { name: "Folder 2", exact: true })).toBeFocused();
});

/* The range gestures. What is counted is what changes - a span of five has to
   bring five new ticks and not ten toggles. */

test("Shift with a chevron checks while it travels", async ({ page }) => {
  await row(page, /Nordwerk/).click();
  const before = (await checkedLine(page)).split(",").length;
  await page.keyboard.press("Shift+ArrowDown");
  await expect(row(page, /Suedbahn/)).toBeFocused();
  await page.keyboard.press("Shift+ArrowDown");
  await expect(row(page, /Ostmarkt/)).toBeFocused();
  // Two gestures, two changes - the three were checked, now Suedbahn and
  // Ostmarkt are off.
  const after = (await checkedLine(page)).split(",").length;
  expect(before - after).toBe(3); // Suedbahn, Ostmarkt and the whole branch
});

/** Counts the checked keys in the page's footer line. */
async function countChecked(page: Page): Promise<number> {
  const line = await checkedLine(page);
  return line.includes("nothing") ? 0 : line.split(":")[1]!.split(",").length;
}

test("Shift with space covers the span from the anchor to here", async ({ page }) => {
  // First empty everything, so that the count is unambiguous.
  await row(page, /Nordwerk/).click();
  await page.keyboard.press("Control+a");
  await page.keyboard.press("Control+a");
  expect(await checkedLine(page)).toContain("nothing");

  // Set the anchor, span two rows lower.
  await row(page, /Nordwerk/).locator("label").click();
  const afterAnchor = await countChecked(page);
  await row(page, /Ostmarkt/).click();
  await page.keyboard.press("Shift+ ");

  for (const name of ["fc-north", "fc-south", "fc-east"]) {
    expect(await checkedLine(page)).toContain(name);
  }
  /* Counted rather than compared: the span brings exactly two further ticks
     (Suedbahn and Ostmarkt) plus the branch that becomes full through them. A
     gesture that acted twice brought a different number. */
  expect((await countChecked(page)) - afterAnchor).toBe(3);
});

test("Ctrl with A fills and empties", async ({ page }) => {
  await row(page, /Nordwerk/).click();
  await page.keyboard.press("Control+a");
  const full = await checkedLine(page);
  expect(full).toContain("statutes");
  expect(full).toContain("d-q1");
  // And the disabled ones stay out – the tree still counts as full.
  expect(full).not.toContain("external");
  expect(full).not.toContain("2024");
  const filled = await countChecked(page);
  expect(filled).toBeGreaterThan(8);

  await page.keyboard.press("Control+a");
  expect(await countChecked(page)).toBe(0);
});

/* Disabled nodes and loading on demand (ADR-0005). */

test("A disabled node is visible, navigable and not checkable", async ({ page }) => {
  const disabled = row(page, /External mandates/);
  await expect(disabled).toHaveCount(1);
  await expect(disabled).toHaveAttribute("aria-disabled", "true");

  const before = await checkedLine(page);
  await disabled.locator("label").click({ force: true });
  expect(await checkedLine(page)).toBe(before);

  // Navigable it stays all the same.
  await row(page, /Terminations/).click();
  await page.keyboard.press("ArrowDown");
  await expect(disabled).toBeFocused();
});

test("A branch with a disabled child can be deselected again", async ({ page }) => {
  /* The case a person finds by clicking twice: the branch can never be checked
     itself, so its direction was permanently "check" – the first click set
     everything, every further one the same thing again, and the tree was
     stuck. */
  const contracts = row(page, /Contracts/).first();
  await contracts.locator("label").click();
  const afterOne = await checkedLine(page);
  expect(afterOne).toContain("so-4711");
  expect(afterOne).toContain("terminations");

  await contracts.locator("label").click();
  expect(await checkedLine(page)).toContain("nothing");

  // And back again – the gesture toggles, it does not jam.
  await contracts.locator("label").click();
  expect(await checkedLine(page)).toContain("so-4711");
});

test("A branch above a disabled child never becomes full", async ({ page }) => {
  const contracts = row(page, /Contracts/).first();
  await page.keyboard.press("Escape");
  await row(page, /Single orders/).locator("label").click();
  await row(page, /Terminations/).locator("label").click();
  // Everything except "External mandates" is on now – and "Contracts" stays mixed
  // all the same. That is exactly ADR-0005.
  await expect(contracts).toHaveAttribute("aria-checked", "mixed");
});

test("An unloaded branch shows on opening that it is loading", async ({ page }) => {
  const inbox = row(page, /Inbox/);
  await expect(inbox).toHaveAttribute("aria-expanded", "false");
  await inbox.locator("span").first().click();
  // First the spinner ...
  await expect(tree(page, "Filing with a selection").getByRole("status")).toHaveCount(1);
  // ... then the children, as soon as the caller has supplied the data.
  await expect(row(page, /Query from Nordwerk/)).toHaveCount(1);
  await expect(tree(page, "Filing with a selection").getByRole("status")).toHaveCount(0);
});

test("An unloaded branch survives the search", async ({ page }) => {
  const searched = tree(page, "Filing, searched");
  const field = demonstration(page).getByLabel("Search the filing").nth(1);
  await field.fill("quarter");
  // It cannot be searched, so it is never said of it that it contains nothing.
  await expect(searched.getByRole("treeitem", { name: /Inbox/ })).toHaveCount(1);
});
