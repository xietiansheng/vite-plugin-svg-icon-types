import path from "node:path";
import type { PluginOptions, ResolvedPluginOptions } from "../types";
import { DEFAULT_DEBOUNCE_MS, DEFAULT_PATHS } from "./defaults";

export function resolvePluginOptions(
  options: PluginOptions,
  root: string,
): ResolvedPluginOptions {
  const iconsDir = options.iconsDir ?? DEFAULT_PATHS.iconsDir;
  const output = options.output ?? DEFAULT_PATHS.output;
  const previewVue = options.previewVueOutput ?? DEFAULT_PATHS.previewVue;
  const previewMain = options.previewMainOutput ?? DEFAULT_PATHS.previewMain;
  const previewHtml = options.previewHtmlOutput ?? DEFAULT_PATHS.previewHtml;

  return {
    root,
    iconsRoot: path.resolve(root, iconsDir),
    typeOutputFile: path.resolve(root, output),
    previewVueFile: path.resolve(root, previewVue),
    previewMainFile: path.resolve(root, previewMain),
    previewHtmlFile: path.resolve(root, previewHtml),
    debounceMs: options.debounceMs ?? DEFAULT_DEBOUNCE_MS,
  };
}
