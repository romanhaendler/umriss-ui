import { useState } from "react";
import { Button, FormField, Grid, Stack, Textarea } from "../../../src";

export const title = "Growing along and the character counter";

/* `autoGrow` lets the field grow with its content, `maxRows` sets the bound
   beyond which it scrolls after all. The height follows a value set from
   outside too, and not only typing - that is what the button is there for.

   `showCount` needs `maxLength`: a counter without an upper bound counts
   against nothing. Once exceeded it turns red and says by how much. */
export default function AutogrowAndCounter() {
  const [comment, setComment] = useState(
    "A field that has grown with its content.\nSecond line.\nThird line.",
  );
  const [note, setNote] = useState("Too long for the field - the counter stands in the negative.");

  return (
    <Grid minItemWidth="280px" gap={4}>
      <FormField label="Comment" hint="Grows with its content, at most eight lines.">
        <Stack gap={2}>
          <Textarea
            autoGrow
            maxRows={8}
            placeholder="Optional"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
          />
          <Stack direction="row" gap={2}>
            <Button
              size="sm"
              onClick={() =>
                setComment(
                  Array.from({ length: 12 }, (_, i) => `Line ${i + 1}, set from outside.`).join("\n"),
                )
              }
            >
              Set a long text
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setComment("")}>
              Clear
            </Button>
          </Stack>
        </Stack>
      </FormField>
      <FormField label="Note" hint="With a character counter; once exceeded it turns red.">
        <Textarea
          showCount
          maxLength={40}
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
        />
      </FormField>
    </Grid>
  );
}
