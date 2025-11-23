import path from "node:path";
import { FILE_HEADER } from "../config/defaults";
import type { IconEntry } from "../types";

function previewVueTemplate(iconArray: string): string {
  return `<!-- !!! 此文件由插件自动生成，请勿手动修改 !!! -->
<template>
  <div class="layout">
    <div class="page">
      <header class="page__header">
        <div class="page__title-wrap">
          <div class="page__title">SVG Icon Preview</div>
          <a
            class="page__github-icon"
            href="https://github.com/xietiansheng/vite-plugin-svg-icon-types"
            target="_blank"
            rel="noreferrer"
            aria-label="项目 GitHub"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
          </a>
        </div>
        <div class="page__meta">{{ filteredIcons.length }} / {{ icons.length }} icons</div>
      </header>
      <div class="page__search">
        <input v-model="keyword" type="text" placeholder="搜索图标名称" />
        <button class="page__clear" @click="keyword = ''" v-if="keyword">清空</button>
      </div>
      <div class="view-toggle"> 
       <button
          type="button"
          class="view-toggle__btn"
          :class="{ active: viewMode === 'all' }"
          @click="viewMode = 'all'"
        >
          全部展示
        </button>
        <button
          type="button"
          class="view-toggle__btn"
          :class="{ active: viewMode === 'group' }"
          @click="viewMode = 'group'"
        >
          文件夹分类
        </button>
      </div>
      <div class="groups" v-if="viewMode === 'group' && groupedIcons.length">
        <section
          v-for="group in groupedIcons"
          :key="group.category"
          class="group"
        >
          <header class="group__header">
            <div class="group__title">{{ group.category }}</div>
            <div class="group__count">{{ group.items.length }} 个</div>
          </header>
          <div class="grid">
            <button
              v-for="item in group.items"
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
        </section>
      </div>
      <div v-else-if="viewMode === 'group'" class="empty">暂无匹配的图标</div>
      <div class="grid" v-if="viewMode === 'all' && filteredIcons.length">
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
      <div v-else-if="viewMode === 'all'" class="empty">暂无匹配的图标</div>
      <div v-if="copied" class="toast">已复制：{{ copied }}</div>
    </div>
    <aside class="side">
      <div class="side__header">
        <div class="side__title">图标功能</div>
        <button class="side__clear" type="button" @click="closeDrawer">清空选择</button>
      </div>
      <div v-if="selectedIcon" class="preview">
        <div class="preview__row">
          <div class="preview__icon">
            <svg aria-hidden="true" :style="previewIconStyle">
                <use
                  :href="getSymbolId(selectedIcon.name)"
                  :fill="colorValue || 'currentColor'"
                />
            </svg>
          </div>
          <div class="preview__controls">
            <div class="color-panel">
              <div class="color-panel__header">
                <span>颜色</span>
                <div class="color-panel__actions">
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
                  <button type="button" class="color-panel__reset" @click="resetColor">重置</button>
                </div>
              </div>
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
            </div>
            <div class="rotate">
              <div class="rotate__label">旋转 (°)</div>
              <div class="rotate__control">
                <button type="button" class="rotate__btn" @click="changeRotate(-45)">-45</button>
                <input
                  v-model.number="rotateDeg"
                  class="input rotate__input"
                  type="number"
                  step="45"
                />
                <button type="button" class="rotate__btn" @click="changeRotate(45)">+45</button>
              </div>
            </div>
          </div>
        </div>
        <div class="preview__path" title="图标路径">{{ selectedIcon.path }}</div>
        <div class="preview__actions">
          <button @click="copyCode(selectedIcon.name)">复制代码</button>
          <button @click="copyName(selectedIcon.name)">复制 SvgName</button>
          <button @click="copyPath(selectedIcon.path)">复制路径</button>
          <button @click="copyStyle()">复制样式</button>
        </div>
        <div class="hint">
          <div class="hint__text">
            碰到颜色改不动？有些 SVG 里写死了 <code>fill/stroke</code>，先解锁再预览会更准。
          </div>
          <a
            class="hint__link"
            href="https://xietiansheng.github.io/svg-color-unlock"
            target="_blank"
            rel="noreferrer"
          >
            去解锁颜色（SVG Color Unlock）
          </a>
        </div>
        <div v-if="svgSource" class="code-block">
          <div class="code-block__header">
            <span>SVG 源码</span>
            <button type="button" class="code-block__copy" @click="copy(svgSource)">复制源码</button>
          </div>
          <pre class="code-block__body">{{ svgSource }}</pre>
        </div>
      </div>
      <div v-else class="side__empty">点击左侧图标以预览和复制</div>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

type IconItem = { name: string; path: string; category: string };
type IconItemGroup = { category: string; items: IconItem[] };
const icons: readonly IconItem[] = ${iconArray};

const keyword = ref('');
const copied = ref('');
const colorFormat = ref<'hex' | 'rgb'>('hex');
type RGB = { r: number; g: number; b: number };
const color = ref<RGB | null>(null);
const rotateDeg = ref(0);
const selectedIcon = ref<IconItem | null>(null);
const viewMode = ref<'group' | 'all'>('all');

const iconBaseStyle = {
  width: '30px',
  height: '30px',
};

const filteredIcons = computed(() => {
  const kw = keyword.value.trim().toLowerCase();
  if (!kw) return icons;
  return icons.filter(item => item.name.toLowerCase().includes(kw) || item.path.toLowerCase().includes(kw));
});

const groupedIcons = computed<IconItemGroup[]>(() => {
  const groups: Record<string, IconItem[]> = {};
  filteredIcons.value.forEach((item) => {
    const cat = item.category || 'root';
    (groups[cat] ??= []).push(item);
  });
  return Object.entries(groups)
    .sort(([a], [b]) => {
      if (a === 'root') return -1;
      if (b === 'root') return 1;
      return a.localeCompare(b, 'zh-Hans');
    })
    .map(([category, items]) => ({ category, items }));
});

const colorHexString = computed(() => (color.value ? rgbToHex(color.value) : ''));
const colorRgbString = computed(() => (color.value ? rgbToString(color.value) : ''));

const colorValue = computed(() => {
  if (!color.value) return '';
  return colorFormat.value === 'hex' ? colorHexString.value : colorRgbString.value;
});

const colorInputValue = computed({
  get() {
    if (!color.value) return '';
    return colorFormat.value === 'hex' ? colorHexString.value : colorRgbString.value;
  },
  set(value: string) {
    if (!value.trim()) {
      color.value = null;
      return;
    }
    const parsed = colorFormat.value === 'hex' ? hexToRgb(value) : rgbTextToRgb(value);
    if (parsed) color.value = parsed;
  },
});

const colorHexPicker = computed({
  get() {
    return colorHexString.value || '#000000';
  },
  set(value: string) {
    const parsed = hexToRgb(value);
    if (parsed) color.value = parsed;
  },
});

const previewIconStyle = computed(() => {
  const deg = Number.isFinite(rotateDeg.value) ? rotateDeg.value : 0;
  const fillValue = colorValue.value || 'currentColor';
  return {
    width: '80px',
    height: '80px',
    color: fillValue,
    transform: \`rotate(\${deg}deg)\`,
  };
});

const styleString = computed(() => {
  const deg = Number.isFinite(rotateDeg.value) ? rotateDeg.value : 0;
  const parts = [];
  if (colorValue.value) parts.push(\`fill:\${colorValue.value};\`);
  parts.push(\`transform:rotate(\${deg}deg);\`);
  return parts.join('');
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

function copyName(name: string) {
  copy(name);
}

function copyCode(name: string) {
  copy(\`<SvgIcon name="\${name}" size="28" style="\${styleString.value}" />\`);
}

function copyStyle() {
  copy(styleString.value);
}

function resetColor() {
  color.value = null;
  colorFormat.value = 'hex';
}

function closeDrawer() {
  selectedIcon.value = null;
}

function normalizeRotation(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value >= 360 || value <= -360) return 0;
  return value;
}

watch(rotateDeg, (val) => {
  const normalized = normalizeRotation(val);
  if (normalized !== val) {
    rotateDeg.value = normalized;
  }
});

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
  rotateDeg.value = normalizeRotation(current + delta);
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
.layout {
  min-height: 100vh;
  display: flex;
  gap: 16px;
  padding: 16px;
  align-items: flex-start;
}
.page {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  background: rgba(11, 18, 32, 0.6);
  border: 1px solid #1e293b;
  border-radius: 14px;
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
.page__title-wrap {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.page__github-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid #1e293b;
  background: rgba(56, 189, 248, 0.1);
  color: #e2e8f0;
  text-decoration: none;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.page__github-icon:hover {
  background: rgba(56, 189, 248, 0.2);
  border-color: rgba(56, 189, 248, 0.5);
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
.side {
  width: min(520px, 40vw);
  background: rgba(11, 18, 32, 0.9);
  border: 1px solid #1e293b;
  border-radius: 14px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 16px;
  max-height: calc(100vh - 32px);
  overflow: auto;
}
.side__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e2e8f0;
}
.side__title {
  font-size: 16px;
  font-weight: 600;
}
.side__clear {
  border: 1px solid #1e293b;
  background: rgba(15, 23, 42, 0.8);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
}
.side__clear:hover {
  background: rgba(56, 189, 248, 0.12);
}
.side__empty {
  color: #94a3b8;
  font-size: 13px;
}
.hint {
  border: 1px solid #1e293b;
  background: rgba(56, 189, 248, 0.08);
  color: #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hint__text {
  font-size: 12px;
  line-height: 1.5;
}
.hint__link {
  align-self: flex-start;
  color: #38bdf8;
  text-decoration: none;
  font-size: 13px;
  border: 1px solid rgba(56, 189, 248, 0.4);
  padding: 6px 10px;
  border-radius: 8px;
  background: rgba(56, 189, 248, 0.12);
}
.hint__link:hover {
  background: rgba(56, 189, 248, 0.2);
}
.view-toggle {
  display: inline-flex;
  border: 1px solid #1e293b;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(11, 18, 32, 0.8);
  width: fit-content;
}
.view-toggle__btn {
  border: none;
  background: transparent;
  color: #94a3b8;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.12s ease, color 0.12s ease;
}
.view-toggle__btn + .view-toggle__btn {
  border-left: 1px solid #1e293b;
}
.view-toggle__btn.active {
  background: rgba(56, 189, 248, 0.12);
  color: #e2e8f0;
}
.side .preview {
  margin: 0;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 12px;
  width: 100%;
}
.groups {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid #1e293b;
  border-radius: 12px;
  background: rgba(11, 18, 32, 0.5);
}
.group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #cbd5e1;
  font-size: 13px;
}
.group__title {
  font-weight: 600;
}
.group__count {
  color: #94a3b8;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  color: #cbd5e1;
  font-size: 13px;
}
.color-panel__actions {
  display: flex;
  align-items: center;
  gap: 8px;
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
.color-panel__reset {
  border: 1px solid #1e293b;
  background: rgba(11, 18, 32, 0.8);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.12s ease, border-color 0.12s ease;
}
.color-panel__reset:hover {
  background: rgba(56, 189, 248, 0.08);
  border-color: rgba(56, 189, 248, 0.6);
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
  gap: 18px;
  padding-top: 8px;
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
  const toCategory = (filePath: string): string => {
    const normalized = filePath.replace(/\\/g, "/");
    const parts = normalized.split("/").filter(Boolean);
    if (parts.length < 2) return "root";
    return parts[parts.length - 2] || "root";
  };
  const iconArray =
    sorted.length === 0
      ? "[] as const"
      : `[\n${sorted
          .map((n) => {
            const category = toCategory(n.path).replace(/'/g, "\\'");
            return `  { name: '${n.name}', path: '${n.path}', category: '${category}' },`;
          })
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
