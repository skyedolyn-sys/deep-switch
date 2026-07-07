# Contributing to Deep Switch

Welcome! Deep Switch is a small, opinionated Electron app, and contributions
of all sizes are welcome — bug reports, preset additions, locale strings,
docs, and code refactors.

This guide covers the basics. Anything more involved (new IPC channels,
storage schema changes, major UI rework) — please open an issue first so we
can agree on direction before you spend time on a patch.

## Setup

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

`npm run dev` starts the main process and the Vite dev server side-by-side
with `concurrently`. The Electron window will open automatically once Vite is
ready. Edits to TypeScript files in `src/main/` hot-reload the main process;
edits in `src/renderer/` hot-reload the window. A full app restart is only
needed when changing the preload bridge.

Build the production bundle:

```bash
npm run build      # tsc + vite build
npm run pack       # build an unpacked Electron app under ./dist
```

## Project Layout

```
src/
├── main/                Electron main process (lives where Node APIs are usable)
│   ├── index.ts         App lifecycle: window, tray, IPC wiring, locale lookup
│   ├── presets.ts       Built-in provider presets (DeepSeek, OpenAI, …)
│   ├── provider-manager.ts   Pure persistence + apply-to-DeepCode logic
│   ├── health-check.ts  `/v1/chat/completions` ping + `/v1/models` fetch
│   ├── quota.ts         Vendor-specific quota scraping (best-effort)
│   └── vendors.ts       Guess vendor display name from base URL
├── preload/             `contextBridge` surface exposed as `window.deepSwitch`
├── renderer/            React UI
│   ├── App.tsx          State ownership + view composition
│   ├── components/      ProviderCard, ProviderDetail, PresetSelector
│   ├── locales/         zh.json, en.json — i18next bundles
│   ├── i18n.ts          i18next init + language detector
│   └── global.css       Tokens + component styles
public/                  Static icons (tray, dock, sidebar)
build/                   Electron-builder assets (icon.icns, etc.)
docs/                    User-facing docs (README.zh-CN.md, etc.)
```

## Where to Add a New Provider Preset

Edit `src/main/presets.ts` and append an entry to `BUILTIN_PRESETS`. Each
preset is one `(vendor, baseUrl)` pair. If the same vendor serves through
several endpoints (e.g. Moonshot CN vs Kimi Code), define one preset per
endpoint — the `cardSuffix` field is what distinguishes them visually in the
card grid.

Two fields you **must** populate:

- `description` — shown in Simplified Chinese.
- `descriptionEn` — shown in English.

Both fields are required so the card reads correctly regardless of UI
language. Optional fields:

- `hint` / `hintEn` — a short note like `Get key at platform.deepseek.com
  (sk- prefix)`.
- `cardSuffix` / `cardSuffixEn` — appended to the vendor name when displayed
  in the card. **Stripped from the saved provider name** so multi-variant
  vendors still get unique saved records.
- `contextWindow` — token limit; shown as a tooltip / hint if present.

If the provider uses a non-OpenAI request format, set `apiFormat:
'anthropic'`. As of v0.1 the renderer only shows presets with `apiFormat:
'openai'`, so an Anthropic preset will currently be invisible in the modal —
file an issue first.

## Where to Translate

Translation strings live in `src/renderer/locales/zh.json` and
`en.json`. They are flat-ish nested JSON consumed by `react-i18next` via the
`useTranslation` hook; call sites use `t('section.key')` or
`t('section.key', { count: N })`.

### Missing-key fallback

i18next is configured with `fallbackLng: 'en'`. If you add a key to
`zh.json` and forget to add it to `en.json`, English users will still see the
English string because:

- i18next looks up the key in the current locale (`zh` or `en`).
- If missing, it falls back to `en`.
- If the key is missing in `en` too, i18next returns the dotted key path
  itself (`settings.someNewKey`) — so missing keys are visually obvious in
  the UI as literal dotted strings.

Before shipping a translation PR, run the UI in the affected language and
eyeball every screen. Anything showing a literal dotted path is a missing
key. Don't ship with English fallbacks that show through in zh mode — fill
in both files in the same patch.

There is no `keys.ts`/type generation step in this project. The convention
is to mirror keys by hand between the two locale files.

## Pull Request Checklist

Before opening a PR, please confirm:

- [ ] `npm run lint` is clean.
- [ ] `npm run build` succeeds (both `build:main` and `build:renderer`).
- [ ] You have run the app via `npm run dev` and exercised the affected
      feature with at least one **preset** end-to-end (not just unit-level
      assertions).
- [ ] Any new preset has **both** `description` and `descriptionEn` filled in.
- [ ] Any new locale key has been added to **both** `zh.json` and `en.json`.
- [ ] Any change to IPC channels updates `src/preload/index.ts` *and* the
      renderer-side types in `App.tsx`. (We don't ship an IPC contract test
      yet, so this is on you.)
- [ ] You did not commit `~/.deep-switch/config.json` or
      `~/.deepcode/settings.json`. (Check `.gitignore` — they shouldn't be
      tracked anyway.)
- [ ] Commit message uses [Conventional Commits](https://www.conventionalcommits.org/)
      format (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, etc.).

## Style

A short list, in priority order:

- **TypeScript strict.** New code should compile cleanly under the existing
  `tsconfig.json`. Don't sprinkle `any` to make errors disappear.
- **Prefer immutability.** `src/main` and `src/renderer` both use immutable
  update patterns. Use spread for state transitions; don't mutate props or
  pulled-from-store records.
- **Functions ≤ 50 lines.** If a function grows past that, split it.
- **Files ≤ 800 lines.** `src/renderer/global.css` is the exception, by
  design — it's our single design-token source.
- **No `console.log` in shipped code.** `console.error` is fine for genuine
  main-process failures.
- **No silent error swallowing.** Catch blocks must either log or rethrow.
- **No magic numbers.** Pull thresholds, retries, and timeouts into named
  constants.

The full house style lives in `~/.claude/rules/common/coding-style.md` and
the web-specific extension in `~/.claude/rules/web/`.

## Code of Conduct

> **Work in progress.** A `CODE_OF_CONDUCT.md` has not yet been published for
> this project. Until it is, please follow the spirit of the
> [Contributor Covenant](https://www.contributor-covenant.org/) — be
> respectful, assume good faith, prioritise the issue over the ego.
>
> If you have concerns about behaviour in this project's spaces, email the
> maintainers privately rather than airing them in issues or PR comments.

## Questions?

Open a discussion, or an issue with the `question` label. Maintainers read
both.
