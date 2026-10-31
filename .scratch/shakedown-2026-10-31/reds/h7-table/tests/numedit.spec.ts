import { test, expect, go } from "./fx";
for (const lang of ["", "de"]) test("number editor typing, lang=" + (lang || "en"), async ({ page, logs }) => {
  await go(page, "edit", lang ? "&lang=de" : "");
  const log = () => page.evaluate(() => (window as any).__log.map((e: any) => [e.columnId, e.value, typeof e.value]));
  const edit = async (text: string, key = "Enter") => {
    await page.locator("tbody tr").nth(5).locator("td").nth(0).click();
    await page.keyboard.press("Meta+a"); await page.keyboard.press("Backspace");
    if (text) await page.keyboard.type(text);
    const shown = await page.evaluate(() => (document.activeElement as HTMLInputElement).value);
    await page.keyboard.press(key); await page.waitForTimeout(100);
    console.log(lang || "en", JSON.stringify(text), "-> field", JSON.stringify(shown), "-> reported", JSON.stringify((await log()).at(-1)));
    await page.keyboard.press("Escape");
  };
  for (const t of ["1234.5", "1.234,5", "1,234.5", "12e3", "-0", "-", "1 000", "abc", "", "99999999999999999999", "0,1"]) await edit(t);
  await edit("77", "Tab");
  console.log("after Tab focus:", await page.evaluate(() => document.activeElement?.tagName + ":" + (document.activeElement as any)?.innerText?.slice(0, 10)), (await log()).at(-1));
  await edit("55", "Escape");
  console.log("after Escape commit count:", (await log()).length);
  console.log(logs);
});
