import { buildPreviewHtml, buildPreviewMain, buildPreviewVue, buildTypeFile } from "./templates";
import { createIconEntry, scanSvgFiles } from "./scan";
import type { IconEntry, ResolvedPluginOptions } from "../types";
import { writeFileIfChanged } from "../utils/fs";
import { PLUGIN_NAME } from "../config/defaults";

type GeneratedFiles = {
  typeContent: string;
  previewContent: string;
  previewMain: string;
  previewHtml: string;
  entries: IconEntry[];
};

export async function collectEntries(options: ResolvedPluginOptions): Promise<IconEntry[]> {
  const svgFiles = await scanSvgFiles(options.iconsRoot);
  return svgFiles.map((file) => createIconEntry(file, options.iconsRoot));
}

export function buildArtifacts(entries: IconEntry[], options: ResolvedPluginOptions): GeneratedFiles {
  const names = entries.map((entry) => entry.name).filter(Boolean);
  return {
    typeContent: buildTypeFile(names),
    previewContent: buildPreviewVue(entries),
    previewMain: buildPreviewMain(),
    previewHtml: buildPreviewHtml(options.previewMainFile, options.root),
    entries,
  };
}

export async function writeArtifacts(
  files: GeneratedFiles,
  options: ResolvedPluginOptions,
): Promise<void> {
  await Promise.all([
    writeFileIfChanged(options.typeOutputFile, files.typeContent),
    writeFileIfChanged(options.previewVueFile, files.previewContent),
    writeFileIfChanged(options.previewMainFile, files.previewMain),
    writeFileIfChanged(options.previewHtmlFile, files.previewHtml),
  ]);
}

export async function generateArtifacts(options: ResolvedPluginOptions): Promise<number> {
  const entries = await collectEntries(options);
  const artifacts = buildArtifacts(entries, options);
  await writeArtifacts(artifacts, options);
  return artifacts.entries.length;
}

export function logGenerate(count: number): void {
  const label = `${count} icon${count === 1 ? "" : "s"}`;
  console.log(`[${PLUGIN_NAME}] generated ${label} (types + preview)`);
}
