export default function WhyStateBand() {
  return (
    <>
      <h3>A state is a number</h3>
      <p>
        The accessor of a state band returns the <strong>index</strong> of a state in the state
        list, not a string and not a colour. The list is the code: it fixes the order, the name
        and the colour in one place, so that two charts of the same plant cannot disagree about
        what yellow means. See <code>docs/adr/0007-a-state-is-a-number.md</code>.
      </p>

      <h3>A band is a partition, and a hole is not a state</h3>
      <p>
        Every segment ends where the next begins - that is what makes it a band rather than a run
        of spans. Where a machine reports nothing, a hole stays: there is no colour for
        &bdquo;unknown&ldquo;, because a fifth colour in the legend would claim a state that was
        never measured. A thing with an explicit end is a <strong>Span</strong>, and it has a page
        of its own.
      </p>
    </>
  );
}
