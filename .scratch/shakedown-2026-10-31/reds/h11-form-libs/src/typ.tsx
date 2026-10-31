import { Combobox, MultiSelect, DatePicker, DateRangePicker, DateTimePicker, NumberInput, Input, Select, Textarea, Checkbox, Switch, Slider, FileInput, RadioGroup, SegmentedControl } from "@umriss-ui/core";
const o = [{ value: "a", label: "A" }];
export const x = <>
  <Combobox name="a" options={o} value={null} onChange={() => {}} />
  <MultiSelect name="a" options={o} value={[]} onChange={() => {}} />
  <DatePicker name="a" value={null} onChange={() => {}} />
  <DateRangePicker name="a" value={null} onChange={() => {}} />
  <DateTimePicker name="a" value={null} onChange={() => {}} />
  <NumberInput name="a" value={null} onChange={() => {}} />
  <Combobox onBlur={() => {}} options={o} value={null} onChange={() => {}} />
  <DatePicker onBlur={() => {}} value={null} onChange={() => {}} />
  <Combobox value={undefined} options={o} onChange={() => {}} />
  <RadioGroup name="a" options={o} value={undefined} />
  <Checkbox invalid />
  <Slider name="a" />
  <FileInput name="a" />
  <Switch name="a" />
</>;
