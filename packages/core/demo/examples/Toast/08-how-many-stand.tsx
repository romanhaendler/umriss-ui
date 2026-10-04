import { Button, ToastProvider, UmrissProvider, useToast, type ToastConfig } from "../../../src";

export const title = "How many stand at once";
export const lead = "`toast.limit` in the `UmrissProvider` caps the deck: here two stand, and each new toast pushes out the oldest as if it had been closed. Scan four parcels in a row and only the last two remain.";

const PARCELS = ["FP-2081", "FP-2082", "FP-2083", "FP-2084"];

function ScanButton() {
  const { toast } = useToast();
  return (
    <Button
      variant="primary"
      onClick={() => PARCELS.forEach((parcel) => toast({ title: `Parcel ${parcel} scanned`, description: "Loaded onto tour T-03.", tone: "success" }))}
    >
      Scan four parcels
    </Button>
  );
}

/* Kept outside the component: a new object on every render would be a new
   setting on every render. */
const TOAST: ToastConfig = { limit: 2 };

export default function HowManyStand() {
  return (
    <UmrissProvider toast={TOAST}>
      <ToastProvider>
        <ScanButton />
      </ToastProvider>
    </UmrissProvider>
  );
}
