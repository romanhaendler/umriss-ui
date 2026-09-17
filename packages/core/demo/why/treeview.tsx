export default function WhyTreeView() {
  return (
    <>
      <h3>The active node is not a selection</h3>
      <p>
        One node carries focus and answers &bdquo;where am I&ldquo;. Checked are arbitrarily many
        others. Those are two states and not one, and they are never collapsed into one here. See{" "}
        <code>docs/adr/0003-an-active-node-is-not-a-selection.md</code> and{" "}
        <code>docs/adr/0005-what-cannot-be-checked.md</code>.
      </p>

      <h3>The accessibility tree is flat</h3>
      <p>
        The obvious construction would be nested lists. It was not chosen here: everything
        downstream - keyboard movement, virtualisation, rendering - works on the flattening and
        never walks the tree. The level is reported as a number instead of following from the
        nesting. Only that makes virtualisation possible at all: cutting a window out of a nested
        structure cannot be done without lying about the structure. See{" "}
        <code>docs/adr/0004-a-flat-accessibility-tree.md</code>.
      </p>

      <h3>Loading belongs to the caller</h3>
      <p>
        An unloaded branch is not a leaf and not an empty branch - it is a branch whose content is
        unknown. The tree reports only that somebody opened it. What is fetched in response it does
        not know, and everything that would have to reach its descendants - the cascading check, for
        example - therefore does not touch it.
      </p>
    </>
  );
}
