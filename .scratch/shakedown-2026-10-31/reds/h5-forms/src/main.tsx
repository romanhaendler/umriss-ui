import React, {useState, useRef} from "react";
import {createRoot} from "react-dom/client";
import "@umriss-ui/core/styles.css";
import {UmrissProvider, LanguageProvider, formatsFor, FormField, Input, Textarea, NumberInput, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, DatePicker, DateRangePicker, DateTimePicker, DateTimeRangePicker, FileInput, Button} from "@umriss-ui/core";
import {useForm, Controller} from "react-hook-form";

const q = new URLSearchParams(location.search);
const opts = [{value:"a",label:"Alpha"},{value:"b",label:"Beta"},{value:"c",label:"Gamma"}];
const big = Array.from({length:10000},(_,i)=>({value:"v"+i,label:"Option "+i}));
(window as any).log = [] as any[];
const L=(k:string,v:any)=>{(window as any).log.push([k,v])};

function Native(){
  const [n,setN]=useState<number|null>(5);
  const [cb,setCb]=useState<string|null>("b");
  const [ms,setMs]=useState<string[]>(["a"]);
  const [d,setD]=useState<Date|null>(new Date(2024,0,15));
  const [r,setR]=useState<any>(null);
  const [dt,setDt]=useState<Date|null>(new Date(2024,0,15,10,30));
  const [dtr,setDtr]=useState<any>(null);
  const [rg,setRg]=useState<string|null>("a");
  const [sc,setSc]=useState<string|null>("a");
  const [sl,setSl]=useState(30);
  const [files,setFiles]=useState<File[]>([]);
  const [out,setOut]=useState("");
  const [many,setMany]=useState<string[]>([]);
  const ref=useRef<HTMLFormElement>(null);
  (window as any).set={d:setD,dt:setDt,r:setR,dtr:setDtr};
  return <form ref={ref} id="f" onSubmit={e=>{e.preventDefault();const fd=new FormData(e.currentTarget);setOut(JSON.stringify([...fd.entries()].map(([k,v])=>[k,v instanceof File?"File:"+v.name:v])))}}>
    <FormField label="Input"><Input name="input" defaultValue="hi" onChange={e=>L("input",e.target.value)}/></FormField>
    <FormField label="Textarea"><Textarea name="ta" defaultValue="t" onChange={e=>L("ta",e.target.value)}/></FormField>
    <FormField label="Number"><NumberInput name="num" value={n} onChange={v=>{L("num",v);setN(v)}} min={0} max={100} step={0.5} decimals={2}/></FormField>
    <FormField label="Number free"><NumberInput name="numfree" id="numfree" value={n} onChange={v=>{L("numfree",v);setN(v)}}/></FormField>
    <FormField label="Select"><Select name="sel" defaultValue="b" onChange={e=>L("sel",e.target.value)}>{opts.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</Select></FormField>
    <FormField label="Combobox"><Combobox name="cb" options={opts} value={cb} onChange={v=>{L("cb",v);setCb(v)}} clearable onSearch={t=>L("cbsearch",t)}/></FormField>
    <FormField label="MultiSelect"><MultiSelect name="ms" options={opts} value={ms} onChange={v=>{L("ms",v);setMs(v)}}/></FormField>
    <FormField label="Many"><MultiSelect name="many" options={big} value={many} onChange={v=>{L("many",v.length);setMany(v)}}/></FormField>
    <Checkbox name="chk" value="yes" defaultChecked label="Check" onChange={e=>L("chk",e.target.checked)}/>
    <RadioGroup name="rg" options={opts} value={rg} onChange={v=>{L("rg",v);setRg(v)}}/>
    <Switch name="sw" defaultChecked label="Sw" onChange={e=>L("sw",e.target.checked)}/>
    <Slider name="sl" value={sl} onChange={v=>{L("sl",v);setSl(v)}} />
    <SegmentedControl name="sc" options={opts} value={sc} onChange={v=>{L("sc",v);setSc(v)}}/>
    <FormField label="Date"><DatePicker name="d" value={d} onChange={v=>{L("d",v);setD(v)}} clearable/></FormField>
    <FormField label="Range"><DateRangePicker name="r" value={r} onChange={v=>{L("r",v);setR(v)}} clearable/></FormField>
    <FormField label="DT"><DateTimePicker name="dt" value={dt} onChange={v=>{L("dt",v);setDt(v)}} clearable/></FormField>
    <FormField label="DTR"><DateTimeRangePicker name="dtr" value={dtr} onChange={v=>{L("dtr",v);setDtr(v)}} clearable/></FormField>
    <FormField label="File"><FileInput name="file" value={files} onChange={f=>{L("file",f.length);setFiles(f)}}/></FormField>
    <Button type="submit">Submit</Button><Button type="reset" id="reset">Reset</Button>
    <button type="button" id="parent" onClick={()=>{setN(77);setCb("c");setMs(["b","c"]);setD(new Date(2025,1,28))}}>parent set</button>
    <button type="button" id="parentnull" onClick={()=>{setN(null);setCb(null);setMs([]);setD(null)}}>parent null</button>
    <pre id="out">{out}</pre>
    <pre id="state">{JSON.stringify({n,cb,ms,d,rg,sc,sl})}</pre>
  </form>;
}
function App(){
  const lang=q.get("lang")||"en";
  return <UmrissProvider><LanguageProvider formats={q.get("tz")?{...formatsFor(lang),timeZone:q.get("tz")!}:formatsFor(lang)}><Native/></LanguageProvider></UmrissProvider>;
}
createRoot(document.getElementById("root")!).render(<App/>);
