import { open, axe } from "./lib.mjs";
const states = [
  ["read", async (p) => { await p.getByRole("button", { name: /^Columns$|^Spalten$/ }).click(); }, "columns menu"],
  ["read", async (p) => { await p.getByRole("button", { name: /Filter Role|Role filtern/ }).click(); }, "text filter"],
  ["read", async (p) => { await p.getByRole("button", { name: /Filter Capacity|Capacity filtern/ }).click(); }, "range filter"],
  ["read", async (p) => { await p.getByRole("button", { name: /Filter Team|Team filtern/ }).click(); }, "list filter"],
  ["read", async (p) => { await p.locator('button[aria-label*="Person 0001"][aria-haspopup=menu]').click(); }, "row actions"],
  ["read", async (p) => { await p.locator('button[aria-label*="Person 0001"][aria-expanded]').first().click(); }, "row detail"],
  ["read", async (p) => { await p.getByRole("checkbox", { name: /Select Person 0001|Person 0001 auswählen/ }).check(); }, "selected row"],
  ["gridrow", async (p) => { await p.evaluate(() => document.querySelector("[role=grid] tbody td").focus()); await p.keyboard.press("ArrowRight"); await p.keyboard.press("Enter"); }, "row draft"],
  ["gridrow", async (p) => { await p.evaluate(() => document.querySelector("[role=grid] tbody td").focus()); await p.keyboard.press("ArrowRight"); await p.keyboard.press("Enter"); await p.keyboard.press("Tab");await p.keyboard.press("Tab"); await p.keyboard.type("999"); await p.keyboard.press("Enter"); }, "row draft invalid"],
  ["gridrow", async (p) => { await p.locator('button[aria-label*="Person 0001"]').last().click(); }, "delete ask"],
  ["core", async (p) => { await p.locator("button[aria-haspopup=menu]").click(); }, "menu"],
  ["core", async (p) => { await p.getByRole("button", { name: "Date", exact: true }).click(); }, "datepicker"],
  ["core", async (p) => { await p.getByRole("button", { name: "Range", exact: true }).click(); }, "range picker"],
  ["core", async (p) => { await p.getByRole("button", { name: "DateTime", exact: true }).click(); }, "datetime picker"],
  ["core", async (p) => { await p.locator("input[role=combobox]").click(); await p.keyboard.press("ArrowDown"); }, "combobox"],
  ["core", async (p) => { await p.locator("button#_r_l_").click(); }, "multiselect"],
  ["core", async (p) => { await p.getByRole("button", { name: "Open modal" }).click(); }, "modal"],
  ["core", async (p) => { await p.getByRole("button", { name: "Confirm", exact: true }).click(); }, "confirm"],
  ["core", async (p) => { await p.getByRole("button", { name: "Drawer" }).click(); }, "drawer"],
  ["core", async (p) => { await p.getByRole("button", { name: "Palette" }).click(); await p.keyboard.type("a"); }, "palette"],
  ["core", async (p) => { await p.getByRole("button", { name: "Toast" }).click(); }, "toast"],
  ["core", async (p) => { await p.getByRole("button", { name: "Submit" }).click(); }, "form errors"],
  ["core", async (p) => { await p.getByRole("button", { name: "Tooltip" }).focus(); await p.waitForTimeout(500); }, "tooltip"],
];
for (const [hash, act, name] of states) for (const theme of ["light", "dark"]) {
  const s = await open(hash, { theme, lang: "en" });
  try { await act(s.page); await s.page.waitForTimeout(500); } catch (e) { console.log(name, theme, "ACT FAILED", e.message.split("\n")[0]); await s.close(); continue; }
  const v = (await axe(s.page)).filter((x) => !/heading-order/.test(x) && !/_message/.test(x) || name !== "x");
  console.log(name.padEnd(18), theme.padEnd(6), v.length ? "\n   " + v.join("\n   ") : "clean", s.errors.length ? "\n   CONSOLE " + s.errors.join(" | ") : "");
  await s.close();
}
