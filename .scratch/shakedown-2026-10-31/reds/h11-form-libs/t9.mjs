import {chromium} from "playwright";
const b=await chromium.launch(); const p=await b.newPage(); p.on("pageerror",e=>console.log("PAGEERR",e.message.slice(0,200)));
await p.goto("http://localhost:4400/#rhf?undef"); await p.reload(); await p.waitForTimeout(1500); console.log("fields",await p.locator("[data-field]").count()); await b.close();
