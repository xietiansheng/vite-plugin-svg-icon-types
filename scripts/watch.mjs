import { spawn } from "node:child_process";
import { rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { context } from "esbuild";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dist = resolve(root, "dist");

async function createContext(options) {
  const ctx = await context(options);
  await ctx.watch();
  return ctx;
}

async function run() {
  await rm(dist, { recursive: true, force: true });

  const common = {
    entryPoints: [resolve(root, "src/index.ts")],
    outdir: dist,
    bundle: true,
    platform: "node",
    target: "node18",
    sourcemap: true,
    logLevel: "info",
    banner: {
      js: `// Built from ${resolve(root)}`,
    },
  };

  const [esmCtx, cjsCtx] = await Promise.all([
    createContext({
      ...common,
      format: "esm",
    }),
    createContext({
      ...common,
      format: "cjs",
      outExtension: { ".js": ".cjs" },
    }),
  ]);

  const typeWatcher = spawn(
    "tsc",
    ["-p", "tsconfig.build.json", "--watch", "--preserveWatchOutput"],
    {
      cwd: root,
      stdio: "inherit",
    }
  );

  const stop = async () => {
    await Promise.all([esmCtx.dispose(), cjsCtx.dispose()]);
    typeWatcher.kill();
  };

  process.on("SIGINT", async () => {
    await stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await stop();
    process.exit(0);
  });
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
