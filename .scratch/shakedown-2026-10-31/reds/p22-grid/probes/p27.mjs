import { open } from "./lib.mjs";
const p = await open("s=main", { width: 1100, height: 900 });
await p.evaluate(() => window.__t.setPageSize(50)); await p.waitForTimeout(400);
console.log(await p.evaluate(()=>{ let e=document.querySelector("table"); const out=[]; while(e && e!==document.body){ const cs=getComputedStyle(e); out.push(e.tagName+"."+(e.className+"").slice(0,22)+" ov="+cs.overflowY+" h="+Math.round(e.getBoundingClientRect().height)+" sh="+e.scrollHeight); e=e.parentElement;} return out;}));
const scroller = await p.evaluateHandle(() => { let e=document.querySelector("table"); while(e){ if(e.scrollHeight>e.clientHeight+5 && /auto|scroll/.test(getComputedStyle(e).overflowY)) return e; e=e.parentElement;} return null; });
await scroller.evaluate(s => { s.scrollTop = 300; }); await p.waitForTimeout(300);
console.log("tops", await p.evaluate(()=>[...document.querySelectorAll("thead tr")].map(r=>Math.round(r.getBoundingClientRect().top)+"/"+getComputedStyle(r.children[1]).position+"/"+getComputedStyle(r.children[1]).top)), await scroller.evaluate(s=>[s.className, s.scrollTop]));
await p.screenshot({ path: "shots/sticky-group.png" });
await p.b.close();
