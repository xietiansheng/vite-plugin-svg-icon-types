# Vite Plugin: svg-icon-types

自动扫描 SVG 目录，生成类型声明和可视化预览页面的 Vite 插件。用来给类似 `SvgIcon` 组件的 `name` 属性提供字面量类型提示，同时提供一个无需额外配置的图标预览/复制界面。

## 功能

- 扫描目录：默认 `src/assets/svg`，递归收集 `.svg`
- 类型声明：生成 `src/types/generated-svg-names.d.ts`，按字典序输出 union
- 预览页面：生成 `src/icon-preview/generated-preview.vue`、`src/icon-preview/main.ts`、`icon-preview.html`
- 多入口：自动把 `icon-preview.html` 注入 Vite/Rollup `input`
- Watch：dev 时监听 SVG 变更，自动重生成
- 防抖写入：内容不变不重写，避免 HMR 死循环

## 安装

```
pnpm add -D svg-icon-types
# 或 npm/yarn
```

## 使用

```ts
// vite.config.ts
import svgIconTypes from "svg-icon-types";

export default defineConfig({
  plugins: [svgIconTypes()],
});
```

启动 dev：`pnpm dev`，访问 `http://localhost:5173/icon-preview.html`（按你的 host/port 调整）。

## 预览页能力

- 搜索：按名称或相对路径（不含 .svg）
- Tooltip：悬停显示文件路径，提供“复制名称”“复制代码”按钮
- 点击条目：复制名称
- 统计：显示过滤后/总数

## 默认生成的文件

- `src/types/generated-svg-names.d.ts`
- `src/icon-preview/generated-preview.vue`
- `src/icon-preview/main.ts`
- `icon-preview.html`（作为多入口）

## 可选配置

```ts
svgIconTypes({
  iconsDir: "src/assets/svg", // 扫描目录
  output: "src/types/generated-svg-names.d.ts", // 类型输出
  previewVueOutput: "src/icon-preview/generated-preview.vue",
  previewMainOutput: "src/icon-preview/main.ts",
  previewHtmlOutput: "icon-preview.html",
  debounceMs: 100,
});
```

## 约定

- 图标名称由文件相对路径用 `-` 连接得到（目录/文件名中的 `/` -> `-`），去掉 `.svg`
- 需在项目中有一个组件 `<SvgIcon :name="SvgIconName" />`，配合 `virtual:svg-icons-register` 等雪碧图注册方式使用

## 开发/发布

- 核心在 `vite/plugins/svg-icon-types.ts`
- 使用 Node `fs/promises`，无外部依赖
- 如果以 esbuild 打包，请把 `type` 保持为 `module` 或使用 `esm` 输出；需将模板字符串中的反引号和换行保持原样
