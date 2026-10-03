import { Dial, useMeter } from "../../../src";

export const title = "Readings";

/* An object literal under its contextual type, and a property access on the
   handle the hook returns. */
export default function Readings() {
  const meter = useMeter({ unit: "bar" });
  return <Dial value={meter.latest} />;
}
