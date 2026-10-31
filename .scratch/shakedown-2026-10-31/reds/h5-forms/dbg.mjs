import {chromium} from "playwright";
const b=await chromium.launch(); const pg=await b.newPage();
pg.on("console",m=>console.log(m.type(),m.text().slice(0,300))); pg.on("pageerror",e=>console.log("PE",e.message.slice(0,300)));
await pg.goto("http://localhost:4330/rhf.html"); await pg.waitForTimeout(800); console.log((await pg.content()).slice(0,300)); await b.close();
