# Deep Switch

> One-click menu-bar utility to swap AI providers for the **Deep Code** CLI.
> Switch in seconds. No config editing. No restart.

---

## Download

**Latest stable:** [v0.1.0](../../releases/latest)

| Platform | Download | Size |
|---|---|---|
| macOS (Apple Silicon) | [`Deep Switch-0.1.0-arm64-resigned.dmg`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned.dmg) | ~203 MB |
| macOS (Apple Silicon) | [`Deep Switch-0.1.0-arm64-resigned-mac.zip`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned-mac.zip) | ~183 MB |
| Linux / Windows | [Build from source](#development) | — |

> ⚠️ **The build is not signed or notarized.** macOS will show *"Deep Switch is damaged and can't be opened"* the first time. To bypass:
> 1. Open the DMG, drag **Deep Switch** into `/Applications`.
> 2. In **Finder**, navigate to `/Applications`, right-click **Deep Switch** → **Open** → confirm the dialog.
> 3. From now on, double-click works normally.
>
> Alternative (terminal): `sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> We will switch to a signed/notarized release once we have a verified Apple Developer ID. Until then, please use the workaround above.

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
[![Electron](https://img.shields.io/badge/electron-28-9feaf9)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
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

- 🧩 **Too many providers, too many keys** — DeepSeek, Moonshot, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq… each with its own base URL, model name and quirks.
- 📝 **Manual `settings.json` editing** — easy to typo a key, easy to leave a stray comma that breaks the file.
- 🐢 **Slow switching** — quit the CLI, edit the file, relaunch, wait, repeat.
- 💾 **Lost backup state** — overwrite the file and your old config is gone forever.
- 🔁 **Repetition** — every new project means the same dance.

Deep Switch collapses all of that into a one-click action.

---

## Features

- ⚡ **One-click activation** — pick a provider, click *Enable*, done.
- 📦 **Preset coverage** — DeepSeek · Moonshot/Kimi · Zhipu GLM · MiniMax · ByteDance Doubao · SiliconFlow · OpenRouter · OpenAI · Groq, plus a fully customizable *Custom* slot.
- 🔄 **Live apply** — edits `~/.deepcode/settings.json` directly. The next call your CLI makes already uses the new provider. **No restart needed.**
- 🧠 **Model picker** — fetches the live model list from a provider's `/v1/models` endpoint so you're always picking from what's actually available.
- 🤔 **Thinking mode toggle** — enable chain-of-thought and pick the reasoning depth: `high` or `max`.
- 🌐 **Bilingual UI** — Simplified Chinese and English, with automatic detection of system locale and a manual override.
- 📌 **Tray menu quick-switch** — right-click the tray icon to flip providers without opening the window; labels follow your UI language.
- 🪄 **First-time "Detect current config" import** — reads whatever Deep Code is currently configured for and turns it into a saveable provider with one click.
- 🔒 **Local-only credentials** — stored in `~/.deep-switch/config.json`. Never uploaded, never synced, never logged.
- 🛟 **Backup & restore** — every change snapshots the previous file, so a bad switch is one click away from being undone.
- 🎯 **Health checks** — optional lightweight probe of the provider's base URL so you know before the CLI does.
- 🪶 **Lightweight** — single tray icon, no background daemon, no browser engine bloat beyond what Electron needs.

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
3. Deep Switch writes the new `settings.json` on the main process side.
4. The next time you call the Deep Code CLI, it loads the file you just saved.

That's the whole loop.

---

## Installation

### macOS (recommended)

#### Homebrew (preferred)

```bash
brew install --cask deep-switch
```

#### Direct download

Grab the latest `.dmg` or `.zip` from the [Releases](../../releases) page and drag **Deep Switch** into your Applications folder.

> The first time you launch from the DMG, you may need to right-click → *Open* to clear the Gatekeeper prompt, since the build is unsigned.

### Linux & Windows

There is no first-party installer for Linux or Windows yet — but the app runs fine from source:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

For packaged binaries in the meantime, see `npm run dist` in the [Development](#development) section below.

---

## Development

Requirements: **Node.js 18+** and **npm 9+**.

```bash
# Clone
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# Install deps (uses your local repo's lockfile)
npm install

# Dev mode — runs Vite + Electron concurrently with HMR
npm run dev

# Type-check & build the main process
npm run build:main

# Type-check & build the renderer
npm run build:renderer

# Full prod build
npm run build

# Package a binary for your current platform
npm run dist

# Lint
npm run lint
```

`npm run dev` boots Vite on `http://localhost:5173` and starts Electron pointed at it — you get hot reload on the renderer and a fast restart for the main process whenever you change a TypeScript file.

---

## Tech stack

| Layer            | Tooling                                          |
| ---------------- | ------------------------------------------------ |
| Shell            | **Electron 28**                                  |
| Renderer         | **React 18** + **TypeScript 5**                  |
| Bundler (web)    | **Vite 5**                                       |
| Bundler (app)    | **electron-builder 24**                          |
| i18n             | **i18next** + `i18next-browser-languagedetector` |
| Local store      | `electron-store` (encrypted at rest by OS keychain where available) |
| Persistence      | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## Project structure

```
deep-switch/
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts            # App & tray boot
│   │   ├── presets.ts          # Built-in provider presets
│   │   ├── provider-manager.ts # CRUD for user providers
│   │   ├── vendors.ts          # Vendor metadata
│   │   ├── health-check.ts     # Optional base-URL probe
│   │   └── quota.ts            # Quota snapshots
│   ├── preload/                # contextBridge surface
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/
│       ├── locales/            # en.json, zh.json
│       ├── i18n.ts
│       └── global.css
├── build/                      # App icons
├── public/                     # Static assets
├── scripts/                    # Helper scripts
├── docs/                       # Translations & extra docs
├── electron-builder config in  # package.json → "build"
├── tsconfig.json               # Renderer TS config
├── tsconfig.main.json          # Main process TS config
└── vite.config.ts
```

---

## Contributing

PRs welcome — keep them focused.

1. Fork the repo and create a topic branch (`feat/<short-name>`, `fix/<short-name>`).
2. Run `npm run lint` and `npm run build` before pushing.
3. Open a PR describing the **why**, not just the *what*.

When adding **provider presets**, edit `src/main/presets.ts` — keep the `description` / `descriptionEn` (and platform / hint) fields in sync for both locales.
When adding **translations**, edit `src/renderer/locales/en.json` and `src/renderer/locales/zh.json` and make sure the keys match exactly.

---

## Security & Privacy

- 🔐 **API keys live in `~/.deep-switch/config.json`** on your local machine. They are never sent to us. There is no "us" — Deep Switch has no backend.
- 🚫 **No analytics, no telemetry, no crash reporting.** No third-party scripts, no remote config fetches.
- 🌐 **The only network traffic Deep Switch itself generates** is the optional `/v1/models` fetch when you open the model picker, and an optional health check — both go straight from your machine to the provider you picked.
- 🧪 **Open-source** — every byte that runs on your machine is in this repo. Audit it.
- 🧯 **Backups** — every settings write snapshots the previous `~/.deepcode/settings.json` so a bad switch is reversible.

If you find a security issue, please open a private advisory instead of a public issue.

---

## License

[MIT](./LICENSE) © 2026 Deep Switch contributors.

---

## Acknowledgments

Huge thanks to the providers whose APIs this app routes between — **DeepSeek, Moonshot / Kimi, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq** — and to the maintainers of Electron, React, Vite and i18next whose work makes this app trivial to build.
