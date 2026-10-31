// Picks a date by keyboard, then reads the trigger's accessible name/description/value via CDP.
import { openRec, axOf } from "./lib.mjs";
const s = await openRec("core", { lang: process.argv[2] || "de" }); const p = s.page; const ax = axOf(p);
await p.getByRole("button", { name: "Date", exact: true }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
await p.keyboard.press("ArrowLeft"); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
console.log("trigger after pick:", await ax(), "| text:", await p.evaluate(() => document.activeElement.textContent), "| live:", JSON.stringify(await s.live()));
await p.getByRole("button", { name: "DateTime", exact: true }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
await p.keyboard.press("Enter"); await p.waitForTimeout(300);
console.log("datetime step 2:", await ax(), JSON.stringify(await s.live()));
await s.close();
