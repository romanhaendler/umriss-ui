import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => sessionStorage.clear());
const act = () => p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + ":" + (a.value ?? a.textContent ?? "").slice(0, 18) + ":" + (a.closest("tr")?.querySelector("th[scope=row]")?.textContent ?? "") : null; });
await p.locator("th button", { hasText: "Qty" }).first().click(); await p.waitForTimeout(200);
console.log("sorted asc", (await p.names()).slice(0, 3));
await p.locator("tbody tr").nth(0).locator("td,th").nth(3).click(); await p.keyboard.press("Meta+a"); await p.keyboard.type("9999"); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
console.log("after moving edit", await p.st(), (await p.names()).slice(0, 3), "focus", await act());
console.log("edit", JSON.stringify(await p.evaluate(() => window.__edits.map(e => [e.rowKey, e.value]))));
// Enter again: does editor reopen on the moved row or the new first row?
await p.keyboard.press("ArrowDown"); console.log("ArrowDown", await act());
console.log(p.errs); await p.b.close();
