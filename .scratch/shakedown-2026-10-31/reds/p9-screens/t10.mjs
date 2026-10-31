import { chromium } from "playwright";
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:375,height:800}}); const logs=[];
p.on("console", (m) => { if (["error", "warning"].includes(m.type())) logs.push(m.text().slice(0,200).replace(/\n/g," ")); });
p.on("pageerror", (e) => logs.push("PAGEERR " + e.message.slice(0, 200)));
const routes=["login","settings","form","wizard","notifications","upload","profile","search","admin"];
for (const w of [375, 1920]) { await p.setViewportSize({width:w,height:900});
 for (const r of routes) { await p.goto(`http://localhost:4380/#/${r}`); await p.reload(); await p.waitForTimeout(350);
  const o = await p.evaluate(()=>{const d=document.documentElement; const wide=[...document.querySelectorAll("main *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1&&!e.closest("[style*=overflow],table")).slice(0,2).map(e=>e.tagName+"."+String(e.className).slice(0,20)); return [d.scrollWidth-innerWidth, wide]});
  console.log(w, r, "overflow", o[0], o[1].join(","));
  await p.screenshot({path:`shots/${r}-${w}.png`}); } }
// header at 375: do toolbar items wrap?
await p.setViewportSize({width:375,height:800});
await p.goto("http://localhost:4380/#/admin"); await p.reload(); await p.waitForTimeout(400);
// dark + de on admin
await p.getByLabel("Dark").check(); await p.getByLabel("DE").check(); await p.waitForTimeout(400);
await p.screenshot({path:"shots/admin-375-dark-de.png"});
console.log("logs", logs);
await b.close();
