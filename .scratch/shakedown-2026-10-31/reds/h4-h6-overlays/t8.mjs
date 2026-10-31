import {open,active} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
const {browser,page,errors}=await open("containers");
const info=(k)=>page.evaluate((k)=>{const p=document.getElementById("p-"+k); if(!p) return "none"; const panel=p.parentElement; const r=panel.getBoundingClientRect(); const t=document.getElementById("t-"+k).getBoundingClientRect(); const h=document.elementFromPoint(r.x+10,r.y+10); return {panel:[Math.round(r.x),Math.round(r.y)],trig:[Math.round(t.x),Math.round(t.y)],visibleTop:panel.contains(h),topLayer:panel.matches(":popover-open"),z:getComputedStyle(panel).zIndex,parent:panel.parentElement.tagName}},k);
for (const k of ["a","b","c","d"]) {
  await page.click("#t-"+k); await w(); console.log(k,"open",JSON.stringify(await info(k)));
  await page.mouse.wheel(0,200); await w(300); console.log(k,"after page scroll 200",JSON.stringify(await info(k)));
  await page.setViewportSize({width:600,height:500}); await w(300); console.log(k,"after resize",JSON.stringify(await info(k)));
  await page.setViewportSize({width:1000,height:700});
  await page.keyboard.press("Escape"); await w(300); await page.evaluate(()=>scrollTo(0,0)); await w(100);
}
// inner scroll of box c with panel open
await page.click("#t-c"); await w(); await page.evaluate(()=>{document.getElementById("box-c").scrollTop=60}); await w(300); console.log("c inner scroll",JSON.stringify(await info("c")));
await page.screenshot({path:"shots/containers.png"});
console.log(errors); await browser.close();
