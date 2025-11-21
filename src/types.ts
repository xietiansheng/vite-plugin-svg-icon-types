import type { InputOption } from "rollup";

export type PluginOptions = {
  iconsDir?: string;
  output?: string;
  previewVueOutput?: string;
  previewMainOutput?: string;
  previewHtmlOutput?: string;
  debounceMs?: number;
};

export type ResolvedPluginOptions = {
  root: string;
  iconsRoot: string;
  typeOutputFile: string;
  previewVueFile: string;
  previewMainFile: string;
  previewHtmlFile: string;
  debounceMs: number;
};

export type IconEntry = {
  name: string;
  path: string;
};

export type ResolvedInput = Record<string, string>;
export type InputTransform = (input?: InputOption) => ResolvedInput;
