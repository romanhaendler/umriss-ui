import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, FileInput, FormField, Stack, Stepper, Text } from "../../../src";

export const title = "A recipe import";

/* The full case: an import in three steps, the stepper at the head. The file
   input takes one CSV; once chosen, the application reads it - `File.text()`
   is the platform's - and says what it found before anything is written.
   The input only chose the file; reading, checking and importing are the
   application's, and so is the rule that a file without rows goes no
   further. */

interface Reading {
  name: string;
  rows: number;
}

export default function ARecipeImport() {
  const [files, setFiles] = useState<File[]>([]);
  const [reading, setReading] = useState<Reading | null>(null);
  const [imported, setImported] = useState(false);

  const choose = async (next: File[]) => {
    setFiles(next);
    setImported(false);
    const file = next[0];
    if (!file) return setReading(null);
    const lines = (await file.text()).split(/\r?\n/).filter((line) => line.trim() !== "");
    setReading({ name: file.name, rows: Math.max(0, lines.length - 1) }); // the first line is the head
  };

  const current = imported ? 3 : reading ? 1 : 0;

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader eyebrow="Mixing station 2" title="Import recipes" />
      <CardBody>
        <Stack gap={5}>
          <Stepper aria-label="Import" steps={[{ label: "Choose file" }, { label: "Check" }, { label: "Import" }]} current={current} />
          <FormField label="Recipe export" hint="CSV, one recipe per row, with a head line.">
            <FileInput accept=".csv" value={files} onChange={(next) => void choose(next)} />
          </FormField>
          {reading && !imported && (
            <Stack direction="row" gap={3} align="center">
              <Text size="sm">
                {reading.rows === 1 ? "1 recipe" : `${reading.rows} recipes`} in {reading.name}
              </Text>
              <Button size="sm" variant="primary" disabled={reading.rows === 0} onClick={() => setImported(true)}>
                Import
              </Button>
            </Stack>
          )}
          {imported && reading && (
            <Alert tone="success" title="Imported">
              {reading.rows === 1 ? "1 recipe" : `${reading.rows} recipes`} from {reading.name} are now on the station.
            </Alert>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
