import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:375,height:800}}); const logs=[];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.text().slice(0,200).replace(/\n/g," ")); });
p.on("pageerror", (e) => logs.push("PAGEERR " + e.message.slice(0, 200)));
await p.goto("http://localhost:4380/#/admin"); await p.reload(); await p.waitForTimeout(400);
await p.getByRole("switch",{name:"Dark"}).check(); await p.getByRole("switch",{name:"DE"}).check(); await p.waitForTimeout(500);
await p.screenshot({path:"shots/admin-375-dark-de.png"});
console.log("rows:", await p.locator("tbody tr").count(), "logs", logs);
await b.close();
