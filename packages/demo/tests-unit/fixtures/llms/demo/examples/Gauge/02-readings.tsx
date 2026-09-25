import { Gauge } from "../../../src";
import { READINGS } from "@umriss-ui/demo/worlds/operations";

export const title = "Show several readings";

export default function Readings() {
  return <>{READINGS.map((value) => <Gauge key={value} value={value} />)}</>;
}
