import React, { StrictMode, useState, useRef, useEffect, Suspense, lazy, Activity } from "react";
import { createRoot } from "react-dom/client";
import "@umriss-ui/core/styles.css";
import { UmrissProvider, ToastProvider, useToast, Modal, ModalHeader, ModalBody, ModalFooter, Drawer, ConfirmDialog, CommandPalette,
  useCommandPaletteShortcut, Menu, MenuItem, Popover, Button, Input, Select, DatePicker, Tooltip } from "@umriss-ui/core";
import * as RD from "@radix-ui/react-dialog";

const q = new URLSearchParams(location.search);
const S = q.get("s") || "nest";
const strict = q.get("strict") !== "0";
const items = [{id:"a",label:"Go home",group:"Nav"},{id:"b",label:"Open settings",group:"Nav"}];

function Nest() {
  const [drawer,setDrawer]=useState(false), [modal,setModal]=useState(false), [confirm,setConfirm]=useState(false), [pal,setPal]=useState(false);
  const [pop,setPop]=useState(false), [pop2,setPop2]=useState(false), [date,setDate]=useState(null), [sel,setSel]=useState("a");
  const anchor=useRef(null), anchor2=useRef(null);
  const {toast}=useToast();
  useCommandPaletteShortcut(()=>setPal(true));
  const [log,setLog]=useState([]);
  window.__log=(m)=>setLog(l=>[...l,m]);
  return <div>
    <header style={{position:"sticky",top:0,zIndex:1000,background:"#ddd",padding:8}}>
      <Button id="open-drawer" onClick={()=>setDrawer(true)}>Drawer</Button>
      <Button id="open-modal" onClick={()=>setModal(true)}>Modal</Button>
      <Button id="open-pal" onClick={()=>setPal(true)}>Palette</Button>
      <Button id="toast-modal" onClick={()=>toast({title:"Saved",duration:0,action:{label:"Review",onClick:()=>setModal(true)}})}>Toast</Button>
      <input id="host-input" placeholder="host input"/>
      <Menu trigger={<Button id="menu-trig">Menu</Button>}><MenuItem id="mi-modal" onSelect={()=>setModal(true)}>Open modal</MenuItem><MenuItem onSelect={()=>setConfirm(true)}>Confirm</MenuItem></Menu>
    </header>
    <div style={{height:1500}}>filler</div>
    <Drawer open={drawer} onClose={()=>setDrawer(false)}>
      <ModalHeader title="Drawer"/>
      <ModalBody>
        <Button id="d-open-modal" onClick={()=>setModal(true)}>Modal in drawer</Button>
        <Menu trigger={<Button id="d-menu">Menu in drawer</Button>}><MenuItem id="d-mi" onSelect={()=>window.__log("d-mi")}>Item</MenuItem></Menu>
      </ModalBody>
    </Drawer>
    <Modal open={modal} onClose={()=>{window.__log("modal-close");setModal(false)}}>
      <ModalHeader title="Modal"/>
      <ModalBody>
        <Input id="m-input" autoFocus/>
        <Menu trigger={<Button id="m-menu">Menu in modal</Button>}><MenuItem id="m-mi" onSelect={()=>window.__log("m-mi")}>Item</MenuItem><MenuItem onSelect={()=>setConfirm(true)}>Confirm over</MenuItem></Menu>
        <Button id="m-pop" ref={anchor} onClick={()=>setPop(p=>!p)}>Popover</Button>
        <Popover open={pop} onOpenChange={setPop} anchorRef={anchor} role="dialog" aria-label="p">
          <div style={{padding:8}}><DatePicker value={date} onChange={setDate}/><Select id="p-select" value={sel} onChange={e=>setSel(e.target.value)}><option value="a">A</option><option value="b">B</option></Select></div>
        </Popover>
        <Button id="m-pal" onClick={()=>setPal(true)}>Palette over</Button>
        <Button id="m-toast" onClick={()=>toast({title:"in modal",duration:0})}>Toast</Button>
      </ModalBody>
      <ModalFooter><Button id="m-close" onClick={()=>setModal(false)}>Close</Button></ModalFooter>
    </Modal>
    <ConfirmDialog open={confirm} onClose={()=>setConfirm(false)} onConfirm={()=>setConfirm(false)} title="Sure?"/>
    <CommandPalette open={pal} onClose={()=>setPal(false)} items={items} onChoose={()=>setPal(false)}/>
    <pre id="log">{log.join(",")}</pre>
  </div>;
}

function Radix() {
  const [o,setO]=useState(false), [pal,setPal]=useState(false);
  const [pop,setPop]=useState(false); const a=useRef(null);
  return <div>
    <header style={{position:"sticky",top:0,zIndex:1000,background:"#ddd"}}>head</header>
    <RD.Root open={o} onOpenChange={setO}>
      <RD.Trigger id="r-trig">Radix</RD.Trigger>
      <RD.Portal><RD.Overlay style={{position:"fixed",inset:0,background:"#0005",zIndex:2000}}/>
        <RD.Content style={{position:"fixed",top:100,left:100,background:"#fff",padding:20,zIndex:2001}}>
          <RD.Title>Radix</RD.Title><RD.Description>d</RD.Description>
          <Menu trigger={<Button id="r-menu">umriss menu</Button>}><MenuItem id="r-mi" onSelect={()=>window.__ok=1}>Item</MenuItem></Menu>
          <Button id="r-pop" ref={a} onClick={()=>setPop(p=>!p)}>pop</Button>
          <Popover open={pop} onOpenChange={setPop} anchorRef={a} role="dialog" aria-label="p"><div id="r-pop-panel" style={{padding:8}}>panel</div></Popover>
          <Button id="r-pal" onClick={()=>setPal(true)}>palette</Button>
          <Modal open={pal} onClose={()=>setPal(false)}><ModalHeader title="umriss in radix"/><ModalBody><Button id="r-m-btn">x</Button></ModalBody></Modal>
          <RD.Close id="r-close">close</RD.Close>
        </RD.Content></RD.Portal>
    </RD.Root>
  </div>;
}

function Leak() { // mount/unmount counts
  const [n,setN]=useState(0);
  return <div><Button id="cycle" onClick={()=>setN(n+1)}>c</Button>{n%2===1 && <Everything/>}</div>;
}
function Everything(){
  const [o,setO]=useState(true); const a=useRef(null);
  return <>
    <Modal open={o} onClose={()=>setO(false)}><ModalHeader title="m"/><ModalBody><Menu trigger={<Button>m</Button>}><MenuItem>i</MenuItem></Menu></ModalBody></Modal>
    <Button ref={a}>anchor</Button><Popover open={o} onOpenChange={setO} anchorRef={a}><div>p</div></Popover>
    <Tooltip content="t"><Button>tt</Button></Tooltip><Drawer open={o} onClose={()=>setO(false)}><ModalHeader title="d"/></Drawer>
    <CommandPalette open={o} onClose={()=>setO(false)} items={items} onChoose={()=>{}}/>
    <ConfirmDialog open={o} onClose={()=>setO(false)} onConfirm={()=>{}} title="c"/>
    <DatePicker value={null} onChange={()=>{}}/>
  </>;
}

function Containers() {
  const [o,setO]=useState({}); const refs={a:useRef(null),b:useRef(null),c:useRef(null),d:useRef(null)};
  const box=(k,style,children)=><div id={"box-"+k} style={{border:"1px solid red",margin:10,...style}}>{children}</div>;
  const pop=(k)=><><Button id={"t-"+k} ref={refs[k]} onClick={()=>setO(s=>({...s,[k]:!s[k]}))}>pop {k}</Button>
    <Popover open={!!o[k]} onOpenChange={v=>setO(s=>({...s,[k]:v}))} anchorRef={refs[k]} role="dialog" aria-label={k}><div id={"p-"+k} style={{padding:10}}>panel {k}<Input/></div></Popover></>;
  return <div style={{height:3000}}>
    {box("a",{overflow:"hidden",height:40},pop("a"))}
    {box("b",{transform:"translateZ(0)",overflow:"hidden",height:40},pop("b"))}
    {box("c",{overflow:"auto",height:80},<div style={{height:400}}>{pop("c")}</div>)}
    {box("d",{position:"sticky",top:0,zIndex:5000,background:"#fff"},pop("d"))}
  </div>;
}

function Lifecycle() {
  const [show,setShow]=useState(false), [act,setAct]=useState("visible");
  return <div><Button id="tog" onClick={()=>setShow(s=>!s)}>t</Button><Button id="act" onClick={()=>setAct(a=>a==="visible"?"hidden":"visible")}>a</Button>
    <Activity mode={act}><Nested/></Activity></div>;
}
function Nested(){ const [o,setO]=useState(false); const a=useRef(null); const [m,setM]=useState(false);
  return <><Button id="po" ref={a} onClick={()=>setO(true)}>pop</Button><Popover open={o} onOpenChange={setO} anchorRef={a}><div id="act-panel" style={{padding:8}}>x</div></Popover>
  <Button id="mo" onClick={()=>setM(true)}>modal</Button><Modal open={m} onClose={()=>setM(false)}><ModalHeader title="m"/><ModalBody><Input autoFocus id="act-in"/></ModalBody></Modal></>; }


function Odd() {
  const [route,setRoute]=useState("a"), [d,setD]=useState(false), [m,setM]=useState(false), [pop,setPop]=useState(false), [show,setShow]=useState(true), [rm,setRm]=useState(false);
  const a=useRef(null);
  return <div>
    <Button id="go-b" onClick={()=>setRoute(r=>r==="a"?"b":"a")}>route</Button>
    <Button id="open-d" onClick={()=>setD(true)}>drawer</Button>
    <Button id="open-m" onClick={()=>setM(true)}>modal</Button>
    <Button id="close-d" onClick={()=>setD(false)}>closeD</Button>
    <Button id="toggle-m" onClick={()=>setM(v=>!v)}>toggleM</Button>
    <Button id="rm-trig" onClick={()=>setShow(false)}>remove trigger</Button>
    {route==="a"? <div id="route-a">
      {show && <Button id="anch" ref={a} onClick={()=>setPop(true)}>anchor</Button>}
      <Popover open={pop} onOpenChange={setPop} anchorRef={a}><div id="op" style={{padding:8}}><Input id="op-in"/></div></Popover>
      <Drawer open={d} onClose={()=>setD(false)}><ModalHeader title="Drawer"/><ModalBody>
        <Button id="nested-open" onClick={()=>setM(true)}>open nested</Button>
        <Modal open={m} onClose={()=>setM(false)}><ModalHeader title="Nested"/><ModalBody><Input id="n-in" autoFocus/></ModalBody></Modal></ModalBody></Drawer>
      <Modal open={rm} onClose={()=>setRm(false)}><ModalHeader title="Top"/><ModalBody><Input id="top-in"/></ModalBody></Modal>
      <Button id="open-top" onClick={()=>setRm(true)}>top modal</Button>
      </div> : <div id="route-b">page b <Button id="b-btn">b</Button></div>}
  </div>;
}


function Nest2(){
  const [m,setM]=useState(false),[c,setC]=useState(false),[p,setP]=useState(false),[l,setL]=useState([]);
  return <div><Button id="o" onClick={()=>setM(true)}>open</Button><pre id="l">{l.join(",")}</pre>
   <Modal open={m} onClose={()=>{setL(x=>[...x,"outer-close"]);setM(false)}}><ModalHeader title="Outer"/><ModalBody>
     <Button id="oc" onClick={()=>setC(true)}>confirm</Button><Button id="op" onClick={()=>setP(true)}>palette</Button>
     <ConfirmDialog open={c} onClose={()=>{setL(x=>[...x,"confirm-close"]);setC(false)}} onConfirm={()=>{setL(x=>[...x,"confirm-ok"]);setC(false)}} title="Sure?"/>
     <CommandPalette open={p} onClose={()=>{setL(x=>[...x,"pal-close"]);setP(false)}} items={items} onChoose={()=>{setL(x=>[...x,"pal-choose"]);setP(false)}}/>
   </ModalBody></Modal></div>;
}


let cache=new Map();
function useSlow(k){ const c=cache.get(k); if(c?.done) return; if(c) throw c.p; const e={}; e.p=new Promise(r=>setTimeout(()=>{e.done=true;r()},1200)); cache.set(k,e); throw e.p; }
function Slow({k}){ useSlow(k); return <span id="slow">loaded {k}</span>; }
function Susp(){
  const [k,setK]=useState(0),[m,setM]=useState(true);
  const [pend,start]=React.useTransition();
  return <div><Button id="sw" onClick={()=>setK(k+1)}>suspend</Button><Button id="sw-t" onClick={()=>start(()=>setK(k+1))}>suspend in transition</Button><span id="fb-flag"/>
   <Suspense fallback={<div id="fallback"><Button id="fb-btn">fallback btn</Button></div>}>
     <Slow k={k}/>
     <Modal open={m} onClose={()=>setM(false)}><ModalHeader title="susp modal"/><ModalBody><Input autoFocus id="s-in"/></ModalBody></Modal>
   </Suspense></div>;
}


import { useTable, Toolbar, Search, ColumnMenu, Export, Pagination } from "@umriss-ui/table";
const ROWS=Array.from({length:40},(_,i)=>({id:"R-"+(1000+i),customer:["Brandt Metalworks International GmbH & Co. KG","Keller","Northworks Ltd"][i%3],qty:i*7%50,note:"A very long note that will be cut by the column width and needs a tip "+i}));
function Tbl(){
  const [open,setOpen]=useState(false),[arch,setArch]=useState(null),[modal,setModal]=useState(null);
  const t=useTable(ROWS,{rowKey:r=>r.id,pageSize:10});
  const {Table,Column,RowActions,Action}=t;
  const table=<Table aria-label="Orders" style={{maxWidth:700}}>
      <Toolbar><Search/><ColumnMenu/><Export/></Toolbar>
      <Column value="id" label="Order" rowHeader/>
      <Column value="customer" label="Customer" filter="list" width={110}/>
      <Column value="qty" label="Qty" filter="range"/>
      <Column value="note" label="Note" filter="text" width={120}/>
      <RowActions><Action onSelect={(r)=>setModal(r)}>Details</Action><Action tone="danger" onSelect={(r)=>setArch(r)}>Archive</Action></RowActions>
      <Pagination/>
    </Table>;
  return <div><Button id="open" onClick={()=>setOpen(true)}>open drawer</Button>
   <div id="inline" style={{height:400,overflow:"auto",transform:"translateZ(0)"}}>{!open && table}</div>
   <Drawer open={open} onClose={()=>setOpen(false)}><ModalHeader title="Orders"/><ModalBody>{open && table}</ModalBody></Drawer>
   <ConfirmDialog open={!!arch} onClose={()=>setArch(null)} onConfirm={()=>setArch(null)} title={"Archive "+arch?.id+"?"}/>
   <Modal open={!!modal} onClose={()=>setModal(null)}><ModalHeader title={"Details "+modal?.id}/><ModalBody><Input id="det" autoFocus/></ModalBody></Modal>
  </div>;
}


function Foc(){
  const [a,setA]=useState(true),[b,setB]=useState(false),[c,setC]=useState(false),[txt,setTxt]=useState(""),[ld,setLd]=useState(false),[d,setD]=useState(false);
  return <div><Button id="ob" onClick={()=>setB(true)}>footer-autofocus</Button><Button id="oc" onClick={()=>setC(true)}>confirm</Button><Button id="od" onClick={()=>setD(true)}>nofocusable</Button>
   <Modal open={a} onClose={()=>setA(false)}><ModalHeader title="Initially open"/><ModalBody><Input id="a-in" autoFocus value={txt} onChange={e=>setTxt(e.target.value)}/></ModalBody></Modal>
   <Modal open={b} onClose={()=>setB(false)}><ModalHeader title="Footer"/><ModalBody><Input id="b-in"/></ModalBody><ModalFooter><Button id="b-ok" autoFocus onClick={()=>setB(false)}>OK</Button></ModalFooter></Modal>
   <ConfirmDialog open={c} loading={ld} onClose={()=>setC(false)} onConfirm={()=>{setLd(true);setTimeout(()=>{setLd(false);setC(false)},800)}} title="Sure?"/>
   <Modal open={d} onClose={()=>setD(false)}><ModalHeader title="Text only" hideClose/><ModalBody>Nothing to focus</ModalBody></Modal>
  </div>;
}


function Cond(){ const [o,setO]=useState(false);
  return <div><Button id="t" onClick={()=>setO(true)}>open</Button>{o && <Modal open onClose={()=>setO(false)}><ModalHeader title="Cond"/><ModalBody><Input id="c-in" autoFocus/></ModalBody></Modal>}</div>; }

const views={cond:Cond,foc:Foc,tbl:Tbl,susp:Susp,nest2:Nest2,odd:Odd,nest:Nest,radix:Radix,leak:Leak,containers:Containers,life:Lifecycle};
const V=views[S];
const app=<UmrissProvider><ToastProvider><V/></ToastProvider></UmrissProvider>;
createRoot(document.getElementById("root")).render(strict?<StrictMode>{app}</StrictMode>:app);
