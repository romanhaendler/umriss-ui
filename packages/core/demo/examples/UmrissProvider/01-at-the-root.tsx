// demo-only:start
import { Button, type ToastConfig, type useToast } from "../../../src";
import { usePageToast } from "../../pageToast";
// demo-only:shown
// import { Button, ToastProvider, UmrissProvider, useToast, type ToastConfig } from "../../../src";
// demo-only:end

type ToastFn = ReturnType<typeof useToast>["toast"];

const deploy = (toast: ToastFn) => toast({ title: "Checkout 4.12.0 deployed", description: "Rolled out to all regions.", tone: "success" });

export const title = "At the root";
export const lead = "Wrap the application once; here `toast` keeps every toast on screen for eight seconds unless the toast names its own duration.";

function DeployButton() {
  // demo-only:start
  const pageToast = usePageToast();
  return (
    <Button variant="primary" onClick={() => pageToast({ toast: TOAST }, deploy)}>
      Deploy Checkout
    </Button>
  );
  // demo-only:shown
  // const { toast } = useToast();
  // return (
  //   <Button variant="primary" onClick={() => deploy(toast)}>
  //     Deploy Checkout
  //   </Button>
  // );
  // demo-only:end
}

/* Kept outside the component: a new object on every render would be a new
   setting on every render. */
const TOAST: ToastConfig = { duration: 8000 };

export default function AtTheRoot() {
  // demo-only:start
  return <DeployButton />;
  // demo-only:shown
  // return (
  //   <UmrissProvider toast={TOAST}>
  //     <ToastProvider>
  //       <DeployButton />
  //     </ToastProvider>
  //   </UmrissProvider>
  // );
  // demo-only:end
}
