import {chromium} from "playwright";
const b=await chromium.launch(); const p=await b.newPage(); p.on("pageerror",e=>console.log("PAGEERR",e.message.slice(0,300))); p.on("console",m=>console.log(m.type(),m.text().slice(0,300)));
await p.goto("http://localhost:4400/#"+process.argv[2]); await p.reload(); await p.waitForTimeout(2000); console.log("fields",await p.locator("[data-field]").count()); await b.close();
