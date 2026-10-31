import { test, expect, go } from "./fx";
const widths = (p: any) => p.evaluate(() => JSON.stringify({ w: (window as any).__t.widths, th: [...document.querySelectorAll("thead tr:last-child th")].map((t: any) => Math.round(t.getBoundingClientRect().width)), body: [...document.querySelector("tbody tr")!.children].map((t: any) => Math.round(t.getBoundingClientRect().width)) }));
test("resize drag with flex, container change mid-drag, hide mid-drag", async ({ page, logs }) => {
  await page.setViewportSize({ width: 1100, height: 700 });
  await go(page, "groups");
  const grip = (i: number) => page.locator("thead tr").last().locator("th").nth(i).locator("span[role=presentation]");
  console.log("start", await widths(page));
  let b = (await grip(2).boundingBox())!;
  await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
  await page.mouse.move(b.x + 40, b.y + 10, { steps: 5 });
  console.log("mid drag +40", await widths(page));
  await page.evaluate(() => (window as any).__setW(600));      // container shrinks mid-drag
  await page.waitForTimeout(150);
  await page.mouse.move(b.x + 80, b.y + 10, { steps: 5 });
  console.log("mid drag after container 600, +80", await widths(page));
  await page.evaluate(() => (window as any).__t.toggleColumn("qty")); // hide column mid-drag
  await page.waitForTimeout(150);
  await page.mouse.move(b.x + 100, b.y + 10, { steps: 3 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  console.log("after up+hide qty", await widths(page));
  await page.evaluate(() => (window as any).__t.toggleColumn("qty"));
  await page.evaluate(() => (window as any).__setW(1000));
  await page.waitForTimeout(200);
  console.log("qty back, container 1000", await widths(page));
  // dblclick autosize one column
  b = (await grip(4).boundingBox())!;
  await page.mouse.dblclick(b.x + b.width / 2, b.y + b.height / 2);
  await page.waitForTimeout(150);
  console.log("dbl dept", await widths(page));
  // drag below minWidth
  b = (await grip(3).boundingBox())!;
  await page.mouse.move(b.x + 3, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x - 400, b.y + 10, { steps: 5 }); await page.mouse.up();
  console.log("qty dragged -400", await widths(page));
  expect(logs).toEqual([]);
});
