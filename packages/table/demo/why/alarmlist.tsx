export default function WhyAlarmList() {
  return (
    <>
      <h3>A lifecycle, not a generation</h3>
      <p>
        The library receives alarms. It generates none. Turning a measured value into an alarm means
        knowing what a limit means in this plant, which delay applies and when a condition counts as
        true – and a user-interface library does not know that. It owns what happens afterwards:
        acknowledging, sorting, counting, marking. See{" "}
        <code>docs/adr/0009-the-library-owns-a-lifecycle-not-a-generation.md</code>.
      </p>

      <h3>One field with four values, not a pair of booleans</h3>
      <p>
        Standing/cleared and acknowledged/unacknowledged would be two flags. Two flags invite{" "}
        <code>if (standing)</code>, and that filter loses the third case: it came, it went, and
        nobody saw it. That is precisely the one worth investigating.
      </p>

      <h3>A flood is marked, never suppressed</h3>
      <p>
        All forty rows stand there; the marking says that they came together. Deciding that a human
        should not see an alarm is a safety decision, and it does not belong in a user-interface
        library.
      </p>

      <h3>The live region reports a number</h3>
      <p>
        It is polite and says how many standing unacknowledged there are. Not every arrival – a list
        that reads out forty arrivals during a flood gets switched off, and then it reports nothing
        at all.
      </p>

      <h3>Priority is not severity</h3>
      <p>
        The priority of an alarm and the severity of a limit are two scales on two objects. That is
        why they are named differently, and a mapping between them belongs to the caller.
      </p>

      <h3>A table like any other</h3>
      <p>
        The alarm list is built with the same interface as every other table: <code>useTable</code>,
        six <code>Column</code>s, <code>selectable</code> and <code>rowProps</code>. It was the
        honest test of whether the interface carries a real table, and it produced one rule: a table
        pages only where a <code>Pagination</code> stands. Before that, the list stopped quietly at
        the tenth alarm because nobody had put a paging bar there – in a flood the worst possible
        place for it. The order, the worst first, is established by the alarm model; that is why the
        columns do not sort.
      </p>
    </>
  );
}
