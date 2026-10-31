import { openRec, axOf } from "./lib.mjs";
const lang = process.argv[2] || "de";
const s = await openRec("core", { lang }); const p = s.page; const ax = axOf(p);
const say = async (l) => console.log(l.padEnd(18), await ax(), "LIVE", JSON.stringify(await s.live()));
await p.getByRole("button", { name: "Date", exact: true }).focus(); await say("focus date");
await p.keyboard.press("Enter"); await p.waitForTimeout(300); await say("Enter");
for (const k of ["ArrowRight","ArrowRight","ArrowDown","PageDown","Home","End","ArrowUp"]) { await p.keyboard.press(k); await p.waitForTimeout(100); await say(k); }
console.log(await p.locator("[role=dialog]").first().ariaSnapshot().catch(e=>"nodialog"));
await p.keyboard.press("Enter"); await p.waitForTimeout(300); await say("Enter pick");
console.log("dialog open?", await p.locator("[role=dialog]:visible").count());
console.log(await p.evaluate(() => { const b=[...document.querySelectorAll("button")].find(b=>b.getAttribute("aria-haspopup")==="dialog"); return b.outerHTML.slice(0,500); }));
console.log(s.errors.join("\n"));
await s.close();
