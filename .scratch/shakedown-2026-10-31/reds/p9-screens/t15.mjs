import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto("http://localhost:4380/#/form"); await p.reload(); await p.waitForTimeout(400);
const snap = await p.locator("main").ariaSnapshot(); console.log(snap.split("\n").filter(l=>/checkbox|switch|radio/.test(l)).join("\n"));
await b.close();
