import { Dial, type DialProps } from "../../../src";

export const title = "Passed through";

/* A spread whose type carries `size`, and one whose type is a loose object
   that merely happens to hold a `label`. */
function Sized(props: Pick<DialProps, "size">) {
  return <Dial value={1} {...props} />;
}

const loose = { label: "Pressure" };

export default function Spread() {
  return (
    <>
      <Sized size="sm" />
      <Dial value={2} {...loose} />
    </>
  );
}
