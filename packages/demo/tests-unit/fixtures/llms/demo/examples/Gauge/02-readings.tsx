import { Gauge } from "../../../src";
import { READINGS } from "../../data";

export const title = "Show several readings";

export const shows = ["../../data.ts"];

export default function Readings() {
  return <>{READINGS.map((value) => <Gauge key={value} value={value} />)}</>;
}
