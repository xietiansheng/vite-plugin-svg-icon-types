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
        @click="selectIcon(item)"
      >
        <svg aria-hidden="true" :style="iconBaseStyle">
          <use
            :href="getSymbolId(item.name)"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
    <div v-if="!filteredIcons.length" class="empty">暂无匹配的图标</div>
    <div v-if="selectedIcon" class="preview">
      <div class="preview__row">
        <div class="preview__icon">
          <svg aria-hidden="true" :style="previewIconStyle">
            <use
              :href="getSymbolId(selectedIcon.name)"
              :fill="colorValue"
            />
          </svg>
          <div class="preview__name">{{ selectedIcon.name }}</div>
        </div>
        <div class="preview__controls">
          <div class="color-panel">
            <div class="color-panel__header">颜色</div>
            <div class="color-panel__inputs">
              <input
                type="color"
                v-model="colorHexPicker"
                class="input input--color"
                aria-label="color picker"
              />
              <input
                v-model="colorInputValue"
                class="input"
                :placeholder="colorFormat === 'hex' ? '#38bdf8' : 'rgb(56, 189, 248)'"
              />
            </div>
            <div class="format-toggle" role="radiogroup" aria-label="color format">
              <button
                type="button"
                class="format-toggle__option"
                :class="{ active: colorFormat === 'hex' }"
                @click="colorFormat = 'hex'"
                aria-pressed="colorFormat === 'hex'"
              >
                Hex
              </button>
              <button
                type="button"
                class="format-toggle__option"
                :class="{ active: colorFormat === 'rgb' }"
                @click="colorFormat = 'rgb'"
                aria-pressed="colorFormat === 'rgb'"
              >
                RGB
              </button>
            </div>
          </div>
          <div class="rotate">
            <div class="rotate__label">旋转 (°)</div>
            <div class="rotate__control">
              <button type="button" class="rotate__btn" @click="changeRotate(-10)">-10</button>
              <input
                v-model.number="rotateDeg"
                class="input rotate__input"
                type="number"
                step="10"
              />
              <button type="button" class="rotate__btn" @click="changeRotate(10)">+10</button>
            </div>
          </div>
        </div>
      </div>
      <div class="preview__path" title="图标路径">{{ selectedIcon.path }}</div>
      <div class="preview__actions">
        <button @click="copyCode(selectedIcon.name)">复制图标</button>
        <button @click="copyPath(selectedIcon.path)">复制路径</button>
        <button @click="copyStyle()">复制样式</button>
      </div>
    </div>
    <div v-if="copied" class="toast">已复制：{{ copied }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

type IconItem = { name: string; path: string };
const icons: readonly IconItem[] = ${iconArray};

const keyword = ref('');
const copied = ref('');
const colorFormat = ref<'hex' | 'rgb'>('hex');
const color = ref({ r: 56, g: 189, b: 248 });
const rotateDeg = ref(0);
const selectedIcon = ref<IconItem | null>(null);

const iconBaseStyle = {
  width: '30px',
  height: '30px',
};

const filteredIcons = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return icons;
  return icons.filter(item => item.name.toLowerCase().includes(kw) || item.path.toLowerCase().includes(kw));
});

const colorHexString = computed(() => rgbToHex(color.value));
const colorRgbString = computed(() => rgbToString(color.value));

const colorValue = computed(() => (colorFormat.value === 'hex' ? colorHexString.value : colorRgbString.value));

const colorInputValue = computed({
  get() {
    return colorFormat.value === 'hex' ? colorHexString.value : colorRgbString.value;
  },
  set(value: string) {
    const parsed = colorFormat.value === 'hex' ? hexToRgb(value) : rgbTextToRgb(value);
    if (parsed) color.value = parsed;
  },
});

const colorHexPicker = computed({
  get() {
    return colorHexString.value;
  },
  set(value: string) {
    const parsed = hexToRgb(value);
    if (parsed) color.value = parsed;
  },
});

const previewIconStyle = computed(() => {
  const deg = Number.isFinite(rotateDeg.value) ? rotateDeg.value : 0;
  return {
    width: '80px',
    height: '80px',
    color: colorValue.value,
    transform: \`rotate(\${deg}deg)\`,
  };
});

const styleString = computed(() => {
  const deg = Number.isFinite(rotateDeg.value) ? rotateDeg.value : 0;
  return \`fill:\${colorValue.value};transform:rotate(\${deg}deg);\`;
});

function getSymbolId(name: string): string {
  return '#icon-' + name;
}

async function copy(text: string) {
  try {
    await navigator.clipboard?.writeText(text);
    copied.value = text;
    setTimeout(() => (copied.value = ''), 1500);
  } catch (err) {
    console.error('copy failed', err);
  }
}

function selectIcon(item: IconItem) {
  selectedIcon.value = item;
}

function copyPath(path: string) {
  copy(path);
}

function copyCode(name: string) {
  copy(\`<SvgIcon name="\${name}" size="28" />\`);
}

function copyStyle() {
  copy(styleString.value);
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }): string {
  return (
    '#' +
    [r, g, b]
      .map(v => {
        const clamped = Math.min(255, Math.max(0, Math.round(v)));
        return clamped.toString(16).padStart(2, '0');
      })
      .join('')
  );
}

function rgbToString({ r, g, b }: { r: number; g: number; b: number }): string {
  const clamp = (v: number) => Math.min(255, Math.max(0, Math.round(v)));
  return \`rgb(\${clamp(r)}, \${clamp(g)}, \${clamp(b)})\`;
}

function hexToRgb(value: string): { r: number; g: number; b: number } | null {
  const hex = value.trim().replace('#', '');
  if (![3, 6].includes(hex.length)) return null;
  const normalized = hex.length === 3 ? hex.split('').map(ch => ch + ch).join('') : hex;
  const num = Number.parseInt(normalized, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbTextToRgb(value: string): { r: number; g: number; b: number } | null {
  const match = value
    .trim()
    .replace(/\s+/g, '')
    .match(/^rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,[0-9.]+)?\)$/i);
  if (!match) return null;
  const [r, g, b] = match.slice(1, 4).map(Number);
  if ([r, g, b].some(v => Number.isNaN(v))) return null;
  return { r, g, b };
}

function changeRotate(delta: number) {
  const current = Number.isFinite(rotateDeg.value) ? rotateDeg.value : 0;
  rotateDeg.value = current + delta;
}
</script>

<style scoped>
:global(*),
:global(*::before),
:global(*::after) {
  box-sizing: border-box;
}
:global(body) {
  margin: 0;
  background: #0f172a;
  color: #e2e8f0;
  overflow-x: hidden;
}
.page {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: min(1200px, 100%);
  margin: 0 auto;
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
  width: 100%;
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
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.grid__item:hover {
  border-color: #38bdf8;
  transform: translateY(-1px);
  box-shadow: 0 10px 25px rgba(56, 189, 248, 0.15);
}
.grid__item:focus-visible {
  outline: 2px solid #38bdf8;
}
.grid__label {
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
  text-align: center;
}
.preview {
  margin-top: 18px;
  border: 1px solid #1e293b;
  background: rgba(30, 41, 59, 0.6);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.preview__row {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}
.preview__icon {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
  min-width: 160px;
}
.preview__name {
  font-size: 13px;
  color: #cbd5e1;
  word-break: break-all;
}
.preview__controls {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.color-panel {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 240px;
}
.color-panel__header {
  color: #cbd5e1;
  font-size: 13px;
}
.color-panel__inputs {
  display: flex;
  gap: 10px;
  align-items: center;
}
.input--color {
  padding: 0;
  width: 52px;
  min-width: 52px;
  height: 42px;
}
.format-toggle {
  display: inline-flex;
  border: 1px solid #1e293b;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(11, 18, 32, 0.8);
}
.format-toggle__option {
  border: none;
  background: transparent;
  color: #94a3b8;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.12s ease, color 0.12s ease;
}
.format-toggle__option + .format-toggle__option {
  border-left: 1px solid #1e293b;
}
.format-toggle__option.active {
  background: rgba(56, 189, 248, 0.12);
  color: #e2e8f0;
}
.preview__controls label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: #cbd5e1;
  font-size: 13px;
  min-width: 180px;
}
.input {
  padding: 10px 12px;
  border: 1px solid #1e293b;
  background: #0b1220;
  color: #e2e8f0;
  border-radius: 8px;
}
.input:focus {
  outline: 2px solid #38bdf8;
  border-color: transparent;
}
.preview__path {
  font-size: 12px;
  color: #94a3b8;
  word-break: break-all;
  background: rgba(11, 18, 32, 0.8);
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 10px 12px;
}
.preview__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.preview__actions button {
  flex: 1;
  border: 1px solid #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  font-size: 14px;
}
.preview__actions button:hover {
  background: rgba(56, 189, 248, 0.2);
}
.rotate {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 220px;
}
.rotate__label {
  color: #cbd5e1;
  font-size: 13px;
}
.rotate__control {
  display: flex;
  align-items: center;
  gap: 8px;
}
.rotate__btn {
  border: 1px solid #38bdf8;
  background: rgba(56, 189, 248, 0.08);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  min-width: 56px;
  font-size: 14px;
  transition: background 0.12s ease;
}
.rotate__btn:hover {
  background: rgba(56, 189, 248, 0.2);
}
.rotate__input {
  text-align: center;
  flex: 1;
}
.rotate__input::-webkit-inner-spin-button,
.rotate__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.rotate__input[type='number'] {
  -moz-appearance: textfield;
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
