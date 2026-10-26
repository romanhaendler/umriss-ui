import { useEffect, useRef, useState } from "react";
import { Button, FileInput, FormField, ProgressBar, Stack, Text, VisuallyHidden } from "../../../src";

export const title = "Progress and thumbnails";
export const lead =
  "The field only chooses, so the files, their progress and their thumbnails are your state: `value={[]}` keeps it a drop zone, and a phone offers its camera for `capture`.";

type Phase = "waiting" | "sending" | "done" | "failed";

interface Entry {
  id: number;
  file: File;
  phase: Phase;
  progress: number;
  /** An object URL for an image; revoked when the entry leaves the list. */
  thumbnail: string | null;
}

const WORDS: Record<Phase, string> = { waiting: "Waiting", sending: "Sending", done: "Done", failed: "Failed - remove it and try again" };

export default function ProgressAndThumbnails() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const counter = useRef(1);
  const live = useRef(entries);
  useEffect(() => {
    live.current = entries;
  });

  /* A simulated upload: one file at a time, a quarter every 300 ms; every third file fails at half. */
  const active = entries.find((entry) => entry.phase === "sending") ?? entries.find((entry) => entry.phase === "waiting");
  useEffect(() => {
    if (!active) return;
    const timer = setTimeout(() => {
      const progress = active.phase === "waiting" ? 0 : Math.min(1, active.progress + 0.25);
      const phase: Phase = active.id % 3 === 0 && progress >= 0.5 ? "failed" : progress >= 1 ? "done" : "sending";
      setEntries((all) => all.map((one) => (one.id === active.id ? { ...one, progress, phase } : one)));
    }, 300);
    return () => clearTimeout(timer);
  }, [active]);

  /* What is left when the example goes. */
  useEffect(() => () => live.current.forEach((entry) => entry.thumbnail && URL.revokeObjectURL(entry.thumbnail)), []);

  const add = (files: File[]) => {
    const added = files.map((file) => ({
      id: counter.current++,
      file,
      phase: "waiting" as Phase,
      progress: 0,
      thumbnail: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setEntries((all) => [...all, ...added]);
  };

  const remove = (entry: Entry) => {
    if (entry.thumbnail) URL.revokeObjectURL(entry.thumbnail);
    setEntries((all) => all.filter((one) => one.id !== entry.id));
  };

  return (
    <Stack gap={4} style={{ maxWidth: 480 }}>
      <FormField label="Photos of the damage" hint="Choose, drop or take a photo. The third file fails, to show that state.">
        <FileInput multiple accept="image/*" capture="environment" value={[]} onChange={add} />
      </FormField>
      {entries.length > 0 && (
        <ul aria-label="Files to send" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--u-space-3)" }}>
          {entries.map((entry) => (
            <li key={entry.id} style={{ display: "flex", gap: "var(--u-space-3)", alignItems: "center" }}>
              {entry.thumbnail ? (
                <img src={entry.thumbnail} alt="" width={40} height={40} style={{ objectFit: "cover", borderRadius: 4, flex: "none" }} />
              ) : (
                <span style={{ width: 40, height: 40, flex: "none" }} />
              )}
              <Stack gap={1} style={{ flex: 1, minWidth: 0 }}>
                <Text size="sm" style={{ overflowWrap: "anywhere" }}>
                  {entry.file.name}
                </Text>
                <ProgressBar label={entry.file.name} value={entry.progress} valueText={WORDS[entry.phase]} />
                <Text size="xs" tone="muted" style={entry.phase === "failed" ? { color: "var(--u-color-danger)" } : undefined}>
                  {WORDS[entry.phase]}
                </Text>
              </Stack>
              <Button size="sm" variant="secondary" onClick={() => remove(entry)}>
                Remove
                <VisuallyHidden> {entry.file.name}</VisuallyHidden>
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}
