export default function WhyMeter() {
  return (
    <>
      <h3>Colour means something here - so the rest of the library spares it</h3>
      <p>
        The tone comes from an assessment the caller makes: only he knows whether ninety per cent
        is good or bad. The component does not colour itself by height - that would be a statement
        about the plant which it cannot make.
      </p>
      <p>
        And because the colour means something, the number stands beside it. A bar that says
        something is wrong only by turning orange has documented the wrong thing.
      </p>

      <h3>A fraction, not a percentage</h3>
      <p>
        <code>value</code> runs from 0 to 1. The conversion belongs in one place and not at every
        call site; the display in per cent the component makes out of it itself. Values outside are
        clamped - a bar running past its frame would be a statement about the layout and not about
        the value.
      </p>

      <h3>A name from the author</h3>
      <p>
        The role <code>meter</code> requires an accessible name, and neither the visible percentage
        inside nor the column heading beside it counts for that. Without <code>label</code> the
        generic term stands here - and it is rarely the right one.
      </p>
    </>
  );
}
