# Manual Test Checklist — Deep Switch v0.1.0

A smoke-test pass for every release candidate. Tick each box before shipping.

Use one of these flows per item:

- **Prereq** — what state the machine and config files must be in
- **Steps** — what to do
- **Expected** — what you should see

Conventions:

- `~/.deepcode/settings.json` is the **file Deep Code reads** (the target of
  every "apply" action).
- `~/.deep-switch/config.json` is **Deep Switch's own store**.
- "Active" provider = the one Deep Switch writes into `settings.json`.

> Tip: take a backup of `~/.deepcode/settings.json` and
> `~/.deep-switch/config.json` before the run, so you can `cp` them back for
> repeatable runs. See **"New-user golden path"** below for the clean-slate
> variant.

---

## Provider CRUD

### Add from preset

- **Prereq:** app launched, no providers (or open the app with both config
  files empty).
- **Steps:**
  1. Click `+ Add Provider` in the sidebar.
  2. Pick the **DeepSeek** (V4 Pro) preset.
  3. Paste any non-empty string into the API Key field.
  4. Click `Add & Enable`.
- **Expected:**
  - Modal closes.
  - New card appears under a "DeepSeek" vendor group.
  - Card shows an `Active` / `已激活` tag.
  - Sidebar "Deep Code Config" card shows `DeepSeek` name, `https://api.deepseek.com`,
    and `deepseek-v4-pro`.
  - `~/.deepcode/settings.json` `env` block has `BASE_URL`, `API_KEY`, `MODEL`
    populated.
  - `~/.deep-switch/config.json` contains one provider record with the same
    id and the API key you entered.

### Add custom provider

- **Prereq:** app launched.
- **Steps:**
  1. `+ Add Provider` → choose `Custom (blank template)` (the "自定义" card).
  2. Fill **Name** = `Test Custom`, **Base URL** = `https://example.com/v1`,
     **Model** = `some-model`.
  3. Paste an API key.
  4. Click `Add & Enable`.
- **Expected:**
  - Same as above, but the card is not grouped under any known vendor group —
    it appears under `Custom`.
  - `~/.deepcode/settings.json` shows your custom name as the active provider
    in the sidebar.

### Edit a provider

- **Prereq:** at least one saved provider.
- **Steps:**
  1. Click the `Settings` / `⚙` icon on a card.
  2. Change the display name to `Renamed`.
  3. Click `Save` without touching the Key field.
- **Expected:**
  - Detail view closes.
  - Card name updates to `Renamed`.
  - Re-opening the detail view shows the Key field placeholder as
    `•••••••• (saved)` — confirms the stored key is preserved.

### Edit must not wipe the saved API key

- **Prereq:** a provider with a saved (non-empty) API key.
- **Steps:**
  1. Open its settings, change **only** the name, click `Save`.
  2. Click `Enable` / `Apply` to make it active.
  3. Inspect `~/.deep-switch/config.json`.
- **Expected:**
  - The provider's `apiKey` field is still the original value, not empty.
  - `~/.deepcode/settings.json` `env.API_KEY` matches.

### Duplicate-name handling

- **Prereq:** a provider named `DeepSeek` exists.
- **Steps:**
  1. `+ Add Provider` → Custom template → name it `DeepSeek`, leave other
     fields blank.
  2. Add a second one named `DeepSeek`.
- **Expected:**
  - Both records are stored (the app currently allows duplicates by design).
  - Both cards remain selectable and operable; switching does not affect the
     other one's stored credentials.

### Delete a provider

- **Prereq:** at least one saved provider.
- **Steps:**
  1. From the list, click the `🗑` icon and confirm.
  2. From the detail view, click `Delete` and confirm.
- **Expected:**
  - Card disappears.
  - If it was the active provider, sidebar returns to the empty
     "No active provider" state and the `Active` tag is gone.
  - Provider record removed from `~/.deep-switch/config.json`.

---

## Apply / Activate

- **Prereq:** at least two saved providers.
- **Steps:**
  1. Click `Enable` on Provider A. Open `~/.deepcode/settings.json`.
  2. Click `Enable` on Provider B (without restarting the app).
  3. Click `Enable` on Provider A again.
- **Expected after each click:**
  - The `env` block in `settings.json` reflects that provider's baseUrl /
     apiKey / model.
  - Only one provider carries the `Active` indicator at any time.
  - The Deep Code CLI does **not** need to be restarted — but if you have an
     existing Deep Code session, it will pick up the change on its next
     request, not retroactively.
  - Note: switching mid-session does NOT in itself interrupt a running prompt;
     each new prompt uses whichever env was current when it was issued.

---

## Tray Menu

### Open / switch / quit / language

- **Prereq:** app installed (tray icon visible in the menu bar).
- **Steps:**
  1. Click the tray icon → context menu opens.
  2. Click `Open Main Window` → main window comes to front.
  3. Click the tray icon → `Switch Provider` submenu → pick a provider.
  4. Click the tray icon → `Quit`.
- **Expected:**
  - Quitting from the tray menu fully exits the app (process no longer in
     Activity Monitor / `pgrep`).
  - On macOS, closing the main window with the red dot while the app is
     running should **not** quit it; the menu bar icon must remain. (See
     "Window hide-on-close" below.)

### Tray shows active provider with status dot

- **Prereq:** providers saved and one is marked Active.
- **Steps:**
  1. Open the tray menu.
  2. Look at the line under "Open Main Window".
- **Expected:**
  - It shows the active provider's name, vendor, and a coloured dot:
     - 🟢 green = last health check was `ok`
     - 🔴 red = last health check errored (HTTP error / timeout / invalid key)
     - 🟡 yellow = never tested
  - The `Switch Provider` submenu shows each provider; the active one is
     marked with `✓` next to its label.
  - The right-hand side of the active line shows either latency (e.g. `142ms`)
     or quota text, depending on what the provider supports.

---

## Model Picker

- **Prereq:** a provider with a real, valid API key.
- **Steps:**
  1. Click the model-name button on the card (it has a `▾` chevron).
  2. Wait for the dropdown to load.
  3. Pick a different model.
- **Expected:**
  - Dropdown opens, says "N models — click to switch".
  - Selected model becomes the card's current model.
  - If it was the active provider, `~/.deepcode/settings.json` `env.MODEL`
     updates immediately (no app restart).
  - The newly chosen model is tagged "current" in the dropdown.

### Unknown / 401 endpoint

- **Prereq:** a provider with an obviously bad key, e.g. `not-a-real-key`.
- **Steps:**
  1. Trigger `🔍 Test` on the card.
  2. Try to fetch models.
- **Expected:**
  - Test card shows `Error` with reason `API Key 无效或已过期` (or similar).
  - Fetching models surfaces the same auth-style error in the dropdown.

---

## Thinking Mode

- **Prereq:** a provider saved with `thinkingEnabled: false`.
- **Steps:**
  1. Click the `Thinking` chip on a card to toggle it on.
  2. Click the reasoning-effort `select` and choose `max`.
  3. Click `Enable` to make the provider active.
  4. Inspect `~/.deepcode/settings.json`.
- **Expected:**
  - `thinkingEnabled: true` and `reasoningEffort: "max"` are written to the
     JSON root.
  - The card shows the `Thinking` badge.
  - Toggling `Thinking` back off removes the `reasoningEffort` field where
     appropriate — the new `settings.json` should reflect `thinkingEnabled:
     false`.

---

## Detect Current Config

### Matching provider exists

- **Prereq:** a provider whose `(baseUrl, model)` matches what's in
  `~/.deepcode/settings.json`. (You may need to set this up by hand.)
- **Steps:**
  1. Click `🔄 Detect Current Deep Code Config`.
- **Expected:**
  - Toast: `✓ Detected current Deep Code config and applied matching provider`.
  - The matching provider becomes active.

### No matching provider

- **Prereq:** `settings.json` has `BASE_URL` / `MODEL` that don't match any
  saved provider.
- **Steps:**
  1. Click `🔄 Detect Current Deep Code Config`.
- **Expected:**
  - A new provider named `Detected (<model>)` is created and made active.
  - Toast: `✓ Imported and applied from settings.json`.

### Incomplete config

- **Prereq:** `settings.json` exists but is missing `BASE_URL`, `API_KEY`, or
  `MODEL`.
- **Steps:**
  1. Click detect.
- **Expected:**
  - Alert dialog: `No complete config found in ~/.deepcode/settings.json`.
  - No state changes (no toast, no new provider).

---

## Auto-create Config File

- **Prereq:** `~/.deepcode/settings.json` does **not** exist (rename it
  temporarily).
- **Steps:**
  1. Relaunch Deep Switch.
  2. Sidebar shows a `Missing` red badge next to the config path card.
  3. Click `Create Config File`.
- **Expected:**
  - File appears at `~/.deepcode/settings.json` with content `{ "env": {} }`.
  - Badge changes to `Found` / green.
  - Toast: `✓ Deep Code config file created`.

---

## Language Switching

### Sidebar dropdown

- **Prereq:** any app state.
- **Steps:**
  1. Switch the sidebar `Language` dropdown from `中文` to `English` (or vice
     versa).
- **Expected:** every label below changes without a restart:
  - `+ 添加供应商` ↔ `+ Add Provider`
  - `偏好设置` / `语言` ↔ `Preferences` / `Language`
  - `Deep Code 配置` ↔ `Deep Code Config`
  - `激活` ↔ `Active`
  - Toast text: `✓ 已切换` ↔ `✓ switched`
  - Modal title: `添加供应商` ↔ `Add Provider`
  - Card buttons: `启用` ↔ `Enable`, `未测试` ↔ `Untested`

### Persistence + next launch

- **Steps:**
  1. Pick a language, close the app, relaunch.
- **Expected:**
  - UI opens in the chosen language.

### Tray menu follows language

- **Prereq:** app running with at least one provider.
- **Steps:**
  1. Switch UI language in the sidebar dropdown.
  2. Open the tray menu.
- **Expected:**
  - Tray items (`打开主界面` / `Open Main Window`, `切换供应商` /
     `Switch Provider`, `退出` / `Quit`) are translated.

### System default

- **Prereq:** delete the `preferredLanguage` key from `~/.deep-switch/config.json`.
- **Steps:**
  1. With macOS system language set to `zh-CN` (or `en-US`), relaunch.
- **Expected:**
  - App opens in `zh` (or `en`) automatically. Switching the system language
     alone does not retroactively change UI on a running session — restart
     required.

---

## New-User Golden Path

The clean-slate smoke test: pretend this is a brand-new install on a machine
that has never seen Deep Switch or Deep Code.

- **Prereq:** both `~/.deep-switch/config.json` and
  `~/.deepcode/settings.json` deleted (or renamed).
- **Steps:**
  1. Launch Deep Switch.
  2. Sidebar should show `Missing` config badge and "No active provider"
     state.
  3. Click `+ Add Provider`.
  4. Pick **DeepSeek V4 Pro**, paste any key, click `Add & Enable`.
  5. Verify the card is active and the sidebar shows the BASE_URL / MODEL.
  6. Click `🔄 Detect Current Deep Code Config` — should now match and
     confirm.
- **Expected (the whole thing should "just work"):**
  - No errors, no alerts, no missing-asset warnings.
  - `~/.deep-switch/config.json` and `~/.deepcode/settings.json` both
     created on first user action.
  - Active indicator on the card, `Active` tag, dot colour matches last test
     status.
  - Quit-and-relaunch preserves state (provider still saved, still active).

---

## macOS Window Behaviour

### Hide-on-close

- **Prereq:** macOS, app installed and launched.
- **Steps:**
  1. With the main window focused, click the red close button.
- **Expected:**
  - Window disappears, but the menu-bar icon stays.
  - `pgrep -f "Deep Switch"` (or `pgrep -f "deepswitch"`) still shows the
     process.
  - Clicking the menu-bar icon brings the window back.

### Dock icon size and appearance

- **Prereq:** macOS, app installed.
- **Steps:**
  1. Look at the Dock.
- **Expected:**
  - Dock shows the Deep Switch icon at standard app-icon size (not the small
     "minimised" version).
  - When the window is hidden via close, the dock icon is still there (no
     bouncing, no badge).
  - Right-click the dock icon → standard macOS menu (`Show`, `Hide`,
     `Quit`). Clicking `Show` reopens the window if it was closed.

---

## Build & Cleanup Smoke (Pre-Release)

- **Prereq:** fresh checkout.
- **Steps:**
  1. `npm install` → no errors.
  2. `npm run lint` → no errors.
  3. `npm run build` → both `build:main` and `build:renderer` succeed.
  4. `npm run pack` → produces an unpacked Electron app under `dist/` that
     launches on macOS / Windows / Linux.
- **Expected:**
  - Bundle launches, tray icon appears, no console errors on first run.

---

## Test Result

| Area | Pass | Fail | Notes |
|------|------|------|-------|
| Provider CRUD      | _   | _    | _   |
| Apply / Activate   | _   | _    | _   |
| Tray Menu          | _   | _    | _   |
| Model Picker       | _   | _    | _   |
| Thinking Mode      | _   | _    | _   |
| Detect             | _   | _    | _   |
| Config Auto-create | _   | _    | _   |
| Language Switching | _   | _    | _   |
| Golden Path        | _   | _    | _   |
| macOS Window       | _   | _    | _   |
| Build & Cleanup    | _   | _    | _   |

Tester: ____________   Date: ____________   Build / commit: ____________
