import path from "node:path";
import { FILE_HEADER } from "../config/defaults";
import type { IconEntry } from "../types";

function previewVueTemplate(iconArray: string): string {
  return `<!-- !!! 此文件由插件自动生成，请勿手动修改 !!! -->
<template>
  <div class="page">
    <header class="page__header">
      <div class="page__title">SVG Icon Preview</div>
      <div class="page__meta">{{ filteredIcons.length }} / {{ icons.length }} icons</div>
    </header>
    <div class="page__search">
      <input v-model="keyword" type="text" placeholder="搜索图标名称" />
      <button class="page__clear" @click="keyword = ''" v-if="keyword">清空</button>
    </div>
    <div class="grid">
      <button
        v-for="item in filteredIcons"
        :key="item.name"
        class="grid__item"
        @click="copyName(item.name)"
      >
        <SvgIcon :name="item.name" :size="28" />
        <div class="tooltip">
          <div class="tooltip__path">{{ item.path }}</div>
          <div class="tooltip__actions">
            <button @click.stop="copyName(item.name)">复制名称</button>
            <button @click.stop="copyName(item.path)">复制路径</button>
            <button @click.stop="copyCode(item.name)">复制代码</button>
          </div>
        </div>
      </button>
    </div>
    <div v-if="copied" class="toast">已复制：{{ copied }}</div>
    <div v-if="!filteredIcons.length" class="empty">暂无匹配的图标</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { SvgIconName } from '@/types/generated-svg-names';
import SvgIcon from '@/components/SvgIcon.vue';

type IconItem = { name: SvgIconName; path: string };
const icons: readonly IconItem[] = ${iconArray};

const keyword = ref('');
const copied = ref('');

const filteredIcons = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return icons;
  return icons.filter(item => item.name.toLowerCase().includes(kw) || item.path.toLowerCase().includes(kw));
});

async function copy(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
    copied.value = text;
    setTimeout(() => (copied.value = ''), 1500);
  } catch (err) {
    console.error('copy failed', err);
  }
}

function copyName(name: SvgIconName) {
  copy(name);
}

function copyCode(name: SvgIconName) {
  copy(\`<SvgIcon :name="'\${name}'" />\`);
}
</script>

<style scoped>
:global(body) {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
}
.page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.page__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}
.page__title {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.3px;
}
.page__meta {
  font-size: 13px;
  color: #94a3b8;
}
.page__search {
  display: flex;
  gap: 8px;
}
.page__search input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #1e293b;
  background: #0b1220;
  color: #e2e8f0;
}
.page__search input:focus {
  outline: 2px solid #38bdf8;
  border-color: transparent;
}
.page__clear {
  border: 1px solid #1e293b;
  background: #0b1220;
  color: #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  cursor: pointer;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
}
.grid__item {
  border: 1px solid #1e293b;
  background: rgba(30, 41, 59, 0.4);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  color: #e2e8f0;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}
.grid__item:hover {
  border-color: #38bdf8;
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(56, 189, 248, 0.15);
}
.grid__label {
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
}
.tooltip {
  position: absolute;
  left: 50%;
  bottom: 90%;
  transform: translate(-50%, 8px);
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(56, 189, 248, 0.5);
  color: #e2e8f0;
  padding: 10px 12px;
  border-radius: 10px;
  min-width: 300px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease, transform 0.16s ease;
  z-index: 2;
}
.grid__item:hover .tooltip {
  opacity: 1;
  transform: translate(-50%, -2px);
  pointer-events: auto;
}
.tooltip__path {
  font-size: 12px;
  color: #cbd5e1;
  word-break: break-all;
  margin-bottom: 8px;
}
.tooltip__actions {
  display: flex;
  gap: 8px;
}
.tooltip__actions button {
  flex: 1;
  border: 1px solid #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 6px 8px;
  cursor: pointer;
  font-size: 12px;
}
.tooltip__actions button:hover {
  background: rgba(56, 189, 248, 0.2);
}
.toast {
  position: fixed;
  right: 16px;
  bottom: 16px;
  background: rgba(56, 189, 248, 0.1);
  color: #38bdf8;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  font-size: 13px;
}
.empty {
  text-align: center;
  color: #94a3b8;
  padding: 24px 0;
}
</style>
`;
}

export function buildTypeFile(names: string[]): string {
  if (!names.length) {
    return `${FILE_HEADER}\nexport type SvgIconName = never;\n`;
  }
  const sorted = [...names].sort();
  const lines = sorted.map((name) => `  | '${name}'`).join("\n");
  return `${FILE_HEADER}\nexport type SvgIconName =\n${lines};\n`;
}

export function buildPreviewVue(entries: IconEntry[]): string {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const iconArray =
    sorted.length === 0
      ? "[] as const"
      : `[\n${sorted
          .map((n) => `  { name: '${n.name}', path: '${n.path}' },`)
          .join("\n")}\n] as const`;
  return previewVueTemplate(iconArray);
}

export function buildPreviewMain(): string {
  return `import { createApp } from 'vue';
import 'virtual:svg-icons-register';
import Preview from './generated-preview.vue';

createApp(Preview).mount('#app');
`;
}

export function buildPreviewHtml(
  previewMainFile: string,
  root: string
): string {
  const mainPath = toPublicPath(previewMainFile, root);
  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Icon Preview</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="${mainPath}"></script>
  </body>
</html>
`;
}

function toPublicPath(filePath: string, root: string): string {
  const rel = path.relative(root, filePath).replace(/\\\\/g, "/");
  return rel.startsWith("/") ? rel : `/${rel}`;
}
