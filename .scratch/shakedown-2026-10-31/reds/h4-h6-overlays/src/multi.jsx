import React, { useState, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createPortal } from "react-dom";
import cssText from "@umriss-ui/core/styles.css?inline";
import * as Core from "@umriss-ui/core";
import * as Core2 from "../core2copy/dist/core.js";
const q=new URLSearchParams(location.search);

function Card({C,tag}) {
  const {UmrissProvider,Modal,CommandPalette,useCommandPaletteShortcut,ModalHeader,ModalBody,Popover,Button,Menu,MenuItem}=C;
  const [m,setM]=useState(false),[p,setP]=useState(false),[pal,setPal]=useState(false); const a=useRef(null);
  if(tag==="S"||tag==="F") useCommandPaletteShortcut(()=>{(window.__pal=window.__pal||[]).push(tag);setPal(true)});
  return <div id={"card-"+tag}><input id={"in-"+tag}/><CommandPalette open={pal} onClose={()=>setPal(false)} items={[{id:"x",label:"x"}]} onChoose={()=>setPal(false)}/><Button id={"m-"+tag} onClick={()=>setM(true)}>modal {tag}</Button><Button id={"p-"+tag} ref={a} onClick={()=>setP(true)}>pop {tag}</Button>
    <Menu trigger={<Button id={"menu-"+tag}>menu {tag}</Button>}><MenuItem id={"mi-"+tag} onSelect={()=>{(window.__sel=window.__sel||[]).push(tag)}}>item {tag}</MenuItem></Menu>
    <Popover open={p} onOpenChange={setP} anchorRef={a}><div id={"pp-"+tag} style={{padding:8}}>panel {tag}</div></Popover>
    <Modal open={m} onClose={()=>setM(false)}><ModalHeader title={"Modal "+tag}/><ModalBody><Button id={"mb-"+tag}>b</Button></ModalBody></Modal></div>;
}
const App=({C,tag,pt})=>{const P=C.UmrissProvider; return <P portalTarget={pt}><Card C={C} tag={tag}/></P>};
createRoot(document.getElementById("a")).render(<App C={Core} tag="A"/>);
createRoot(document.getElementById("b")).render(<App C={Core} tag="B"/>);
createRoot(document.getElementById("c")).render(<App C={Core2} tag="copy2"/>);
// shadow
const host=document.getElementById("host"); const sr=host.attachShadow({mode:"open"});
const sheet=new CSSStyleSheet(); sheet.replaceSync(cssText); sr.adoptedStyleSheets=[sheet];
const mount=document.createElement("div"); sr.appendChild(mount);
createRoot(mount).render(<App C={Core} tag="S" pt={()=>mount}/>);
// iframe
const fr=document.getElementById("fr");
const go=()=>{ if(window.__frameReady) return; const d=fr.contentDocument; const st=d.createElement("style"); st.textContent=cssText; d.head.appendChild(st); createRoot(d.getElementById("r")).render(<App C={Core} tag="F" pt={()=>d.body}/>); window.__frameReady=1;};
fr.addEventListener("load",go); if(fr.contentDocument?.readyState==="complete" && fr.contentDocument.getElementById("r")) go();
window.__ready=1;
