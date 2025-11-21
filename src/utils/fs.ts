import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/**
 * Minimal helper to avoid rewriting identical files and causing unnecessary HMR.
 */
export async function writeFileIfChanged(filePath: string, content: string): Promise<boolean> {
  await mkdir(dirname(filePath), { recursive: true });
  let existing: string | null = null;

  try {
    existing = await readFile(filePath, "utf8");
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  if (existing === content) {
    return false;
  }

  await writeFile(filePath, content, "utf8");
  return true;
}
