import { useRef, useState } from "react";
import { Button, DatePicker, FormField, Stack, ToastProvider, UmrissProvider, useToast } from "../../../src";
import type { UmrissProviderProps } from "../../../src";
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "Set up an application";
export const lead = "All four settings, as a root sets them: German wording and notation, compact tables, overlays in the application's element, short toasts.";

const LANGUAGE: UmrissProviderProps["language"] = { wording: GERMAN_WORDING, formats: GERMAN_FORMATS };
const TOAST = { duration: 3000 };

function DeliveryDate() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | null>(new Date(2026, 2, 18));
  return (
    <Stack gap={3} align="flex-start">
      <FormField label="Delivery date">
        <DatePicker value={date} onChange={setDate} clearable />
      </FormField>
      <Button size="sm" disabled={date === null} onClick={() => toast({ title: "Shipment SH-1042 rebooked" })}>
        Rebook
      </Button>
    </Stack>
  );
}

export default function EverythingAtOnce() {
  const root = useRef<HTMLDivElement>(null);

  return (
    <div ref={root}>
      <UmrissProvider density="compact" portalTarget={() => root.current} toast={TOAST} language={LANGUAGE}>
        <ToastProvider>
          <DeliveryDate />
        </ToastProvider>
      </UmrissProvider>
    </div>
  );
}
