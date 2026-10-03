import { Dial, Slider } from "../../../src";

export const title = "In steps";

/* A slider without a `value`, beside a dial with one: the two `value`s are
   two props. */
export default function Steps() {
  return (
    <>
      <Slider step={5} />
      <Dial value={4} />
    </>
  );
}
