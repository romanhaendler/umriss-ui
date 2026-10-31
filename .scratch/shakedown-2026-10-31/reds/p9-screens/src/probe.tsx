import { Component, type ReactNode } from "react";
import { Combobox, DatePicker, NumberInput, MultiSelect, Select, RadioGroup, Input, Textarea, Slider, Checkbox, Switch, DateRangePicker } from "@umriss-ui/core";
class EB extends Component<{ n: string; children: ReactNode }, { e?: string }> {
  state: { e?: string } = {};
  static getDerivedStateFromError(e: Error) { return { e: e.message }; }
  render() { return <div data-probe={this.props.n} data-err={this.state.e ?? ""}>{this.state.e ? `${this.props.n}: CRASH ${this.state.e}` : this.props.children}</div>; }
}
const u: any = undefined;
export function Probe() {
  const o = [{ value: "a", label: "A" }];
  return <div>
    <EB n="Combobox"><Combobox options={o} value={u} onChange={() => {}} /></EB>
    <EB n="DatePicker"><DatePicker value={u} onChange={() => {}} /></EB>
    <EB n="NumberInput"><NumberInput value={u} onChange={() => {}} /></EB>
    <EB n="MultiSelect"><MultiSelect options={o} value={u} onChange={() => {}} /></EB>
    <EB n="Select"><Select value={u} onChange={() => {}}><option>x</option></Select></EB>
    <EB n="RadioGroup"><RadioGroup options={o} value={u} onChange={() => {}} /></EB>
    <EB n="Input"><Input value={u} onChange={() => {}} /></EB>
    <EB n="Textarea"><Textarea value={u} onChange={() => {}} /></EB>
    <EB n="Slider"><Slider value={u} onChange={() => {}} /></EB>
    <EB n="Checkbox"><Checkbox checked={u} onChange={() => {}} /></EB>
    <EB n="Switch"><Switch checked={u} onChange={() => {}} /></EB>
    <EB n="DateRangePicker"><DateRangePicker value={u} onChange={() => {}} /></EB>
  </div>;
}
