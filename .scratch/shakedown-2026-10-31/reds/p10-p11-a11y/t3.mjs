import { open, focused } from "./lib.mjs";
const hash = process.argv[2] || "grid";
const keys = process.argv.slice(3);
const s = await open(hash);
const p = s.page;
const out = [];
// tab until we land in the grid
for (let i = 0; i < 12; i++) { await p.keyboard.press("Tab"); const f = await focused(p); out.push("Tab " + (i+1) + " -> " + f); if (await p.evaluate(() => !!document.activeElement.closest("[role=grid],[role=treegrid]") && document.activeElement.closest("[role=grid],[role=treegrid]").contains(document.activeElement))) break; }
for (const k of keys) { await p.keyboard.press(k); await p.waitForTimeout(80); out.push(k + " -> " + await focused(p)); }
console.log(out.join("\n")); console.log(s.errors.join("\n"));
await s.close();
