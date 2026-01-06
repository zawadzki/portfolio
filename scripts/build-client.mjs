import { build } from "esbuild";
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const outdir = resolve("dist", "assets");
await mkdir(outdir, { recursive: true });

await build({
  entryPoints: [resolve("src", "scripts", "main.ts")],
  bundle: true,
  format: "esm",
  minify: true,
  sourcemap: true,
  outdir,
  target: ["es2020"],
});
