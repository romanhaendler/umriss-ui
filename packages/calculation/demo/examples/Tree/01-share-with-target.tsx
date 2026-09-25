import { Calculation, Given, Quotient } from "../../../src";

export const title = "Show a share against a target";
export const lead = "`format=\"percent\"` shows a ratio as per cent while it stays a ratio in every operation; a `target` is missed, never violated.";

export default function ShareWithTarget() {
  return (
    <Calculation aria-label="Utilisation of the Web team, week 12">
      <Quotient label="Utilisation, Web team" format="percent" target={0.85}>
        <Given label="Hours booked on projects" value={141} unit="h" />
        <Given label="Hours the team can be planned for" value={176} unit="h" />
      </Quotient>
    </Calculation>
  );
}
