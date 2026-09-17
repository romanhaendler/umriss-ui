/* The search field above the tree.

   Its own building block and not a prop on the tree: whoever puts the search
   somewhere else - in a toolbar, in a panel header - should be able to, just
   as the table keeps its toolbar separate. */

import type { ChangeEvent } from "react";
import { Input } from "../Input";
import type { InputProps } from "../Input";
import { useWording } from "../../lib/language";
import type { Key } from "./treeModel";
import type { Tree } from "./useTree";

export interface TreeSearchProps<K, S extends Key = string>
  extends Omit<InputProps, "value" | "onChange" | "type"> {
  /** The same tree as the view's. The field does not hold the text itself –
      it belongs to the tree, because the flattening depends on it. */
  tree: Tree<K, S>;
}

export function TreeSearch<K, S extends Key = string>({
  tree,
  placeholder,
  ...rest
}: TreeSearchProps<K, S>) {
  const wording = useWording();
  return (
    <Input
      type="search"
      value={tree.search}
      placeholder={placeholder ?? wording.treeSearchPlaceholder}
      onChange={(e: ChangeEvent<HTMLInputElement>) => tree.setSearch(e.target.value)}
      {...rest}
    />
  );
}
