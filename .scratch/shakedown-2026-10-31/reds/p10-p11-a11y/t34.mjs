import { openRec } from "./lib.mjs";
const s = await openRec("grid", { lang: "en" }); const p = s.page;
const log = () => p.locator("#log").textContent();
const edit = async () => { await p.evaluate(() => document.querySelector("[role=grid] tbody th").focus()); await p.keyboard.press("Enter"); await p.keyboard.type("Zed"); };
// 1 sort header click while editing
await edit(); await p.getByRole("button", { name: "NAME" }).or(p.getByRole("button", { name: "Name", exact: true })).first().click(); await p.waitForTimeout(300);
console.log("click sort while editing ->", JSON.stringify(await log()), await p.evaluate(() => document.querySelector("[role=grid] tbody th").textContent));
// 2 next page
await edit(); await p.getByRole("button", { name: "Next page" }).click(); await p.waitForTimeout(300);
console.log("next page while editing ->", JSON.stringify(await log()));
// 3 search typed while editing (Tab out to toolbar search)
await p.getByRole("button", { name: "Previous page" }).click();
await edit(); await p.getByRole("searchbox").click(); await p.keyboard.type("Person 0003"); await p.waitForTimeout(500);
console.log("search while editing ->", JSON.stringify(await log()), await p.evaluate(() => document.querySelector("[role=grid] tbody th")?.textContent));
// 4 Escape after typing
await p.getByRole("searchbox").fill(""); await p.waitForTimeout(400);
await edit(); await p.keyboard.press("Escape"); console.log("escape ->", JSON.stringify(await log()), await p.evaluate(() => document.querySelector("[role=grid] tbody th").textContent));
// 5 edit then group by (menu?) skipped; edit capacity invalid then Escape
console.log(s.errors.join("\n")); await s.close();
