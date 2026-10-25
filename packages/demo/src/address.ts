/* The address of the site: the one `pnpm start` serves it at, and the root of
   every absolute address the build, the llms text and the built-site probes
   write or read. The path is the base the demos are built with, so a page two
   directories deep finds the same assets.

   Its own file, like `packages.ts`, and importing nothing: the site build
   loads it in Node without a bundler. */

export const SITE = "http://localhost:4170/umriss-ui/";
