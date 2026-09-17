import { useState } from "react";
import { FormField, Grid, Input } from "../../../src";

export const title = "The clear button";

/* The cross appears only when there is content and needs a controlled field:
   `value` and `onClear` belong together. What "empty" means is the caller's
   decision - here the empty string, elsewhere perhaps `null`. */
export default function Clearing() {
  const [email, setEmail] = useState("name@example.com");
  const [reference, setReference] = useState("");

  return (
    <Grid minItemWidth="240px" gap={4}>
      <FormField label="E-mail" hint="With a clear button; it appears when there is content.">
        <Input
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          clearable
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onClear={() => setEmail("")}
        />
      </FormField>
      <FormField label="Reference" hint="Still empty - no button.">
        <Input
          clearable
          placeholder="A-0000"
          value={reference}
          onChange={(event) => setReference(event.target.value)}
          onClear={() => setReference("")}
        />
      </FormField>
    </Grid>
  );
}
