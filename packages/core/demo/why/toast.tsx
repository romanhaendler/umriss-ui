export default function WhyToast() {
  return (
    <>
      <h3>It interrupts nothing - so nothing important may stand in it</h3>
      <p>
        A toast goes away by itself. Whoever was looking elsewhere has missed it, and that is fine
        as long as it says only what has already happened anyway. What requires a decision belongs
        in an <code>Alert</code>, which stays put, or in a <code>ConfirmDialog</code>, which has to
        be answered.
      </p>

      <h3>The clock stands still while the pointer rests on it</h3>
      <p>
        Otherwise the message disappears under the hand of the person who is reading it. On leaving
        it, the remaining time runs on - not the whole of it once more.
      </p>

      <h3><code>duration: 0</code> is a statement</h3>
      <p>
        No expiry means: until somebody closes it. That is the right mode for a message whose loss
        costs something - and the wrong one for everything else, because a corner full of standing
        toasts stops being read after the third.
      </p>
    </>
  );
}
