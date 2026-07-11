# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.1] - 2026-07-11

### Added

- **「启动 Deep Code」按钮** — 侧边栏底部一键拉起终端运行 `deepcode`。未安装时自动在终端里可见地执行 `npm install -g @vegamo/deepcode-cli` 后再启动；未检测到 Node.js 时打开平台安装指引。工作目录沿用 settings 中的 workDir（首次使用自动写入）。
- **Gatekeeper 自救工具内置** — dmg / zip 内附「双击我解除限制.command」脚本与中英安装说明，双击即可执行 `xattr -cr` 解除隔离，无需手敲终端。
- **macOS 资产补全 zip** — release.yml 增加 ditto 打包步骤，mac 资产从此 dmg + zip 齐全。

### Changed

- **安装方式全面转向 Homebrew 优先** — 五种语言 README 均改为推荐 `brew install --cask skyedolyn-sys/deep-switch/deep-switch`（brew 下载不带隔离属性，`brew upgrade` 即可更新）。
- **签名脚本版本自感知** — `scripts/sign-mac.mjs` 从 `tauri.conf.json` 读取版本号生成资产文件名，发版无需再改脚本。

### Fixed

- **macOS 构建产物缺 preset** — 同一份 commit 在 GitHub Actions macos-latest runner 上编出的二进制只有 9/12 个服务商预设（缺 SenseNova + 清华两条），本地构建 12/12 正常。根因查明前，mac 产物一律走本地构建 + 签名上传。

## [0.1.0] - 2026-07-10

### Changed

- **Regenerated v0.1.0 release** with the latest main (commit 6886d90). Includes the tray hide-on-close fix, active-provider-changed event sync, all presets since v0.1.0 (清华 DeepSeek-R1 with 671B/32B model selector, 商汤 SenseNova), connection-test fast path, SSE warning chunks during retry, and the ♻️ refactor of the Tsinghua proxy stream handler + shared Rust helpers.
- **Added Windows + Linux bundles** to the release (previously mac-only). The release.yml GitHub Actions workflow now produces .msi/.exe (Windows) and .deb/.AppImage (Linux) alongside the mac .dmg/.zip.

## [0.1.0] - 2026-07-09

### Added

- **Tauri 2 architecture** — full migration from Electron to a Tauri 2 shell with a Rust backend (`src-tauri/`) and a React + Vite renderer. 15 `#[tauri::command]` IPC handlers cover providers, presets, tests, models, settings, and Deep Code config.
- **Material 3 dark UI** — single-column responsive layout with hairline borders, 880×620 window (min 680×480, resizable), `prefers-color-scheme` aware light/dark theming.
- **LobeHub brand tiles** — vendor logo avatars use `@lobehub/icons` Color sub-component for DeepSeek (blue), OpenAI (black), Kimi (black), Zhipu (blue), MiniMax (pink→orange gradient), Qwen (indigo), etc.
- **Minimal "Add Provider" preset selector** — compact cards (32px brand tile + name + "API 官网" pill that opens the vendor's homepage in a new tab). Strips all model id / description / hint noise.
- **`homepageUrl` per preset** — clicking the "API 官网" pill opens the vendor's pricing/key page (`platform.deepseek.com`, `platform.moonshot.cn`, `open.bigmodel.cn`, etc.).
- **macOS menu-bar template icon** — tray icon marked `icon_as_template(true)` so macOS auto-inverts black silhouettes to white on the dark menu bar.
- **Mock fallback for browser preview** — `src/renderer/mock.ts` seeds 7 providers (DeepSeek R1, DeepSeek V4 Pro, OpenAI GPT-4o, Kimi K2.7 Code, Internal Proxy, MiniMax abab, Qwen3 Max) with version-gated localStorage refresh.

### Changed

- **Sidebar logo** — replaced the inline DeepSeek whale silhouette with a minimal "two nodes + line + chevron" switch mark (4 SVG primitives, monochrome, currentColor-driven).
- **`tsconfig.json`** — `noUnusedLocals` and `noUnusedParameters` flipped to `true` so future dead imports fail the build instead of silently accumulating.
- **Locale strings** — replaced hardcoded Chinese in the "thinking off" status with proper `provider.status.thinkingOff` i18n key (zh: 思考已禁用 / en: Thinking off).

### Removed

- **Electron source tree** — `src/main/` (6 files, ~1100 LOC), `src/preload/index.ts`, `tsconfig.main.json`. None of the React renderer or Tauri Rust code referenced these.
- **Electron-packaging scripts** — `scripts/build-mac.sh`, `scripts/sign-mac.sh`, `scripts/generate-icons.py`, the `build/` directory, and 8 `*:electron*` npm scripts.
- **Electron dependencies** — `electron`, `electron-builder`, `electron-store`, `concurrently`, `uuid`, `@types/express`, `@types/uuid` removed from `package.json`.
- **Dead code chain** — `handleToggleThinking` / `handleSetEffort` in App.tsx, the corresponding `onToggleThinking` / `onSetEffort` props on ProviderCard, and 6 i18n keys (`toast.thinkingEnabled`, `toast.thinkingDisabled`, `toast.effortSet` in en + zh) — no UI ever invoked them.
- **DeepSeek branding in renderer** — 13 `public/icons/deepseek-*` files (Electron-packaging residue). The single file still referenced by the macOS menu-bar tray was renamed `deepseek-tray-template.png` → `tray-template.png` and the path in `src-tauri/src/lib.rs:600-601` updated accordingly.

### Fixed

- `App.tsx:152` `|| true` in `handleDetect`'s matched-providers check made the condition always succeed — removed the escape hatch.
- `Sparkle.tsx` was rendering `#1a1a1e` text on a near-`#0a0a0a` background (invisible) — changed to `text-white/30` so the rotating accent is actually visible.
- The DeepSeek whale SVG path embedded in `App.tsx:238` (the in-DOM brand mark) was the wrong company's logo for a project called "Deep Switch" — replaced with a project-original switch mark.

## [0.1.0] - 2026-07-07

### Added

- Tray and dock icon support for macOS
- Hide-to-tray behavior on window close for macOS
- Provider CRUD operations: add, edit, delete, and set active provider
- 14 builtin presets covering DeepSeek, Moonshot, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, and Groq
- Quick-switch from the tray menu
- Model picker that lists models from a provider's `/v1/models` endpoint
- Thinking mode toggle (high and max reasoning effort)
- Automatic detection of the current Deep Code configuration with one-click import
- Auto-creation of `~/.deepcode/settings.json` when missing
- Bilingual UI (Simplified Chinese and English) with auto-detect from system language and manual override
- Live updates to `~/.deepcode/settings.json` with no app restart required
- Localized preset descriptions in zh and en

### Security

- API keys stored only in `~/.deep-switch/config.json`, never uploaded
- No telemetry or analytics