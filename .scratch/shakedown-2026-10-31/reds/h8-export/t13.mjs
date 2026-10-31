import { open, csv, sel, download } from "./lib.mjs";
for (const lang of ["en", "de"]) {
  const h = await open({ lang, pageSize: 5 });
  const P = h.page;
  // real download
  const { name, buf } = await download(P, "CSVfile");
  const a = await csv(P);
  console.log(lang, "download", name, "== asCsv:", buf.toString("utf8") === a, "bytes", buf.length, "bom", buf.slice(0, 3).toString("hex"));
  // click checkboxes of first two rows; copy
  const boxes = P.locator("tbody tr input[type=checkbox], tbody tr [role=checkbox]");
  console.log(" row checkboxes:", await boxes.count());
  await boxes.nth(0).click(); await boxes.nth(2).click();
  await P.locator("tbody tr").nth(1).locator("td,th").nth(2).click();
  await P.keyboard.press("Control+c");
  await P.waitForTimeout(300);
  const clip = await P.evaluate(() => navigator.clipboard.readText());
  console.log(" ctrl+C == selectionAsText:", clip === await sel(P), JSON.stringify(clip.slice(0, 120)));
  console.log(" shown first row text:", await P.locator("tbody tr").nth(0).innerText().then((s) => s.replace(/\s+/g, " ").slice(0, 160)));
  console.log(" live region:", await P.evaluate(() => [...document.querySelectorAll("[aria-live]")].map((e) => e.textContent).filter(Boolean)));
  // marked text keeps browser copy
  await P.evaluate(() => { const c = document.querySelector("tbody tr td"); const r = document.createRange(); r.selectNodeContents(c); const s = getSelection(); s.removeAllRanges(); s.addRange(r); });
  await P.keyboard.press("Control+c"); await P.waitForTimeout(200);
  console.log(" marked-text copy:", JSON.stringify((await P.evaluate(() => navigator.clipboard.readText())).slice(0, 60)));
  console.log(h.logs);
  await h.close();
}
