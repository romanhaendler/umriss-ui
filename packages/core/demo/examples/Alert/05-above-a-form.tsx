import { useState } from "react";
import { Alert, Button, FormField, Input, Stack } from "../../../src";

export const title = "Sum up a form's errors";
export const lead = "When a save fails, one `danger` alert above the form names every field that stops it and leads to the first.";

export default function AboveAForm() {
  const [tried, setTried] = useState(false);
  const [owner, setOwner] = useState("");
  const [budget, setBudget] = useState("");
  const missing = [owner === "" ? "Owner" : null, budget === "" ? "Monthly budget" : null].filter((name) => name !== null);
  const showErrors = tried && missing.length > 0;

  return (
    <Stack gap={4} style={{ maxWidth: 440 }}>
      {showErrors && (
        <Alert
          tone="danger"
          title="The cost centre was not saved"
          actions={
            <Button size="sm" onClick={() => document.getElementById(owner === "" ? "cc-owner" : "cc-budget")?.focus()}>
              Go to the first field
            </Button>
          }
        >
          {missing.join(" and ")} {missing.length === 1 ? "is" : "are"} still empty.
        </Alert>
      )}
      <FormField label="Name">
        <Input defaultValue="Customer service" />
      </FormField>
      <FormField label="Owner" required fieldId="cc-owner" error={showErrors && owner === "" ? "Name the person responsible." : undefined}>
        <Input value={owner} onChange={(event) => setOwner(event.target.value)} />
      </FormField>
      <FormField label="Monthly budget (€)" required fieldId="cc-budget" error={showErrors && budget === "" ? "Enter an amount." : undefined}>
        <Input numeric value={budget} onChange={(event) => setBudget(event.target.value)} />
      </FormField>
      <Button variant="primary" onClick={() => setTried(true)} style={{ alignSelf: "flex-start" }}>
        Save the cost centre
      </Button>
    </Stack>
  );
}
