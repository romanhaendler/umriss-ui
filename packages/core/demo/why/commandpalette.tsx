export default function WhyCommandPalette() {
  return (
    <>
      <h3>Not a parameterised modal</h3>
      <p>
        The palette looks like a window above the page and is none. It has a different
        anatomy - a field that keeps focus, a list the arrow keys travel while the field stays
        typed in, and a find that must stay put as one types on. Built as a special case of{" "}
        <code>Modal</code>, every one of those properties would have been a prop that exactly one
        caller sets.
      </p>

      <h3>It finds by subsequence, not by substring</h3>
      <p>
        <code>cf</code> finds &bdquo;Charge freigeben&ldquo;. That is the reason a find returns a{" "}
        <em>structure</em> and not a boolean: the matched characters are marked, so that an
        unexpected find looks justified. A match whose connection to the term is invisible reads as
        arbitrariness.
      </p>

      <h3>Places and commands are the same thing</h3>
      <p>
        What happens on choosing is the caller's decision: the shell of this demo jumps to a
        page, the page here runs a command. A candidate is an id, a name and a group - what stands
        behind it is none of the palette's business.
      </p>

      <h3>A translucent material needs a floor</h3>
      <p>
        The pane stands on the same material as <code>Modal</code> and{" "}
        <code>Popover</code>, and for the same reason an opaque layer lies beneath it: what shines
        through can push the contrast below the threshold, and then the find is no longer
        readable. See <code>docs/adr/0012-a-translucent-material-needs-a-floor.md</code>.
      </p>

      <h3>The resting state belongs to the caller</h3>
      <p>
        <code>restingItems</code> is a <em>list</em> and not a switch, because the interesting
        question is not &bdquo;all or none&ldquo; but &bdquo;which&ldquo;. Seven commands one shows
        all of; all pages one does not, because a list that is already full can only shrink - and
        that is precisely the state this component abolished.
      </p>
      <p>
        A weight on a candidate models frequency or recency. The library deliberately keeps no
        memory for that: whoever remembers what somebody does should do it in one place, where
        somebody notices.
      </p>
    </>
  );
}
