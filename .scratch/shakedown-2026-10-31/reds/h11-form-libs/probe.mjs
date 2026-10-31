import {F} from "./drive.mjs";
// per-field state: error text, aria-invalid on which element, role, describedby
export async function state(p){
  return p.evaluate(()=>{
    const o={};
    for(const f of document.querySelectorAll("[data-field]")){
      const n=f.getAttribute("data-field");
      const inv=[...f.querySelectorAll("[aria-invalid=true]")].map(e=>e.tagName+(e.getAttribute("role")?"["+e.getAttribute("role")+"]":""));
      const msg=f.querySelector("[id$=-message]");
      o[n]={inv:inv.join(",")||"-",msg:msg?msg.textContent:"",req:[...f.querySelectorAll("[aria-required]")].length};
    }
    return o;
  });
}
export const active=(p)=>p.evaluate(()=>{const a=document.activeElement;return a?a.tagName+(a.getAttribute("type")?":"+a.getAttribute("type"):"")+(a.getAttribute("role")?"["+a.getAttribute("role")+"]":"")+" in "+(a.closest("[data-field]")?.getAttribute("data-field")??"none"):"none"});
// where does ref.focus() land, per field
export async function focusEach(p){
  const names=await p.evaluate(()=>[...window.__refs.keys()]);
  const r={};
  for(const n of names){ await p.evaluate(()=>document.activeElement?.blur()); await p.evaluate((n)=>window.__refs.get(n).focus(),n); r[n]=await active(p); }
  return r;
}
