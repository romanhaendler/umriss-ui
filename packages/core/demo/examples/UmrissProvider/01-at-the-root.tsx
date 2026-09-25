import { Button, ToastProvider, UmrissProvider, useToast } from "../../../src";

export const title = "At the root";
export const lead = "Wrap the application once; here `toast` keeps every toast on screen for eight seconds unless the toast names its own duration.";

function DeployButton() {
  const { toast } = useToast();
  return (
    <Button
      variant="primary"
      onClick={() => toast({ title: "Checkout 4.12.0 deployed", description: "Rolled out to all regions.", tone: "success" })}
    >
      Deploy Checkout
    </Button>
  );
}

/* Kept outside the component: a new object on every render would be a new
   setting on every render. */
const TOAST = { duration: 8000 };

export default function AtTheRoot() {
  return (
    <UmrissProvider toast={TOAST}>
      <ToastProvider>
        <DeployButton />
      </ToastProvider>
    </UmrissProvider>
  );
}
