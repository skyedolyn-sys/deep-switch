# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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