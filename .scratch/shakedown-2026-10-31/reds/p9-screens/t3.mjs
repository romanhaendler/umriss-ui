import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage(); const logs=[];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.text().slice(0,160).replace(/\n/g," ")); });
await p.goto("http://localhost:4380/#/probe"); await p.waitForTimeout(500);
console.log(await p.locator("[data-probe]").evaluateAll(es=>es.map(e=>e.dataset.probe+": "+(e.dataset.err||"ok"))).then(a=>a.join("\n")));
console.log(logs.filter(l=>!l.includes("An error occurred")).join("\n"));
await b.close();
