import type { InputOption } from "rollup";
import type { InputTransform, ResolvedInput } from "../types";

export function normalizeInput(input?: InputOption): ResolvedInput {
  const normalized: ResolvedInput = {};

  if (typeof input === "string") {
    normalized.main = input;
  } else if (Array.isArray(input)) {
    input.forEach((entry, index) => {
      normalized[`page-${index}`] = entry;
    });
  } else if (input && typeof input === "object") {
    Object.entries(input).forEach(([key, value]) => {
      normalized[key] = String(value);
    });
  }

  if (!Object.keys(normalized).length) {
    normalized.main = "index.html";
  }

  return normalized;
}

export function createInputTransform(previewHtml: string): InputTransform {
  return (input?: InputOption) => {
    const normalized = normalizeInput(input);
    normalized["icon-preview"] = previewHtml;
    return normalized;
  };
}
