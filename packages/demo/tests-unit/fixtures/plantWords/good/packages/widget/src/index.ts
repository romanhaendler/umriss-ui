/* Only words that look like one: Shift+click adds a row,
   Alt+Shift+← shrinks it, Shift with the wheel pans, and a drag shifts the
   task by an hour. A state machine keeps the rows; the offset shifts a tick
   grid onto local time. */
export const step = (event: { shiftKey: boolean }, shift: boolean) => (event.shiftKey || shift ? 10 : 1);
export const first = (queue: number[]) => queue.shift();
