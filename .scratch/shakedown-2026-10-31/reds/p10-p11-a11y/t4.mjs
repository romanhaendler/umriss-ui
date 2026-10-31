import { open, focused } from "./lib.mjs";
const hash = process.argv[2] || "grid";
const steps = JSON.parse(process.argv[3]);
const s = await open(hash);
const p = s.page;
const log = async (l) => console.log(l.padEnd(28), "|", await focused(p), "| log:", await p.locator("#log").textContent().catch(()=>""), "| inp:", await p.evaluate(() => document.activeElement.tagName + ":" + (document.activeElement.value ?? "")));
await p.locator("table[role=grid] td").first().focus().catch(()=>{});
await p.evaluate(()=>{const g=document.querySelector("[role=grid],[role=treegrid]"); const c=g.querySelector("tbody td"); c.focus();});
await log("start");
for (const st of steps) {
  if (st.startsWith("T:")) await p.keyboard.type(st.slice(2)); else await p.keyboard.press(st);
  await p.waitForTimeout(120); await log(st);
}
console.log(s.errors.join("\n"));
await s.close();
