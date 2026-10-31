import {open,active,openDialogs} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
async function run(name,fn){
  const {browser,page,errors}=await open("odd");
  const st=async(l)=>console.log(" ",l.padEnd(30),"focus=",await active(page),"dlg=",JSON.stringify(await openDialogs(page)),"modal-selector=",await page.evaluate(()=>document.querySelectorAll("dialog:modal").length),"inert=",await page.evaluate(()=>document.querySelectorAll("[inert]").length),"bodystyle=",await page.evaluate(()=>document.body.getAttribute("style")));
  console.log("##",name); await fn(page,st); if(errors.length)console.log("  ERR",errors); await browser.close();
}
await run("a: route change while modal open",async(page,st)=>{
  await page.click("#open-top"); await w(); await st("open"); await page.evaluate(()=>document.querySelector("#go-b")); 
  await page.evaluate(()=>document.getElementById("go-b").click()); await w(400); await st("after route (click via js)");
  await page.keyboard.press("Tab"); await st("tab after");
});
await run("b: parent drawer closes while nested modal open",async(page,st)=>{
  await page.click("#open-d"); await w(); await page.click("#nested-open"); await w(); await st("nested open");
  await page.evaluate(()=>document.getElementById("close-d").click()); await w(600); await st("drawer closed via state");
  await page.click("#open-d"); await w(); await st("reopen drawer: nested state?");
});
await run("c: anchor removed while popover open",async(page,st)=>{
  await page.click("#anch"); await w(); console.log("  panel", await page.evaluate(()=>!!document.getElementById("op")));
  await page.evaluate(()=>document.getElementById("rm-trig").click()); await w(400);
  console.log("  panel after anchor removed", await page.evaluate(()=>{const e=document.getElementById("op");return e&&JSON.stringify(e.parentElement.getBoundingClientRect())}));
  await page.keyboard.press("Escape"); await w(400); console.log("  panel after esc", await page.evaluate(()=>!!document.getElementById("op"))); await st("focus");
});
await run("d: rapid toggles during exit",async(page,st)=>{
  await page.click("#open-m"); await page.evaluate(()=>{}); 
  for (let i=0;i<7;i++){ await page.evaluate(()=>document.getElementById("toggle-m").click()); await w(40+i*30);} await w(800); await st("after 7 toggles");
  const o=await page.evaluate(()=>({ctx:1})); 
});
await run("e: open modal, reopen during exit",async(page,st)=>{
  await page.click("#open-top"); await w(); await page.keyboard.press("Escape"); await w(60);
  await page.evaluate(()=>document.getElementById("open-top").click()); await w(800); await st("reopened during exit");
  console.log("  top-in exists", await page.evaluate(()=>!!document.getElementById("top-in")));
  await page.keyboard.press("Escape"); await w(500); await st("esc");
});
