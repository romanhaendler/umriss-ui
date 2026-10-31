import { test, expect, go } from "./fx";
for (const tz of ["Europe/Berlin", "Pacific/Kiritimati", "America/Los_Angeles"]) {
  test("dates grouping in " + tz, async ({ browser }) => {
    const ctx = await browser.newContext({ timezoneId: tz, locale: "de-DE" });
    const page = await ctx.newPage(); const logs: string[] = []; page.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.text()); });
    for (const g of ["d", "wk", "mo"]) {
      await page.goto("/?s=dates&lang=de&g=" + g); await page.waitForSelector("table");
      const lines = await page.locator("tbody tr").evaluateAll((trs: any[]) => trs.map((t) => t.innerText.replace(/\s+/g, " ").slice(0, 70)));
      console.log(tz, "group", g, "\n  " + lines.join("\n  "));
    }
    console.log(logs);
    await ctx.close();
  });
}
