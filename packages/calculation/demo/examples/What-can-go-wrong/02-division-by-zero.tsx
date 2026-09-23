import { Calculation, Given, Quotient, Sum } from "../../../src";

export const title = "A division by zero";

/* A machine that did not run has no output per hour - not zero, and not
   infinity. The quotient is absent with its own reason, and so is everything
   that depends on it. */
export default function DivisionByZero() {
  return (
    <Calculation aria-label="Output per hour, cell 7">
      <Sum label="Output per hour, cell 7" unit="pcs/h">
        <Quotient label="Robot A" unit="pcs/h">
          <Given label="Parts, robot A" value={412} unit="pcs" />
          <Given label="Hours run, robot A" value={7.5} unit="h" />
        </Quotient>
        <Quotient label="Robot B" unit="pcs/h">
          <Given label="Parts, robot B" value={0} unit="pcs" />
          <Given label="Hours run, robot B" value={0} unit="h" />
        </Quotient>
      </Sum>
    </Calculation>
  );
}
