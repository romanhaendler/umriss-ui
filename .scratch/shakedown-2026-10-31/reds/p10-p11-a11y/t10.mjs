import { openRec, axOf } from "./lib.mjs";
const lang = process.argv[2] || "de";
const s = await openRec("core", { lang }); const p = s.page; const ax = axOf(p);
for (let i = 0; i < 20; i++) { await p.keyboard.press("Tab"); console.log("Tab", i + 1, await ax()); }
console.log("LIVE", await s.live());
await p.getByRole("button", { name: "Submit" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
console.log("after submit:", await ax(), "LIVE", JSON.stringify(await s.live()));
console.log(await p.evaluate(() => [...document.querySelectorAll("form [aria-invalid],form [aria-describedby]")].map(e => e.tagName + " inv=" + e.getAttribute("aria-invalid") + " desc=" + (e.getAttribute("aria-describedby")||"") + " -> " + (e.getAttribute("aria-describedby")||"").split(" ").map(id => document.getElementById(id)?.textContent).join("/")).join("\n")));
await p.keyboard.press("Tab"); console.log(await ax());
console.log(s.errors.join("\n"));
await s.close();
