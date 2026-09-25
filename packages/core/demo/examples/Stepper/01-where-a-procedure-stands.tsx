import { Stepper } from "../../../src";

export const title = "Where a procedure stands";

/* The first step: the steps in order and the index of the one being worked
   on. The ones before it are done - a tick - and the ones after it upcoming -
   their number. A screen reader hears the same as words: "Drain, done",
   "Clean, current step", "Rinse, upcoming". */
export default function WhereAProcedureStands() {
  return (
    <Stepper
      aria-label="Cleaning in place"
      steps={[{ label: "Drain" }, { label: "Clean" }, { label: "Rinse" }, { label: "Release" }]}
      current={1}
      style={{ maxWidth: 560 }}
    />
  );
}
