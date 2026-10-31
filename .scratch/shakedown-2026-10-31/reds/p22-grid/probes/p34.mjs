import { chromium } from "@playwright/test";
const b = await chromium.launch();
for (const [name, vp, q] of [["dark", { width: 1100, height: 700 }, "s=main&dark=1"], ["375", { width: 375, height: 700 }, "s=main"]]) {
  const p = await b.newPage({ viewport: vp }); await p.goto("http://localhost:4370/?" + q); await p.waitForSelector("table"); await p.waitForTimeout(600);
  if (name === "375") await p.evaluate(() => { document.getElementById("frame").style.width = "343px"; });
  await p.waitForTimeout(600); await p.screenshot({ path: `shots/main-${name}.png` });
  console.log(name, await p.evaluate(() => { const s = document.querySelector("table").parentElement; return [s.scrollWidth, s.clientWidth, document.documentElement.scrollWidth]; }));
}
await b.close();
