import path from "node:path";
import fs from "node:fs/promises";
import type { IconEntry } from "../types";

export async function scanSvgFiles(dir: string): Promise<string[]> {
  let files: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files = files.concat(await scanSvgFiles(fullPath));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".svg")) {
        files.push(fullPath);
      }
    }
  } catch (error: any) {
    if (error.code === "ENOENT") return [];
    throw error;
  }
  return files;
}

export function createIconEntry(file: string, iconsRoot: string): IconEntry {
  return {
    name: toTypeName(file, iconsRoot),
    path: toDisplayPath(file, iconsRoot),
  };
}

function toTypeName(filePath: string, iconsRoot: string): string {
  const relative = path.relative(iconsRoot, filePath);
  const withoutExt = relative.replace(/\.svg$/i, "");
  return withoutExt.split(path.sep).filter(Boolean).join("-");
}

function toDisplayPath(filePath: string, iconsRoot: string): string {
  const relative = path.relative(iconsRoot, filePath).replace(/\\/g, "/");
  return relative.replace(/\.svg$/i, "");
}
