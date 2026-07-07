# Deep Switch

> 一鍵切換 **Deep Code** CLI 的 AI 服務供應商。秒級切換,免改設定檔、免重啟。

---

## 下載 / Download

**最新穩定版：** [v0.1.0](../../releases/latest)

| 平台 | 下載 | 大小 |
|---|---|---|
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned.dmg`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned.dmg) | ~183 MB |
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned-mac.zip`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned-mac.zip) | ~176 MB |
| Linux / Windows | [原始碼編譯](#開發) | — |

> ⚠️ **此建置未簽署也未通過 Apple 公證。** 首次啟動時 macOS 會顯示 *「"Deep Switch" 已損壞,無法開啟」*。繞過方法:
> 1. 開啟 DMG,將 **Deep Switch** 拖入 `/Applications`。
> 2. 在 **Finder** 進入 `/Applications`,右鍵 **Deep Switch** → **打開** → 在對話框中確認。
> 3. 之後即可正常雙擊啟動。
>
> 命令列方式:`sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> 等我們拿到 Apple Developer ID 後將切換為簽署 + 公證版本。在那之前請使用上述方法。

---

## 語言 / Languages

- [English](../README.md)
- [简体中文](./README.zh-CN.md)
- [繁體中文](./README.zh-TW.md)
- [日本語](./README.ja.md)
- [한국어](./README.ko.md)

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

**Deep Code CLI 的服務供應商切換器 —— 為你真正的工作方式而生。**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#安裝)
[![Electron](https://img.shields.io/badge/electron-28-9feaf9)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)

</div>

---

## 這是什麼?

Deep Switch 是一款小巧的 macOS 選單列 / Dock 工具(Linux 與 Windows 上則為系統匣工具),用來改寫 `~/.deepcode/settings.json`,讓 **Deep Code** CLI 立即切換目前對接的 AI 服務供應商。新增一次,一鍵切換——從此告別手動編輯 JSON。

它是 **為** Deep Code 所打造的鏡像 / 可互換工具:不更動 Deep Code 本體,只更動它下次呼叫時會讀取的設定檔。

---

## 為什麼需要它?

要在多家供應商之間穿梭,本不該這麼痛苦。

- 🧩 **供應商太多、密鑰太多** —— DeepSeek、Moonshot、智譜 GLM、MiniMax、字節豆包、SiliconFlow、OpenRouter、OpenAI、Groq……每家都有自家的 Base URL、模型名稱與眉角。
- 📝 **手動改 `settings.json`** —— 複製錯一個字元、忘了加逗號,JSON 就壞了。
- 🐢 **切換太慢** —— 退出 CLI、改檔、重啟、再等,一再重複。
- 💾 **備份狀態容易遺失** —— 一覆寫,舊設定就再也回不來了。
- 🔁 **重複操作** —— 每個新專案都要重做一次同樣的流程。

Deep Switch 把這些全部收攏成一次點擊。

---

## 功能特色

- ⚡ **一鍵啟用** —— 選好供應商,按 *啟用*,結束。
- 📦 **預設涵蓋範圍** —— DeepSeek · Moonshot/Kimi · 智譜 GLM · MiniMax · 字節豆包 · SiliconFlow · OpenRouter · OpenAI · Groq,再加一個完全自訂的 *Custom* 欄位。
- 🔄 **即時生效** —— 直接改寫 `~/.deepcode/settings.json`。你下次呼叫 CLI,就已經在新的供應商上了。**無需重啟。**
- 🧠 **模型選擇器** —— 從供應商的 `/v1/models` 端點即時抓取模型列表,所選即所得。
- 🤔 **思考模式開關** —— 啟用思維鏈,並可設定推論深度:`high`(高)或 `max`(極高)。
- 🌐 **雙語介面** —— 繁體中文與英文,自動偵測系統語系,同時支援手動覆寫。
- 📌 **系統匣快速切換** —— 在系統匣圖示上右鍵即可在供應商間穿梭,不需開啟主視窗;選單文字會跟著介面語系走。
- 🪄 **首次「偵測目前設定」匯入** —— 讀取 Deep Code 目前的實際設定,一鍵變成可儲存的供應商。
- 🔒 **憑證僅存本機** —— 放在 `~/.deep-switch/config.json` 裡。不上傳、不同步、不留紀錄。
- 🛟 **備份與還原** —— 每次寫入都會先快照一份舊檔,改壞了可以一鍵還原。
- 🎯 **健康檢查** —— 可選地輕量探測供應商 Base URL,在 CLI 報錯之前就告訴你通不通。
- 🪶 **輕量** —— 只有一個系統匣圖示,沒有背景守護程式,也沒有額外臃腫的引擎。

---

## 運作原理

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  預設 / 自訂      │  ───▶  │  在主視窗或系統匣選單中   │  ───▶  │  ~/.deepcode/        │
│  供應商清單       │        │  點擊「啟用」            │        │  settings.json       │
│  (DeepSeek、      │        │                        │        │  會被主程序寫入磁碟。  │
│  Moonshot…)       │        │                        │        │                      │
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

1. **新增** 一家供應商(選預設,或貼上自己的 Base URL + Key)。
2. 在主視窗或系統匣選單裡 **啟用** 它。
3. Deep Switch 由主程序把新的 `settings.json` 寫入磁碟。
4. 你下次呼叫 Deep Code CLI,它就會載入剛剛儲存的這份檔案。

整個迴路,到此結束。

---

## 安裝

### macOS(推薦)

#### Homebrew(首選)

```bash
brew install --cask deep-switch
```

#### 直接下載

前往 [Releases](../../releases) 頁面下載最新的 `.dmg` 或 `.zip`,把 **Deep Switch** 拖進「應用程式」資料夾即可。

> 因為建構尚未簽章,首次從 DMG 啟動時可能需要在應用程式上右鍵 → *打開* 來通過 Gatekeeper 提示。

### Linux 與 Windows

目前還沒有官方安裝包,但可以從原始碼執行:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

若想自行打包,可參考下方「[開發](#開發)」一節中的 `npm run dist`。

---

## 開發

環境需求:**Node.js 18+** 以及 **npm 9+**。

```bash
# 複製
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 安裝依賴(讀取倉庫自帶的 lockfile)
npm install

# 開發模式 —— Vite + Electron 並行啟動,含 HMR
npm run dev

# 主程式型別檢查 + 建構
npm run build:main

# 渲染程式型別檢查 + 建構
npm run build:renderer

# 完整正式版建構
npm run build

# 打包目前平台的可執行檔
npm run dist

# 程式碼檢查
npm run lint
```

`npm run dev` 會讓 Vite 跑在 `http://localhost:5173`,然後啟動 Electron 指向它——你會得到渲染程式的模組熱替換,以及主程式在改動 TypeScript 檔案時的快速重啟。

---

## 技術棧

| 層級            | 技術選型                                          |
| --------------- | ------------------------------------------------- |
| 外殼            | **Electron 28**                                  |
| 渲染層          | **React 18** + **TypeScript 5**                  |
| 打包(web)       | **Vite 5**                                       |
| 打包(應用)      | **electron-builder 24**                          |
| 國際化          | **i18next** + `i18next-browser-languagedetector` |
| 本機儲存        | `electron-store`(作業系統鑰匙圈可用時會加密落碟) |
| 持久化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## 專案結構

```
deep-switch/
├── src/
│   ├── main/                   # Electron 主程式
│   │   ├── index.ts            # 應用與系統匣引導
│   │   ├── presets.ts          # 內建供應商預設
│   │   ├── provider-manager.ts # 使用者供應商的增刪改查
│   │   ├── vendors.ts          # 廠商中繼資料
│   │   ├── health-check.ts     # 可選的 Base URL 探測
│   │   └── quota.ts            # 配額快照
│   ├── preload/                # contextBridge 暴露面
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── build/                      # 應用圖示
├── public/                     # 靜態資源
├── scripts/                    # 輔助腳本
├── docs/                       # 多語系與額外文件
├── electron-builder 設定位於    # package.json → "build"
├── tsconfig.json               # 渲染程式 TS 設定
├── tsconfig.main.json          # 主程式 TS 設定
└── vite.config.ts
```

---

## 參與貢獻

歡迎 PR——議題聚焦就好。

1. Fork 倉庫後建立主題分支(`feat/<short-name>`、`fix/<short-name>`)。
2. 推送前請先執行 `npm run lint` 與 `npm run build`。
3. 提 PR 時請說明 **為什麼** 改,而非僅止於 *改了什麼*。

新增供應商預設時,請改 `src/main/presets.ts`——務必同時維護 `description` / `descriptionEn`(以及 platform、hint)的中英文兩個版本。
新增文案翻譯時,請同步修改 `src/renderer/locales/en.json` 與 `src/renderer/locales/zh.json`,兩側 key 必須完全一致。

---

## 安全性與隱私

- 🔐 **API Key 放在 `~/.deep-switch/config.json`**,僅在你本機。不會上傳到任何地方。Deep Switch 根本沒有後端——沒有「我們」這回事。
- 🚫 **無埋點、無遙測、無當機回報**。不引入任何第三方腳本,不做任何遠端設定抓取。
- 🌐 **Deep Switch 自身產生的網路流量**,只有打開模型選擇器時可選的 `/v1/models` 請求,以及可選的健康檢查——兩者都直接從你的機器發到你選中的供應商。
- 🧪 **開源** —— 在你機器上跑的每一個位元組都在本倉庫裡,任你審視。
- 🧯 **自動備份** —— 每次寫入 `~/.deepcode/settings.json` 都會先快照上一份,誤操作可以一鍵回復。

如發現資安問題,請用私密安全公告提交,勿使用公開 issue。

---

## 授權條款

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 致謝

誠摯感謝以下供應商提供的 API,本應用正是建立在它們之上——**DeepSeek、Moonshot / Kimi、智譜 GLM、MiniMax、字節豆包、SiliconFlow、OpenRouter、OpenAI、Groq**——以及 Electron、React、Vite、i18next 的維護者們,他們的工作讓這個應用的建構變得輕而易舉。
