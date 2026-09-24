import { Gauge } from "../../../src";
import { READINGS } from "../../data";

export const title = "The whole plant";

export const shows = ["../../data.ts"];

export default function Plant() {
  return <>{READINGS.map((value) => <Gauge key={value} value={value} />)}</>;
}
