import { test, expect, go } from "./fx";
const act = (p: any) => p.evaluate(() => { const a = document.activeElement as any; const tr = a?.closest?.("tr"); return `${a?.tagName}|cell="${(a?.innerText ?? "").replace(/\s+/g, " ").slice(0, 16)}"|ci=${a?.cellIndex}|ri=${tr?.getAttribute("aria-rowindex")}|scrollTop=${Math.round([...document.querySelectorAll("div")].find((d) => getComputedStyle(d).overflowY === "auto" && d.scrollHeight > d.clientHeight)?.scrollTop ?? -1)}`; });
const run = async (page: any, keys: string[]) => { for (const k of keys) { await page.keyboard.press(k); await page.waitForTimeout(80); console.log(k.padEnd(18), await act(page)); } };
test("grid keys, grouped", async ({ page, logs }) => {
  await go(page, "live");
  await page.locator("tbody tr").nth(2).locator("td").nth(1).click(); await page.keyboard.press("Escape");
  console.log("start", await act(page));
  await run(page, ["ArrowUp", "ArrowUp", "ArrowUp", "ArrowUp", "ArrowRight", "ArrowRight", "Space", "ArrowDown", "ArrowDown"]);
  console.log(logs);
});
