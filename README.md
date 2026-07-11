# Deep Switch

> One-click menu-bar utility to swap AI providers for the **Deep Code** CLI.
> Switch in seconds. No config editing. No restart.

---

## Download

**Latest stable:** [v0.1.0](../../releases/latest)

| Platform | Download | Size |
|---|---|---|
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.dmg`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.dmg) | ~5 MB |
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.zip`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.zip) | ~5 MB |
| macOS (Intel) | [`deep-switch_0.1.0_x64.dmg`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64.dmg) | ~5 MB |
| Linux (deb) | [`deep-switch_0.1.0_amd64.deb`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.deb) | ~6 MB |
| Linux (AppImage) | [`deep-switch_0.1.0_amd64.AppImage`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.AppImage) | ~80 MB |
| Windows (MSI) | [`deep-switch_0.1.0_x64_en-US.msi`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64_en-US.msi) | ~5 MB |
| Windows (NSIS .exe) | [`deep-switch_0.1.0_x64-setup.exe`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64-setup.exe) | ~5 MB |

> ⚠️ **The macOS build is ad-hoc signed with hardened runtime, but not notarized.** Apple Silicon users on macOS 15 Sequoia should see no Gatekeeper prompt. On older macOS, or if Gatekeeper still blocks, run once: `xattr -cr /Applications/deep-switch.app` then re-launch from Finder (right-click → **Open** if it still complains). We will switch to a notarized release once we have a verified Apple Developer ID.
>
> Linux: AppImage is portable (no install); `.deb` for Debian/Ubuntu. Windows: MSI for system-wide install, NSIS `.exe` for portable per-user.

---

## Languages

- [English](./README.md)
- [简体中文](./docs/README.zh-CN.md)
- [繁體中文](./docs/README.zh-TW.md)
- [日本語](./docs/README.ja.md)
- [한국어](./docs/README.ko.md)

---

<div align="center">

```
██████╗  ███████╗███████╗██████╗     ███████╗██╗    ██╗██╗████████╗ ██████╗██╗  ██╗
██╔══██╗██╔════╝██╔════╝██╔══██╗    ██╔════╝██║    ██║██║╚══██╔══╝██╔════╝██║  ██║
██║  ██║█████╗  █████╗  ██████╔╝    ███████╗██║ █╗ ██║██║   ██║   ██║     ███████║
██║  ██║██╔══╝  ██╔══╝  ██╔═══╝     ╚════██║██║███╗██║██║   ██║   ██║     ██╔══██║
██████╔╝███████╗███████╗██║         ███████║╚███╔███╔╝██║   ██║   ╚██████╗██║  ██║
╚═════╝ ╚══════╝╚══════╝╚═╝         ╚══════╝ ╚══╝╚══╝ ╚═╝   ╚═╝    ╚═════╝╚═╝  ╚═╝
```

**Provider switcher for Deep Code CLI — written for the way you actually work.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#download)
[![Tauri 2](https://img.shields.io/badge/tauri-2-FFC131)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
[![Rust](https://img.shields.io/badge/rust-stable-orange)](https://www.rust-lang.org)
[![Release](https://img.shields.io/github/v/release/skyedolyn-sys/deep-switch)](../../releases/latest)
[![CI](https://img.shields.io/github/actions/workflow/status/skyedolyn-sys/deep-switch/ci.yml)](../../actions)

</div>

---

## What is Deep Switch?

Deep Switch is a tiny menu-bar / dock utility for macOS (plus a tray utility on Linux & Windows) that edits `~/.deepcode/settings.json` so the **Deep Code** CLI can instantly switch which AI provider it's talking to. Add a provider once, then flip between them with a single click — without ever opening a JSON file.

It is a mirror / interchangeable utility *for* Deep Code: it never modifies Deep Code itself, only the config the CLI reads on the next call.

---

## Screenshots

> Coming soon — see [`docs/screenshots/`](./docs/screenshots) for the placeholder. Drop a PNG of the main window there and it'll be embedded automatically.

---

## Why?

Working with multiple providers shouldn't feel like juggling keys.

- 🧩 **Too many providers, too many keys** — DeepSeek, Moonshot, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq, SenseTime SenseNova, Tsinghua DeepSeek-R1… each with its own base URL, model name and quirks.
- 📝 **Manual `settings.json` editing** — easy to typo a key, easy to leave a stray comma that breaks the file.
- 🐢 **Slow switching** — quit the CLI, edit the file, relaunch, wait, repeat.
- 💾 **Lost backup state** — overwrite the file and your old config is gone forever.
- 🔁 **Repetition** — every new project means the same dance.

Deep Switch collapses all of that into a one-click action.

---

## Features

- ⚡ **One-click activation** — pick a provider, click *Enable*, done.
- 📦 **Preset coverage** — DeepSeek · Moonshot/Kimi · Zhipu GLM · MiniMax · ByteDance Doubao · SiliconFlow · OpenRouter · OpenAI · Groq · SenseTime SenseNova · Tsinghua DeepSeek-R1 (671B full + 32B distilled, both selectable in the preset card), plus a fully customizable *Custom* slot.
- 🔄 **Live apply** — edits `~/.deepcode/settings.json` directly. The next call your CLI makes already uses the new provider. **No restart needed.**
- 🌐 **OpenCode sync** — also writes the equivalent provider to `~/.config/opencode/opencode.json` so the opencode-ai CLI can use it through its `@ai-sdk/openai-compatible` adapter. Same provider, two clients.
- 🧠 **Model picker** — fetches the live model list from a provider's `/v1/models` endpoint so you're always picking from what's actually available.
- 🤔 **Thinking mode toggle** — enable chain-of-thought and pick the reasoning depth: `high` or `max`.
- 🛰️ **Campus / WAF-tolerant proxy** — for providers behind strict WAFs (e.g. Tsinghua's madmodel.cs.tsinghua.edu.cn), Deep Switch spawns an embedded Node.js helper (`scripts/tsinghua-proxy.mjs`) that auto-retries on transient 404s, splits `<think>` reasoning into a separate `reasoning_content` delta, and streams warning chunks back to the client so the CLI never appears hung while retrying.
- 🪟 **Hide-to-tray on close** — closing the window keeps the app alive in the menu bar; right-click the tray icon to quit.
- 🌐 **Bilingual UI** — Simplified Chinese and English, with automatic detection of system locale and a manual override.
- 📌 **Tray menu quick-switch** — right-click the tray icon to flip providers without opening the window; labels follow your UI language; state syncs back to the main window via an `active-provider-changed` event.
- 🪄 **First-time "Detect current config" import** — reads whatever Deep Code is currently configured for and turns it into a saveable provider with one click.
- 🔒 **Local-only credentials** — stored in `~/.deep-switch/config.json` with `0600` permissions. Never uploaded, never synced, never logged.
- 🎯 **Health checks** — optional lightweight probe of the provider's base URL so you know before the CLI does.
- 🪶 **Lightweight** — single tray icon, system webview, ~12 MB on disk. No bundled Chromium, no background daemon.

---

## How it works

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  Preset / Custom │  ───▶  │  Click "Enable"        │  ───▶  │  ~/.deepcode/        │
│  provider list   │        │  in the main window    │        │  settings.json       │
│  (DeepSeek,      │        │  or the tray menu      │        │  is rewritten on     │
│  Moonshot, …)    │        │                        │        │  disk.               │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  Next Deep Code CLI call │
                                                            │  reads the new settings  │
                                                            │  and talks to the chosen │
                                                            │  provider.               │
                                                            └──────────────────────────┘
```

Four steps, end to end:

1. **Add** a provider (pick a preset or paste your own base URL + key).
2. **Enable** it from the main window or the tray menu.
3. Deep Switch writes the new `settings.json` via the Tauri Rust main process.
4. The next time you call the Deep Code CLI, it loads the file you just saved.

That's the whole loop.

---

## Installation

### macOS (recommended)

Download the latest `.dmg` from the [Releases](../../releases) page and drag **Deep Switch** into your Applications folder.

> The first time you launch from the DMG, you may need to right-click → *Open* to clear the Gatekeeper prompt, since the build is unsigned.

### Linux & Windows

First-party installers are now available — see the [Download](#download) table at the top.

**Linux — which file?**

- **`.deb`** (Debian / Ubuntu): ~4 MB, system-wide install, requires `sudo`. Pulls WebKitGTK from your system via `apt`. Install with `sudo dpkg -i deep-switch_0.1.0_amd64.deb` (or double-click in most desktop file managers).
- **`.AppImage`** (any distro, no root): ~80 MB, fully self-contained — bundles its own WebKitGTK so it runs on Arch / Fedora / openSUSE without installing extra system libraries. Just `chmod +x deep-switch_0.1.0_amd64.AppImage && ./deep-switch_0.1.0_amd64.AppImage`, or double-click. The size is the cost of portability: every dependency travels inside the file.

If you'd rather run from source:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run tauri dev
```

---

## Development

Requirements: **Node.js 20+** and **Rust 1.77+** (Tauri 2 toolchain).

```bash
# Clone
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# Install JS deps (uses your local repo's lockfile)
npm install

# Dev mode — runs Vite + Tauri with HMR
npm run tauri dev
# Or renderer-only (browser preview, no Tauri):
npm run dev:renderer

# Type-check (renderer)
npx tsc --noEmit

# Production build for your platform
npm run tauri build

# Lint
npm run lint
```

`npm run tauri dev` boots Vite on `http://localhost:5173` and launches a Tauri WebView window pointing at it — you get hot reload on the renderer and a Rust recompile whenever you change `src-tauri/src/**`.

---

## Tech stack

| Layer            | Tooling                                          |
| ---------------- | ------------------------------------------------ |
| Shell            | **Tauri 2** (uses the system WebView)            |
| Renderer         | **React 18** + **TypeScript 5** + **Vite 5**    |
| Native backend   | **Rust 1.77+** (serde, reqwest, tauri-plugin-log) |
| WAF helper       | Embedded **Node.js** subprocess (`scripts/tsinghua-proxy.mjs`) spawned only when you switch to a WAF-protected provider; transparent retry + SSE streaming |
| i18n             | **i18next** + `i18next-browser-languagedetector` |
| Vendor icons     | **@lobehub/icons** (open-source SVG brand pack)  |
| Local store      | `~/.deep-switch/config.json` (JSON, atomic write) |
| Persistence      | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` + `~/.config/opencode/opencode.json` |

---

## Project structure

```
deep-switch/
├── src/
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/         # ProviderCard, PresetSelector, ProviderDetail, …
│       ├── lib/                # vendor-icons.tsx (shared module)
│       ├── locales/            # en.json, zh.json
│       ├── i18n.ts
│       └── global.css
├── src-tauri/                   # Tauri Rust backend
│   ├── src/
│   │   ├── main.rs             # Tauri entrypoint
│   │   └── lib.rs              # 15 #[tauri::command] IPC + tray + db
│   ├── icons/                   # App icon set
│   ├── capabilities/           # Tauri security policy
│   ├── tauri.conf.json         # Window config, identifier, bundle settings
│   └── Cargo.toml
├── public/                      # Static assets (tray icon, etc.)
├── docs/                        # Translations & extra docs
├── .github/workflows/           # CI + release
│   ├── ci.yml
│   └── release.yml
├── tsconfig.json                # Renderer TS config
└── vite.config.mts
```

---

## Contributing

PRs welcome — keep them focused.

1. Fork the repo and create a topic branch (`feat/<short-name>`, `fix/<short-name>`).
2. Run `npm run lint` and `npx tsc --noEmit` before pushing.
3. Open a PR describing the **why**, not just the *what*.

When adding **provider presets**, edit `src-tauri/src/lib.rs` (`get_builtin_presets`) — keep the `description` / `descriptionEn` (and platform / hint / homepageUrl) fields in sync for both locales.
When adding **translations**, edit `src/renderer/locales/en.json` and `src/renderer/locales/zh.json` and make sure the keys match exactly.

---

## Security & Privacy

- 🔐 **API keys live in `~/.deep-switch/config.json`** on your local machine. They are never sent to us. There is no "us" — Deep Switch has no backend.
- 🚫 **No analytics, no telemetry, no crash reporting.** No third-party scripts, no remote config fetches.
- 🌐 **The only network traffic Deep Switch itself generates** is the optional `/v1/models` fetch when you open the model picker, and an optional health check — both go straight from your machine to the provider you picked.
- 🧪 **Open-source** — every byte that runs on your machine is in this repo. Audit it.

If you find a security issue, please open a private advisory instead of a public issue.

---

## License

[MIT](./LICENSE) © 2026 Deep Switch contributors.

---

## Acknowledgments

Huge thanks to the providers whose APIs this app routes between — **DeepSeek, Moonshot / Kimi, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq, SenseTime SenseNova, Tsinghua DeepSeek-R1** — and to the maintainers of Tauri, React, Vite, Rust and i18next whose work makes this app trivial to build.
