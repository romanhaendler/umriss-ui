import { useState } from "react";
import { FormField, IconButton, Input } from "../../../src";

export const title = "Reveal a secret";
export const lead =
  "The eye sits in the field's `end` slot, inside its frame; `type` is your state. Any icon or `IconButton` goes there.";

/* Stands for the application's own icon set. */
function Eye({ crossed }: { crossed: boolean }) {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      {crossed && <path d="M2.5 13.5l11-11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />}
    </svg>
  );
}

export default function RevealASecret() {
  const [token, setToken] = useState("sk_live_7f3a91c2d0b4");
  const [shown, setShown] = useState(false);

  return (
    <FormField label="API token" style={{ maxWidth: 420 }}>
      <Input
        type={shown ? "text" : "password"}
        autoComplete="off"
        value={token}
        onValueChange={setToken}
        end={
          <IconButton aria-label="Show the token" aria-pressed={shown} onClick={() => setShown(!shown)}>
            <Eye crossed={shown} />
          </IconButton>
        }
      />
    </FormField>
  );
}
