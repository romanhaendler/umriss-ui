import React, {useActionState, useRef} from "react";
import {createRoot} from "react-dom/client";
import "@umriss-ui/core/styles.css";
import {UmrissProvider, FormField, Input, NumberInput, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, DatePicker, DateRangePicker, DateTimePicker, Textarea, Button} from "@umriss-ui/core";
import {useForm, Controller} from "react-hook-form";
const opts=[{value:"a",label:"Alpha"},{value:"b",label:"Beta"}];
type V={name:string;note:string;qty:number|null;sel:string;cb:string|null;ms:string[];chk:boolean;sw:boolean;rg:string|null;sl:number;sc:string|null;d:Date|null;r:any;dt:Date|null};
const defaults:V={name:"x",note:"n",qty:3,sel:"b",cb:"a",ms:["a"],chk:true,sw:true,rg:"a",sl:20,sc:"b",d:new Date(2024,5,1),r:null,dt:null};
(window as any).submitted=[] as any[];
function Rhf(){
  const f=useForm<V>({defaultValues:defaults,mode:"onChange"});
  (window as any).f=f;
  const {register,control,handleSubmit,setFocus,reset,formState:{errors,isDirty,dirtyFields}}=f;
  return <form onSubmit={handleSubmit(v=>{(window as any).submitted.push(JSON.parse(JSON.stringify(v)))})}>
    <FormField label="Name" error={errors.name?.message}><Input {...register("name",{required:"need name"})}/></FormField>
    <FormField label="Note"><Textarea {...register("note")}/></FormField>
    <FormField label="Qty" error={errors.qty?.message}><Controller control={control} name="qty" rules={{required:"qty req",min:{value:1,message:"min 1"}}} render={({field})=><NumberInput {...field} value={field.value} />}/></FormField>
    <FormField label="Sel"><Select {...register("sel")}><option value="a">A</option><option value="b">B</option></Select></FormField>
    <FormField label="Cb" error={errors.cb?.message}><Controller control={control} name="cb" rules={{required:"cb req"}} render={({field})=><Combobox {...field} options={opts} clearable/>}/></FormField>
    <FormField label="Ms"><Controller control={control} name="ms" render={({field})=><MultiSelect {...field} options={opts}/>}/></FormField>
    <Checkbox label="chk" {...register("chk")}/>
    <Switch label="sw" {...register("sw")}/>
    <Controller control={control} name="rg" render={({field})=><RadioGroup {...field} options={opts}/>}/>
    <Controller control={control} name="sl" render={({field})=><Slider {...field}/>}/>
    <Controller control={control} name="sc" render={({field})=><SegmentedControl {...field} options={opts}/>}/>
    <FormField label="D" error={errors.d?.message}><Controller control={control} name="d" rules={{required:"d req"}} render={({field})=><DatePicker {...field} clearable/>}/></FormField>
    <FormField label="R"><Controller control={control} name="r" render={({field})=><DateRangePicker {...field}/>}/></FormField>
    <FormField label="DT"><Controller control={control} name="dt" render={({field})=><DateTimePicker {...field}/>}/></FormField>
    <button type="submit" id="sub">sub</button><button type="button" id="rst" onClick={()=>reset()}>rst</button>
    <pre id="dirty">{JSON.stringify({isDirty,dirtyFields})}</pre>
  </form>;
}
function Act(){
  const [s,act]=useActionState(async(_p:any,fd:FormData)=>JSON.stringify([...fd.keys()]),"");
  return <form action={act} id="act"><Input name="a" defaultValue="1"/><NumberInput name="n" value={1} onChange={()=>{}}/><Combobox name="c" options={opts} value="a" onChange={()=>{}}/><button id="asub">go</button><pre id="actout">{s}</pre></form>;
}
createRoot(document.getElementById("root")!).render(<UmrissProvider><Rhf/><Act/></UmrissProvider>);
