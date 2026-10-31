import { chromium } from "playwright";
export async function open(s, extra="", opts={}) {
  const browser = await chromium.launch();
  const page = await browser.newPage({viewport:{width:1000,height:700},...opts});
  const errors=[]; page.on("console",m=>{ if(["error","warning"].includes(m.type())) errors.push(m.type()+": "+m.text()); }); page.on("pageerror",e=>errors.push("pageerror: "+e.message));
  await page.addInitScript(()=>{
    const c={}; const add=EventTarget.prototype.addEventListener, rem=EventTarget.prototype.removeEventListener;
    const key=(t,ty)=>(t===window?"window":t===document?"document":t===document.body?"body":t.nodeName||"x")+":"+ty;
    const seen=new WeakMap();
    EventTarget.prototype.addEventListener=function(ty,fn,o){ if(fn){const k=key(this,ty);const cap=typeof o==="object"?!!o?.capture:!!o; const id=k+cap; let m=seen.get(this); if(!m){m=new Map();seen.set(this,m);} const mk=id; const set=m.get(mk)||new Set(); if(!set.has(fn)){set.add(fn);m.set(mk,set);c[k]=(c[k]||0)+1;}} return add.call(this,ty,fn,o); };
    EventTarget.prototype.removeEventListener=function(ty,fn,o){ if(fn){const k=key(this,ty);const cap=typeof o==="object"?!!o?.capture:!!o; const m=seen.get(this); const set=m?.get(k+cap); if(set?.delete(fn)){c[k]--;}} return rem.call(this,ty,fn,o); };
    window.__lc=c;
  });
  await page.goto("http://127.0.0.1:4320/?s="+s+extra);
  return {browser,page,errors};
}
export const active=(page)=>page.evaluate(()=>{const a=document.activeElement;return a?(a.id?"#"+a.id:a.tagName+(a.getAttribute("aria-label")?"["+a.getAttribute("aria-label")+"]":"")+(a.textContent?.slice(0,15)?":"+a.textContent.slice(0,15):"")):"null"});
export const openDialogs=(page)=>page.evaluate(()=>[...document.querySelectorAll("dialog[open]")].map(d=>d.querySelector("h2")?.textContent||d.getAttribute("aria-label")));
