import { useEffect, useRef, useState } from "react";
import { Button, Stack, Switch, ToastProvider, useToast } from "../../../src";

export const title = "Save, and say how it went";
export const lead = "A `loading` toast shows a spinner, has no close button and does not leave by itself; `update` turns it into its outcome in place, and only then does its time begin.";

function Content() {
  const { toast, update } = useToast();
  const [fail, setFail] = useState(false);
  /* Read when the answer comes, so that "Try again" follows the switch. */
  const failRef = useRef(fail);
  useEffect(() => {
    failRef.current = fail;
  }, [fail]);

  const publish = () => {
    const id = toast({ title: "Publishing release notes…", tone: "loading" });
    setTimeout(() => {
      if (failRef.current) {
        update(id, {
          title: "Release notes not published",
          description: "Two sections still have open review comments.",
          tone: "danger",
          action: { label: "Try again", onClick: publish },
        });
      } else {
        update(id, {
          title: "Release notes published",
          description: "All 214 subscribers were notified.",
          tone: "success",
        });
      }
    }, 1500);
  };

  return (
    <Stack direction="row" gap={4} align="center" wrap>
      <Button onClick={publish}>Publish release notes</Button>
      <Switch label="Let it fail" checked={fail} onChange={(event) => setFail(event.target.checked)} />
    </Stack>
  );
}

/* `useToast` needs a `ToastProvider` above it; at the root of an application
   one provider serves every screen. */
export default function SaveWithLoading() {
  return (
    <ToastProvider>
      <Content />
    </ToastProvider>
  );
}
