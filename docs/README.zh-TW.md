# Deep Switch

> 一鍵切換 **Deep Code** CLI 的 AI 服務商。秒級切換,無需改組態檔,無需重啟。

---

## 下載 / Download

**最新穩定版:** [v0.1.0](../../releases/latest)

| 平臺 | 下載 | 大小 |
|---|---|---|
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.dmg`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.dmg) | ~5 MB |
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.zip`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.zip) | ~5 MB |
| Linux (deb) | [`deep-switch_0.1.0_amd64.deb`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.deb) | ~6 MB |
| Linux (AppImage) | [`deep-switch_0.1.0_amd64.AppImage`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.AppImage) | ~80 MB |
| Windows (MSI) | [`deep-switch_0.1.0_x64_en-US.msi`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64_en-US.msi) | ~5 MB |
| Windows (NSIS .exe) | [`deep-switch_0.1.0_x64-setup.exe`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64-setup.exe) | ~5 MB |

> ⚠️ **macOS 建構採用 ad-hoc 簽名並啟用了 hardened runtime,但尚未通過公證。** Apple Silicon 使用者在 macOS 15 Sequoia 上通常不會看到 Gatekeeper 提示。在較舊的 macOS 上,或若 Gatekeeper 仍擋下時,請執行一次:`xattr -cr /Applications/deep-switch.app` 然後從 Finder 重新啟動(若仍有問題請右鍵 → **打開**)。等我們拿到經驗證的 Apple Developer ID 之後,會切換為公證版本。
>
> Linux:AppImage 可攜免安裝;`.deb` 適用於 Debian / Ubuntu。Windows:MSI 為系統層級安裝,NSIS `.exe` 為可攜單使用者版。

---

## 語言 / Languages

- [English](../README.md)
- [简体中文](../README.zh-CN.md)
- [繁體中文](../README.zh-TW.md)
- [日本語](../README.ja.md)
- [한국어](../README.ko.md)

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

**Deep Code CLI 的服務商切換器 —— 按你真正的工作方式設計。**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#安裝)
[![Tauri 2](https://img.shields.io/badge/tauri-2-FFC131)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
[![Rust](https://img.shields.io/badge/rust-stable-orange)](https://www.rust-lang.org)

</div>

---

## 這是什麼?

Deep Switch 是一款小巧的 macOS 選單列 / Dock 工具(在 Linux 和 Windows 上則是系統匣工具),用來改寫 `~/.deepcode/settings.json`,讓 **Deep Code** CLI 立即切換目前對接的 AI 服務商。一次新增,一鍵切換——從此告別手改 JSON。

它是 **為** Deep Code 打造的映象 / 可互換工具:不改 Deep Code 本體,只改它下次呼叫時會讀取的組態檔。

---

## 為什麼需要它?

要在多家服務商之間穿梭,本不該這麼痛苦。

- 🧩 **服務商太多,密鑰太多** —— DeepSeek、Moonshot、智譜 GLM、MiniMax、字節豆包、SiliconFlow、OpenRouter、OpenAI、Groq、商湯 SenseNova、清華 DeepSeek-R1……每家都有自家的 Base URL、模型名稱與眉角。
- 📝 **手動改 `settings.json`** —— 複製錯一個字元、忘了加逗號,JSON 就壞了。
- 🐢 **切換太慢** —— 退出 CLI、改檔案、重啟、再等,反反覆覆。
- 💾 **備份狀態容易丟失** —— 一覆蓋,舊組態就再也回不來了。
- 🔁 **重複操作** —— 每個新專案都要重做一遍同樣的流程。

Deep Switch 把這些全部收攏成一次點擊。

---

## 功能特色

- ⚡ **一鍵啟用** —— 選好服務商,點 *啟用*,結束。
- 📦 **預設涵蓋** —— DeepSeek · 月之暗面/Kimi · 智譜 GLM · MiniMax · 字節豆包 · SiliconFlow · OpenRouter · OpenAI · Groq · 商湯 SenseNova · 清華 DeepSeek-R1(671B 完整版 + 32B 蒸餾版,皆可在預設卡片中選用),再加一個完全自訂的 *Custom* 欄位。
- 🔄 **即時生效** —— 直接改寫 `~/.deepcode/settings.json`。你下次呼叫 CLI,就已經在新服務商上了。**無需重啟。**
- 🌐 **OpenCode 同步** —— 同時把對應的服務商寫入 `~/.config/opencode/opencode.json`,讓 opencode-ai CLI 可透過其 `@ai-sdk/openai-compatible` 轉接層沿用同一個設定。同一個服務商,兩個用戶端。
- 🧠 **模型選擇器** —— 從服務商的 `/v1/models` 端點即時拉取模型清單,所選即所得。
- 🤔 **思考模式開關** —— 啟用思維鏈,並可設定推理深度:`high`(高)或 `max`(極高)。
- 🛰️ **校園 / WAF 相容代理** —— 對於位於嚴格 WAF 後方的服務商(例如清華 madmodel.cs.tsinghua.edu.cn),Deep Switch 會啟動一個內嵌的 Node.js 輔助程式(`scripts/tsinghua-proxy.mjs`),在短暫 404 時自動重試,把 `<think>` 推理內容拆成獨立的 `reasoning_content` delta,並把警告片段以串流方式回傳給用戶端,讓 CLI 在重試期間不會看起來像卡住。
- 🪟 **關閉時縮到系統匣** —— 關閉視窗時程式仍留在選單列常駐;想結束請右鍵匣圖示退出。
- 🌐 **雙語介面** —— 簡體中文與英文,自動識別系統語言,同時支援手動覆蓋。
- 📌 **匣選單快速切換** —— 右鍵匣圖示即可在服務商間穿梭,無需打開主視窗;選單文案跟隨介面語言;狀態會透過 `active-provider-changed` 事件回傳同步到主視窗。
- 🪄 **首次「偵測目前組態」匯入** —— 讀取 Deep Code 目前的實際組態,一鍵變成可儲存的服務商。
- 🔒 **憑證僅本地儲存** —— 放在 `~/.deep-switch/config.json` 裡,並設有 `0600` 權限。不上傳、不同步、不留記錄。
- 🎯 **健康檢查** —— 可選地輕量探測服務商 Base URL,在 CLI 報錯之前就告訴你通不通。
- 🪶 **輕量** —— 單一匣圖示,系統 WebView,體積約 12 MB。無內建 Chromium,無背景守護行程。

---

## 工作原理

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  預設 / 自訂      │  ───▶  │  在主視窗或匣選單中      │  ───▶  │  ~/.deepcode/        │
│  服務商清單       │        │  點擊 "啟用"            │        │  settings.json       │
│  (DeepSeek、      │        │                        │        │  會被 Rust 主行程寫  │
│  Moonshot…)       │        │                        │        │  入磁碟。            │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  Deep Code CLI 下次呼叫  │
                                                            │  時直接讀取新的 settings, │
                                                            │  切換完成。                │
                                                            └──────────────────────────┘
```

完整流程只有四步:

1. **新增** 一家服務商(選預設,或貼上自己的 Base URL + Key)。
2. 在主視窗或匣選單裡 **啟用** 它。
3. Deep Switch 透過 Tauri Rust 主行程把新的 `settings.json` 寫入磁碟。
4. 你下次呼叫 Deep Code CLI,它就會載入剛剛儲存的這份檔案。

整個迴路,到此結束。

---

## 安裝

### macOS(推薦)

前往 [Releases](../../releases) 頁面下載最新的 `.dmg`,把 **Deep Switch** 拖進「應用程式」資料夾即可。

> 因為建構尚未簽名,首次從 DMG 啟動時可能需要右鍵 → *打開* 來通過 Gatekeeper 提示。

### Linux 與 Windows

目前已有官方安裝包——請參考上方的 [下載](#下載--download) 表格。

**Linux 用哪個檔案?**

- **`.deb`**(Debian / Ubuntu):約 4 MB,系統層級安裝,需要 `sudo`,透過 `apt` 借用系統已有的 WebKitGTK。安裝指令:`sudo dpkg -i deep-switch_0.1.0_amd64.deb`(多數桌面檔案管理器也可雙擊安裝)。
- **`.AppImage`**(任意發行版,無需 root):約 80 MB,完全自給自足——把 WebKitGTK 一併打包,因此 Arch / Fedora / openSUSE 上無需額外安裝系統函式庫即可執行。用法:`chmod +x deep-switch_0.1.0_amd64.AppImage && ./deep-switch_0.1.0_amd64.AppImage`,或直接雙擊。體積是可攜性的代價——所有依賴都隨檔攜帶。

若想從原始碼執行:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run tauri dev
```

---

## 開發

環境要求:**Node.js 20+** 以及 **Rust 1.77+**(Tauri 2 工具鏈)。

```bash
# 克隆
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 安裝相依(讀取倉庫自帶的 lockfile)
npm install

# 開發模式 —— Vite + Tauri 啟動,帶 HMR
npm run tauri dev
# 純渲染層(瀏覽器預覽,無 Tauri):
npm run dev:renderer

# 渲染層型別檢查
npx tsc --noEmit

# 目前平臺的正式建構
npm run tauri build

# 程式碼檢查
npm run lint
```

`npm run tauri dev` 啟動 Vite 在 `http://localhost:5173`,然後用 Tauri WebView 視窗打開它——你會得到渲染進程熱替換,以及改動 `src-tauri/src/**` 時 Rust 自動重編譯。

---

## 技術棧

| 層級            | 技術選型                                          |
| --------------- | ------------------------------------------------- |
| 外殼            | **Tauri 2**(使用系統 WebView)                    |
| 渲染層          | **React 18** + **TypeScript 5** + **Vite 5**     |
| 原生後端        | **Rust 1.77+**(serde, reqwest, tauri-plugin-log)  |
| WAF 輔助        | 內嵌 **Node.js** 子行程(`scripts/tsinghua-proxy.mjs`),僅在切換到受 WAF 防護的服務商時啟動;透明重試 + SSE 串流 |
| 國際化          | **i18next** + `i18next-browser-languagedetector` |
| 廠商圖示        | **@lobehub/icons**(開源 SVG 品牌包)               |
| 本機儲存        | `~/.deep-switch/config.json`(JSON,原子寫入)       |
| 持久化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` + `~/.config/opencode/opencode.json` |

---

## 專案結構

```
deep-switch/
├── src/
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/         # ProviderCard、PresetSelector、ProviderDetail 等
│       ├── lib/                # vendor-icons.tsx(共享模組)
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── src-tauri/                   # Tauri Rust 後端
│   ├── src/
│   │   ├── main.rs             # Tauri 入口
│   │   └── lib.rs              # 15 個 #[tauri::command] IPC + 匣 + 資料庫
│   ├── icons/                   # 應用圖示集
│   ├── capabilities/           # Tauri 安全策略
│   ├── tauri.conf.json         # 視窗組態、identifier、打包設定
│   └── Cargo.toml
├── public/                      # 靜態資源(匣圖示等)
├── docs/                        # 多語言與額外文件
├── .github/workflows/           # CI + 發佈
│   ├── ci.yml
│   └── release.yml
├── tsconfig.json                # 渲染層 TS 組態
└── vite.config.mts
```

---

## 參與貢獻

歡迎 PR——主題聚焦就好。

1. Fork 倉庫後新建主題分支(`feat/<short-name>`、`fix/<short-name>`)。
2. 推送前請先執行 `npm run lint` 和 `npx tsc --noEmit`。
3. 提 PR 時講清 **為什麼** 改,而不僅僅是 *改了些什麼*。

補充服務商預設時,請改 `src-tauri/src/lib.rs`(`get_builtin_presets`)——務必同時維護 `description` / `descriptionEn`(以及 platform、hint、homepageUrl)中英文兩個版本。
補充文案翻譯時,請同步修改 `src/renderer/locales/en.json` 與 `src/renderer/locales/zh.json`,兩側 key 必須完全一致。

---

## 安全與隱私

- 🔐 **API Key 放在 `~/.deep-switch/config.json`**,僅在你本機。不上傳到任何地方。Deep Switch 根本沒有後端——沒有「我們」。
- 🚫 **無埋點、無遙測、無崩潰回報**。不引入任何第三方腳本,不做任何遠端組態拉取。
- 🌐 **Deep Switch 自身產生的網路流量**,只有打開模型選擇器時可選的 `/v1/models` 請求,以及可選的健康檢查——兩者都直接從你的機器發到你選中的服務商。
- 🧪 **開源** —— 在你機器上跑的每一個位元組都在本倉庫裡,隨便審。

如發現安全問題,請用私密安全公告提交,而非公開 issue。

---

## 授權

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 致謝

誠摯感謝以下服務商提供的 API,本應用正是建立在她們之上——**DeepSeek、Moonshot / Kimi、智譜 GLM、MiniMax、字節豆包、SiliconFlow、OpenRouter、OpenAI、Groq、商湯 SenseNova、清華 DeepSeek-R1**——以及 Tauri、React、Vite、Rust、i18next 的維護者們,他們的工作讓這個應用的建構變得輕而易舉。
