import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import "@umriss-ui/core/styles.css";
import {UmrissProvider, FormField, Input, NumberInput, Select, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, FileInput, DatePicker, DateRangePicker, Textarea} from "@umriss-ui/core";
const opts=[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}];
(window as any).log=[];
function U(){
  const [files,setFiles]=useState<File[]>([]);
  const [rng,setRng]=useState<any>({from:new Date(2025,0,10),to:new Date(2025,0,20)});
  return <form id="u" onSubmit={e=>{e.preventDefault();(window as any).fd=[...new FormData(e.currentTarget).entries()].map(([k,v])=>[k,v instanceof File?"File:"+v.name+":"+v.size:v])}}>
    <RadioGroup name="rg" options={opts} defaultValue="b" onChange={v=>(window as any).log.push(["rg",v])}/>
    <SegmentedControl name="sc" options={opts} defaultValue="b" onChange={v=>(window as any).log.push(["sc",v])}/>
    <Slider name="sl" defaultValue={40} onChange={v=>(window as any).log.push(["sl",typeof v+":"+v])}/>
    <Checkbox name="chk" label="c" onChange={e=>(window as any).log.push(["chk",e.target.checked])}/>
    <Checkbox name="ind" label="i" indeterminate/>
    <Switch name="sw" label="s"/>
    <FormField label="File"><FileInput name="file" multiple value={files} onChange={f=>{(window as any).log.push(["file",f.map(x=>x.name)]);setFiles(f)}}/></FormField>
    <FormField label="Req" error="Required"><Input name="req" required invalid/></FormField>
    <FormField label="Sel"><Select name="sel" required defaultValue=""><option value="" disabled>Pick</option><option value="a">A</option></Select></FormField>
    <FormField label="Rng"><DateRangePicker name="rng" value={rng} onChange={setRng} min={new Date(2025,0,5)} max={new Date(2025,0,25)} clearable/></FormField>
    <button id="sub">sub</button><button type="reset" id="rst">rst</button>
  </form>;
}
createRoot(document.getElementById("root")!).render(<UmrissProvider><U/></UmrissProvider>);
