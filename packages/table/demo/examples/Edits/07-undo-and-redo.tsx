import { useEffect, useState } from "react";
import { Button, Stack } from "@umriss-ui/core";
import { useTable } from "../../../src";
import type { CellEdit } from "../../../src";

export const title = "Undo and redo over the reported edits";
export const lead =
  "The table reports each edit and applies none, so the history is the application's: each reported edit keeps the value it replaced, and Ctrl+Z writes that value back.";

interface Task {
  id: string;
  title: string;
  owner: string;
  hours: number;
  status: "Open" | "Doing" | "Done";
}

const TASKS: Task[] = [
  { id: "t1", title: "Survey the site", owner: "Maya Lindgren", hours: 6, status: "Done" },
  { id: "t2", title: "Draft the layout", owner: "Noah Fischer", hours: 14, status: "Doing" },
  { id: "t3", title: "Review the layout", owner: "Arjun Mehta", hours: 4, status: "Open" },
];

/** A reported edit, with the value it replaced. */
interface Step {
  rowKey: string;
  columnId: string;
  before: unknown;
  after: unknown;
}

/** The rows with one cell set to a value; a new array, so React sees the change. */
function setCell(all: Task[], rowKey: string, columnId: string, value: unknown): Task[] {
  return all.map((t) => (t.id === rowKey ? { ...t, [columnId]: value } : t));
}

export default function UndoAndRedo() {
  const [tasks, setTasks] = useState(TASKS);
  const [undo, setUndo] = useState<Step[]>([]);
  const [redo, setRedo] = useState<Step[]>([]);
  const { Table, Column } = useTable(tasks, { rowKey: (t) => t.id });

  const onCellEdit = (edit: CellEdit<Task>) => {
    const before = (edit.row as unknown as Record<string, unknown>)[edit.columnId];
    setTasks((all) => setCell(all, edit.rowKey, edit.columnId, edit.value));
    setUndo((steps) => [...steps, { rowKey: edit.rowKey, columnId: edit.columnId, before, after: edit.value }]);
    setRedo([]);
  };

  const undoLast = () => {
    const step = undo.at(-1);
    if (!step) return;
    setUndo(undo.slice(0, -1));
    setRedo([...redo, step]);
    setTasks((all) => setCell(all, step.rowKey, step.columnId, step.before));
  };

  const redoLast = () => {
    const step = redo.at(-1);
    if (!step) return;
    setRedo(redo.slice(0, -1));
    setUndo([...undo, step]);
    setTasks((all) => setCell(all, step.rowKey, step.columnId, step.after));
  };

  /* Ctrl+Z in the grid, not in an open editor, where the field keeps its own undo. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== "z") return;
      const target = event.target as Element;
      if (!target.closest('[role="grid"]') || target.closest("input, textarea, select")) return;
      event.preventDefault();
      if (event.shiftKey) redoLast();
      else undoLast();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <Stack gap={2}>
      <Stack direction="row" gap={2}>
        <Button onClick={undoLast} disabled={undo.length === 0}>
          Undo
        </Button>
        <Button onClick={redoLast} disabled={redo.length === 0}>
          Redo
        </Button>
      </Stack>
      <Table grid aria-label="Tasks" onCellEdit={onCellEdit}>
        <Column value="title" label="Task" rowHeader />
        <Column value="owner" label="Owner" />
        <Column value="hours" label="Hours" edit="number" width={120} />
        <Column value="status" label="Status" edit="select" editOptions={["Open", "Doing", "Done"]} width={140} />
      </Table>
    </Stack>
  );
}
