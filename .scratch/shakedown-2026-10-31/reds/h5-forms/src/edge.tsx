import React, {useState} from "react";
import {createRoot} from "react-dom/client";
import "@umriss-ui/core/styles.css";
import {UmrissProvider, NumberInput, Combobox, MultiSelect, RadioGroup, Slider, DatePicker, SegmentedControl, Select, Input} from "@umriss-ui/core";
const opts=[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}];
function E(){
  const [late,setLate]=useState<any>(undefined);
  (window as any).setLate=setLate;
  return <div>
    <NumberInput name="nan" value={NaN} onChange={()=>{}}/>
    <NumberInput name="und" value={undefined as any} onChange={()=>{}}/>
    <NumberInput name="inf" value={Infinity} onChange={()=>{}}/>
    <NumberInput name="big" value={1e21} onChange={()=>{}}/>
    <NumberInput name="small" value={0.1+0.2} onChange={()=>{}} />
    <NumberInput name="neg0" value={-0} onChange={()=>{}}/>
    <Combobox name="cbunk" options={opts} value={"zz"} onChange={()=>{}}/>
    <MultiSelect name="msunk" options={opts} value={["a","zz"]} onChange={()=>{}}/>
    <MultiSelect name="msund" options={opts} value={undefined as any} onChange={()=>{}}/>
    <RadioGroup name="rgl" options={opts} value={late} onChange={setLate}/>
    <SegmentedControl name="scl" options={opts} value={late} onChange={setLate}/>
    <Slider name="slout" value={500} min={0} max={100} onChange={()=>{}}/>
    <Input name="ctl" value={undefined as any} onChange={()=>{}}/>
  </div>;
}
createRoot(document.getElementById("root")!).render(<UmrissProvider><E/></UmrissProvider>);
