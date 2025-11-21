import path from "node:path";
import type { Plugin } from "vite";
import { DEFAULT_PATHS, PLUGIN_NAME } from "./config/defaults";
import { resolvePluginOptions } from "./config/resolve";
import { createInputTransform } from "./rollup/input";
import { generateArtifacts, logGenerate } from "./generator/artifacts";
import type { PluginOptions, ResolvedPluginOptions } from "./types";

export default function SvgIconNamePlugin(options: PluginOptions = {}): Plugin {
  const transformInput = createInputTransform(
    options.previewHtmlOutput ?? DEFAULT_PATHS.previewHtml,
  );

  let resolved: ResolvedPluginOptions | null = null;
  let debounceTimer: NodeJS.Timeout | null = null;

  async function runGenerate(context: "build" | "serve"): Promise<void> {
    if (!resolved) return;
    const count = await generateArtifacts(resolved);
    logGenerate(count);
    if (context === "build") return;
  }

  function scheduleGenerate(): void {
    if (!resolved) return;
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      runGenerate("serve").catch((error) => {
        console.error(`[${PLUGIN_NAME}] failed to generate assets`, error);
      });
    }, resolved.debounceMs);
  }

  function shouldHandle(filePath: string): boolean {
    if (!resolved) return false;
    const normalized = path.resolve(filePath);
    return normalized.endsWith(".svg") && normalized.startsWith(resolved.iconsRoot);
  }

  return {
    name: PLUGIN_NAME,
    enforce: "pre",
    config(config) {
      const input = config.build?.rollupOptions?.input;
      const withPreview = transformInput(input);
      return {
        build: {
          rollupOptions: {
            input: withPreview,
          },
        },
      };
    },
    configResolved(config) {
      resolved = resolvePluginOptions(options, config.root);
    },
    async buildStart() {
      await runGenerate("build");
    },
    configureServer(server) {
      if (!resolved) {
        return;
      }

      scheduleGenerate();

      const watcher = server.watcher;
      const handleChange = (filePath: string) => {
        if (!shouldHandle(filePath)) return;
        scheduleGenerate();
      };

      watcher.add(resolved.iconsRoot);
      watcher.on("add", handleChange);
      watcher.on("change", handleChange);
      watcher.on("unlink", handleChange);
      watcher.on("addDir", handleChange);
      watcher.on("unlinkDir", handleChange);

      server.httpServer?.on("close", () => {
        watcher.off("add", handleChange);
        watcher.off("change", handleChange);
        watcher.off("unlink", handleChange);
        watcher.off("addDir", handleChange);
        watcher.off("unlinkDir", handleChange);
        if (debounceTimer) clearTimeout(debounceTimer);
      });
    },
  };
}
