/* The pnpm that runs this script, as the command and arguments for execFile or
   spawn without a shell: `execFileSync(...pnpm(["--filter", name, "build"]))`.
   Without a shell the bare name finds pnpm.exe but never Windows' pnpm.cmd, so
   it takes the path pnpm puts in npm_execpath: the native executable, or a .cjs
   for node when pnpm came from npm. Started some other way, the bare name. */
const own = process.env.npm_execpath;
const self = own && /pnpm[^\\/]*$/.test(own) ? own : "pnpm";

export const pnpm = (args) => (/\.[cm]?js$/.test(self) ? [process.execPath, [self, ...args]] : [self, args]);
