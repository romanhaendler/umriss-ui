import { useRef, useState } from "react";
// demo-only:start
import { Button, DatePicker, FormField, Stack, UmrissProvider } from "../../../src";
import type { ToastConfig, UmrissProviderProps, useToast } from "../../../src";
import { usePageToast } from "../../pageToast";
// demo-only:shown
// import { Button, DatePicker, FormField, Stack, ToastProvider, UmrissProvider, useToast } from "../../../src";
// import type { ToastConfig, UmrissProviderProps } from "../../../src";
// demo-only:end
import { GERMAN_FORMATS, GERMAN_WORDING } from "@umriss-ui/core/wording/de";

export const title = "Set up an application";
export const lead = "All four settings, as a root sets them: German wording and notation, compact tables, overlays in the application's element, short toasts.";

const LANGUAGE: UmrissProviderProps["language"] = { wording: GERMAN_WORDING, formats: GERMAN_FORMATS };
const TOAST: ToastConfig = { duration: 3000 };

type ToastFn = ReturnType<typeof useToast>["toast"];

const rebook = (toast: ToastFn) => toast({ title: "Shipment SH-1042 rebooked" });

function DeliveryDate() {
  // demo-only:start
  const pageToast = usePageToast();
  const rebookNow = () => pageToast({ toast: TOAST }, rebook);
  // demo-only:shown
  // const { toast } = useToast();
  // const rebookNow = () => rebook(toast);
  // demo-only:end
  const [date, setDate] = useState<Date | null>(new Date(2026, 2, 18));
  return (
    <Stack gap={3} align="flex-start">
      <FormField label="Delivery date">
        <DatePicker value={date} onChange={setDate} clearable />
      </FormField>
      <Button size="sm" disabled={date === null} onClick={rebookNow}>
        Rebook
      </Button>
    </Stack>
  );
}

export default function EverythingAtOnce() {
  const root = useRef<HTMLDivElement>(null);

  // demo-only:start
  return (
    <div ref={root}>
      <UmrissProvider density="compact" portalTarget={() => root.current} language={LANGUAGE}>
        <DeliveryDate />
      </UmrissProvider>
    </div>
  );
  // demo-only:shown
  // return (
  //   <div ref={root}>
  //     <UmrissProvider density="compact" portalTarget={() => root.current} toast={TOAST} language={LANGUAGE}>
  //       <ToastProvider>
  //         <DeliveryDate />
  //       </ToastProvider>
  //     </UmrissProvider>
  //   </div>
  // );
  // demo-only:end
}
