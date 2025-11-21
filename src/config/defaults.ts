export const PLUGIN_NAME = "vite-plugin-svg-icon-name";

export const FILE_HEADER = "// ⚠️ 此文件为自动生成，请勿手动修改";

export const DEFAULT_PATHS = {
  iconsDir: "src/assets/svg",
  output: "src/types/generated-svg-names.d.ts",
  previewVue: "tmp/icon-preview/generated-preview.vue",
  previewMain: "tmp/icon-preview/main.ts",
  previewHtml: "tmp/icon-preview.html",
} as const;

export const DEFAULT_DEBOUNCE_MS = 100;
