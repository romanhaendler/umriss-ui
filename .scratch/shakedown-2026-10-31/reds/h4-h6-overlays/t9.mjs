import {open} from "./lib.mjs";
const w=(n=350)=>new Promise(r=>setTimeout(r,n));
const snap=(page)=>page.evaluate(()=>({lc:{...window.__lc},bodyKids:document.body.children.length,dialogs:document.querySelectorAll("dialog").length,inert:document.querySelectorAll("[inert]").length,style:document.body.getAttribute("style"),htmlstyle:document.documentElement.getAttribute("style"),ids:document.querySelectorAll("[popover]").length}));
for (const strict of ["0","1"]) {
const {browser,page,errors}=await open("leak","&strict="+strict);
await w(500); const a=await snap(page);
for(let i=0;i<100;i++){ await page.evaluate(()=>document.getElementById("cycle").click()); await w(25); }
await w(600); const b=await snap(page);
const diff={}; for(const k of new Set([...Object.keys(a.lc),...Object.keys(b.lc)])) if((b.lc[k]||0)!==(a.lc[k]||0)) diff[k]=(b.lc[k]||0)-(a.lc[k]||0);
console.log("strict",strict,"cycles=100 (50 mounts) listener diff",JSON.stringify(diff),"bodyKids",a.bodyKids,"->",b.bodyKids,"dialogs",a.dialogs,"->",b.dialogs,"inert",b.inert,"style",b.style,b.htmlstyle,"popover els",b.ids);
console.log(errors.slice(0,5)); await browser.close();}
