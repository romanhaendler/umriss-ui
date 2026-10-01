import { Gauge } from "../../../src";

const READINGS = [3, 1, 4];

export const title = "Show several readings";

export default function Readings() {
  return <>{READINGS.map((value) => <Gauge key={value} value={value} />)}</>;
}
