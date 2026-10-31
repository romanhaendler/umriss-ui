import { open, ROWS, csv } from "./lib.mjs";
const h = await open();
await h.page.evaluate(() => window.t.setFilter("name", { terms: [{ operator: "contains", value: "a" }] }));
await h.page.waitForTimeout(200);
console.log((await csv(h.page)).split("\r\n").map((l) => l.slice(0, 22)).join("\n"));
console.log(await h.page.evaluate(() => window.t.filtered.length), await h.page.evaluate(() => window.t.rowCount));
console.log(await h.page.locator("tbody tr").count());
await h.page.screenshot({ path: "shots/tf.png" });
await h.close();
