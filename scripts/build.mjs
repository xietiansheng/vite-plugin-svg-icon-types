import { spawnSync } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");

async function run() {
  await rm(dist, { recursive: true, force: true });

  await build({
    entryPoints: [resolve(root, "src/index.ts")],
    outdir: dist,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node18",
    sourcemap: true,
    logLevel: "info",
    banner: {
      js: `// Built from ${resolve(root)}`,
    },
  });

  await build({
    entryPoints: [resolve(root, "src/index.ts")],
    outdir: dist,
    outExtension: { ".js": ".cjs" },
    bundle: true,
    platform: "node",
    format: "cjs",
    target: "node18",
    sourcemap: true,
    logLevel: "info",
    banner: {
      js: `// Built from ${resolve(root)}`,
    },
  });

  const typeResult = spawnSync("tsc", ["-p", "tsconfig.build.json"], {
    cwd: root,
    stdio: "inherit",
  });

  if (typeResult.status !== 0) {
    process.exit(typeResult.status ?? 1);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
