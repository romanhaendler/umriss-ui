/* The values `Input`, `Textarea` and `Select` take, checked by the compiler as
   part of `typecheck`. A line under `@ts-expect-error` MUST yield an error. */

import { Input, Select, Textarea } from "../src";

export function Values() {
  return (
    <>
      <Input aria-label="a" value="text" />
      <Input aria-label="b" value={null} />
      <Textarea aria-label="c" value="text" />
      <Textarea aria-label="d" value={null} />
      <Select aria-label="e" value="a" />
      <Select aria-label="f" value={null} />
      <Select<number> aria-label="g" value={1} />
      {/* @ts-expect-error a number is not text */}
      <Input aria-label="h" value={1} />
      {/* @ts-expect-error a list is not text */}
      <Input aria-label="i" value={["a"]} />
      {/* @ts-expect-error a number is not text */}
      <Textarea aria-label="j" value={1} />
      {/* @ts-expect-error a list of values is a MultiSelect */}
      <Select aria-label="k" value={["a"]} />
      {/* @ts-expect-error a select of several values is a MultiSelect */}
      <Select aria-label="l" multiple />
    </>
  );
}
