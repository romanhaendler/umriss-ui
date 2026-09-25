import { useState } from "react";
import { Checkbox, Stack } from "../../../src";

export const title = "Select all with a mixed state";
export const lead = "Derive `indeterminate` from the children when some are checked; a click on the parent checks all or none.";

const TEAM = ["Maya Lindgren", "Arjun Mehta", "Chloe Durand", "Noah Fischer", "Eva Novak"];

export default function SelectAllWithAMixedState() {
  const [notified, setNotified] = useState([true, false, true, false, false]);
  const all = notified.every(Boolean);
  const none = notified.every((on) => !on);

  return (
    <Stack gap={3} align="flex-start">
      <Checkbox
        label="Tell team Web about my leave"
        checked={all}
        indeterminate={!all && !none}
        onChange={(event) => setNotified(notified.map(() => event.target.checked))}
      />
      <Stack gap={2} style={{ paddingLeft: "var(--u-space-6)" }}>
        {TEAM.map((name, i) => (
          <Checkbox
            key={name}
            label={name}
            checked={notified[i]}
            onChange={(event) =>
              setNotified((previous) => previous.map((on, j) => (i === j ? event.target.checked : on)))
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}
