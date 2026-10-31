import { test, expect, go } from "./fx";
const flush = async (p: any) => { await p.waitForTimeout(450); await p.evaluate(() => { const w = window as any; w.__pend.forEach((x: any) => x.resolve(true)); w.__pend.length = 0; }); await p.waitForTimeout(250); };
const S = (p: any) => p.evaluate(() => { const t = (window as any).__t; const r = (window as any).__reqs; return `page=${t.page}/${t.pageCount} size=${t.pageSize} rows=${document.querySelectorAll("tbody tr").length} reqs=${r.map((x: any) => x.page + "/" + x.pageSize).join(",")} view=${JSON.stringify(t.view)}`; });
test("server fitted: pick 25, resize, Fit again, German dark", async ({ page, logs }) => {
  await go(page, "server", "&lang=de&dark=1");
  await flush(page); await flush(page);
  console.log("start", await S(page));
  for (let i = 0; i < 2; i++) { await page.getByRole("button", { name: /nächste seite/i }).click(); await flush(page); }
  console.log("page 3", await S(page));
  await page.getByRole("combobox").last().selectOption("25").catch(async () => { console.log("no native select"); });
  await flush(page); await flush(page);
  console.log("pick 25", await S(page));
  await page.screenshot({ path: "shots/server-25-de-dark.png" });
  await page.evaluate(() => { document.querySelector<HTMLElement>("div[style*='height: 420px']")!.style.height = "300px"; });
  await page.waitForTimeout(700); await flush(page);
  console.log("resize to 300", await S(page));
  await page.getByRole("combobox").last().selectOption({ label: "Fit" }).catch(async () => { console.log("select Fit failed"); });
  await flush(page); await flush(page);
  console.log("Fit again", await S(page));
  console.log(logs);
});
