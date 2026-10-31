import { openRec, axOf } from "./lib.mjs";
const s = await openRec("core", { lang: "en" }); const p = s.page; const ax = axOf(p);
const open = async () => { await p.locator('button#_r_l_').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300); };
await open();
const names = await p.locator("[role=dialog]:visible button").evaluateAll(bs => bs.map(b => b.textContent));
console.log(names.join(" | "));
for (const [label, key] of [["Selected", "Enter"], ["Selected", "Space"], ["None", "Enter"], ["Invert", "Enter"], ["All", "Enter"]]) {
  const b = p.locator("[role=dialog]:visible button").filter({ hasText: new RegExp("^" + label) }).last();
  await b.focus(); await p.keyboard.press(key === "Space" ? " " : key); await p.waitForTimeout(150);
  console.log(label, key, "->", (await ax()).slice(0, 70), JSON.stringify(await s.live()));
}
await s.close();
