import { useState } from "react";
import { FormField, Input, Textarea, NumberInput, Select, Combobox, MultiSelect, Checkbox, RadioGroup, Switch, Slider, SegmentedControl, DatePicker, DateRangePicker, DateTimePicker, FileInput, Button } from "@umriss-ui/core";
import { opts, log } from "./shared";
import { ConformGlue } from "./conformglue";

const rec = (fd: FormData) => ((window as any).__fd = [...fd.entries()].map(([k, v]) => [k, v instanceof File ? `File:${v.name}:${v.size}` : v]));
const F = (n: string, c: any) => <FormField label={n} hint={"hint " + n} data-field={n}>{c}</FormField>;
function Native() {
  const [qty, setQty] = useState<number | null>(5);
  const [city, setCity] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [date, setDate] = useState<any>(null), [range, setRange] = useState<any>(null), [when, setWhen] = useState<any>(null);
  const [files, setFiles] = useState<File[]>([]);
  const nm = (n: string) => ({ name: n }) as any;
  return (
    <form action={rec} style={{ display: "grid", gap: 12, maxWidth: 520, padding: 16 }}>
      {F("text", <Input {...nm("text")} defaultValue="hello" />)}
      {F("notes", <Textarea {...nm("notes")} defaultValue="n" />)}
      {F("qty", <NumberInput {...nm("qty")} value={qty} onChange={setQty} />)}
      {F("color", <Select {...nm("color")} defaultValue="b"><option value="a">A</option><option value="b">B</option></Select>)}
      {F("city", <Combobox {...nm("city")} options={opts} value={city} onChange={setCity} />)}
      {F("tags", <MultiSelect {...nm("tags")} options={opts} value={tags} onChange={setTags} />)}
      {F("agree", <Checkbox {...nm("agree")} label="I agree" defaultChecked />)}
      {F("plan", <RadioGroup {...nm("plan")} options={opts} defaultValue="c" />)}
      {F("notify", <Switch {...nm("notify")} label="n" defaultChecked />)}
      {F("volume", <Slider {...nm("volume")} defaultValue={60} />)}
      {F("view", <SegmentedControl {...nm("view")} options={[{ value: "a", label: "A" }, { value: "b", label: "B" }]} defaultValue="b" />)}
      {F("date", <DatePicker {...nm("date")} value={date} onChange={setDate} />)}
      {F("range", <DateRangePicker {...nm("range")} value={range} onChange={setRange} />)}
      {F("when", <DateTimePicker {...nm("when")} value={when} onChange={setWhen} />)}
      {F("files", <FileInput {...nm("files")} value={files} onChange={setFiles} />)}
      <Button type="submit">Submit</Button><Button type="reset">ResetNative</Button>
    </form>
  );
}
export function ConformPage() { return location.hash.includes("native") ? <Native /> : <ConformGlue />; }
