export default function WhyTable() {
  return (
    <>
      <h3>Columns are elements, and the table renders its rows</h3>
      <p>
        The table of @umriss-ui/core let the caller describe every column up to four times: in the
        field of columns, in the header cell, in the data cell and in the foot. What the model knew
        about columns – hidden, reordered, widened – had to be applied by hand at every one of those
        places, and where that was missing the model was reordered and the screen was not. Here
        everything that makes a column stands in one element, and the table applies hiding and
        reordering to head, body and foot at once. The error can no longer be written. See{" "}
        <code>docs/adr/0017-columns-are-declared-by-composition.md</code>.
      </p>

      <h3>The hook binds the row kind – there is no unbound Column</h3>
      <p>
        TypeScript does not check whether a JSX child fits its parent. The connection between a
        column and its rows therefore arises from both coming out of the same{" "}
        <code>useTable</code> call. A freely imported <code>Column</code> would be the unchecked
        route and, because it is the shortest, the one everybody would take. What touches no row –{" "}
        <code>Toolbar</code>, <code>Search</code>, <code>ColumnMenu</code>, <code>Export</code>,{" "}
        <code>Pagination</code> – is an ordinary import.
      </p>

      <h3>The library remembers nothing</h3>
      <p>
        The table writes nothing into the address and nothing into any storage. A view – search,
        sorting, page, choice of columns, widths – is an object: <code>t.view</code> hands it out,{" "}
        <code>initialView</code> takes it back on the first render. Whether it is kept, and where –
        in a profile, in the session store, in the application's own address – the application
        decides. A library that writes the address bar dictates what its callers' URLs contain; that
        is not its place.
      </p>

      <h3>The pre-filter decides the rows, not the operation</h3>
      <p>
        <code>preFilter</code> says which rows this table has: those of the plant, those of the
        permission. It runs before search and conditions, it is invisible, and “Reset” does not
        touch it – the user is not meant to be able to undo it. That is why “43 of 1,204” counts
        only the rows it admits, and why it may stand in the call: a change does not reset the page,
        because it is not an operation the table reacts to but the set it computes with. Whoever
        wants to begin at page one after a change calls <code>t.setPage(1)</code>.
      </p>

      <h3>“Select all” means the filtered set</h3>
      <p>
        Not the page and not what is rendered. Whoever filters for “Line 2” and selects all means
        the orders of line 2 – including those on page three and those a virtualised table does not
        currently have in the document. What was already selected outside stays selected, but a bulk
        action from the table toolbar acts only on what lies inside.
      </p>

      <h3>Page or virtualise, never both</h3>
      <p>
        A page number beside a scrollbar would be a control that contradicts itself. Virtualisation
        is therefore an option of the hook that switches paging off – and a table pages at all only
        where a <code>Pagination</code> stands. Without one it shows the whole filtered set: a table
        that stops quietly at the tenth row because nobody put a paging bar there is a trap.
      </p>
    </>
  );
}
