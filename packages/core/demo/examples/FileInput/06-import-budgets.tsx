import { useState } from "react";
import { Alert, Button, Card, CardBody, CardHeader, FileInput, FormField, Stack, Stepper, Text } from "../../../src";

export const title = "Import budgets";
export const lead = "The input only chooses; reading the file with `File.text()`, checking it and importing it stay with your application.";

interface Reading {
  name: string;
  rows: number;
}

export default function ImportBudgets() {
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
  const count = (rows: number) => (rows === 1 ? "1 cost centre" : `${rows} cost centres`);

  return (
    <Card style={{ maxWidth: 560 }}>
      <CardHeader eyebrow="Budget 2027" title="Import budgets" />
      <CardBody>
        <Stack gap={5}>
          <Stepper aria-label="Import" steps={[{ label: "Choose file" }, { label: "Check" }, { label: "Import" }]} current={current} />
          <FormField label="Budget sheet" hint="CSV, one cost centre per row, with a head line.">
            <FileInput accept=".csv" value={files} onChange={(next) => void choose(next)} />
          </FormField>
          {reading && !imported && (
            <Stack direction="row" gap={3} align="center">
              <Text size="sm">
                {count(reading.rows)} in {reading.name}
              </Text>
              <Button size="sm" variant="primary" disabled={reading.rows === 0} onClick={() => setImported(true)}>
                Import
              </Button>
            </Stack>
          )}
          {imported && reading && (
            <Alert tone="success" title="Imported">
              {count(reading.rows)} from {reading.name} now carry a 2027 budget.
            </Alert>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}
