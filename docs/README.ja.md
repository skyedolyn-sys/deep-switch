# Deep Switch

> ワンクリックで **Deep Code** CLI の AI プロバイダーを切り替えるメニューバー / Dock ユーティリティ。
> 設定ファイルを開く必要なし。再起動も不要。秒単位で切り替え。

---

## ダウンロード / Download

**最新安定版:** [v0.1.0](../../releases/latest)

| プラットフォーム | ダウンロード | サイズ |
|---|---|---|
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.dmg`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.dmg) | ~5 MB |
| macOS (Intel) | ソースからビルド | — |
| Linux / Windows | ソースからビルド | — |

> ⚠️ **ビルドは未署名・未公証です。** 初回起動時、macOS は *"Deep Switch は壊れているため開けません"* と表示します。回避方法:
> 1. DMG を開き、**Deep Switch** を `/Applications` にドラッグします。
> 2. **Finder** で `/Applications` に移動し、**Deep Switch** を右クリック → **開く** → ダイアログで確認。
> 3. 以降はダブルクリックで通常通り起動します。
>
> コマンドライン:`sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> Apple Developer ID を取得後、署名 + 公証版に切り替えます。それまでは上記の回避策をお使いください。

---

## 言語 / Languages

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

**Deep Code CLI のプロバイダー切り替えツール —— 実際の業務フローに合わせて設計。**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#インストール)
[![Tauri 2](https://img.shields.io/badge/tauri-2-FFC131)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
[![Rust](https://img.shields.io/badge/rust-stable-orange)](https://www.rust-lang.org)

</div>

---

## Deep Switch とは?

Deep Switch は `~/.deepcode/settings.json` を編集するだけの小さなメニューバー / Dock ユーティリティです(macOS 向け。Linux / Windows ではシステムトレイユーティリティ)。**Deep Code** CLI が今どの AI プロバイダーと会話しているかを、ワンクリックで切り替えられるようにします。一度プロバイダーを登録すれば、JSON ファイルを開くことなく切り替えできます。

Deep Code の代替品ではなく、**Deep Code のための** ミラー / 互換ツールです:Deep Code 本体には触れず、CLI が次回読み取る設定ファイルだけを書き換えます。

---

## なぜ?

複数のプロバイダーを渡り歩くのに、こんなに苦労するべきではありません。

- 🧩 **プロバイダーが多すぎ、鍵が多すぎ** — DeepSeek、Moonshot、Zhipu GLM、MiniMax、ByteDance Doubao、SiliconFlow、OpenRouter、OpenAI、Groq……それぞれに独自の Base URL、モデル名、癖があります。
- 📝 **`settings.json` の手作業編集** — 1 文字打ち間違えたり、カンマを忘れただけで JSON が壊れます。
- 🐢 **切り替えが遅い** — CLI を終了して、ファイルを編集して、再起動して、待って、の繰り返し。
- 💾 **バックアップが消える** — 上書きしてしまえば、前の設定はもう戻せません。
- 🔁 **繰り返し作業** — 新しいプロジェクトごとに同じことをやり直す。

Deep Switch はこれをすべてワンクリックに集約します。

---

## 機能

- ⚡ **ワンクリック有効化** — プロバイダーを選んで *有効化* を押すだけ。
- 📦 **プリセット網羅** — DeepSeek · Moonshot/Kimi · Zhipu GLM · MiniMax · ByteDance Doubao · SiliconFlow · OpenRouter · OpenAI · Groq、そして完全にカスタマイズ可能な *Custom* スロット。
- 🔄 **リアルタイム反映** — `~/.deepcode/settings.json` を直接書き換えます。次に CLI を呼ぶ時点で既に新しいプロバイダーに切り替わっています。**再起動不要。**
- 🧠 **モデルピッカー** — プロバイダーの `/v1/models` エンドポイントからリアルタイムにモデル一覧を取得し、実際に利用可能なものだけ選べます。
- 🤔 **思考モード切替** — Chain-of-thought を有効化し、推論の深さ `high` / `max` を選べます。
- 🌐 **バイリンガル UI** — 日本語と英語、システムロケール自動検出 + 手動オーバーライド。
- 📌 **トレイメニューで即時切替** — トレイアイコンを右クリックでメインウィンドウを開かずに切替。メニュー表記は UI 言語に追従。
- 🪄 **初回「現在の設定を検出」インポート** — Deep Code が今何を指しているかを読み取り、ワンクリックで保存可能なプロバイダーに。
- 🔒 **認証情報はローカル保存** — `~/.deep-switch/config.json` にのみ。アップロードも同期もログ保存もなし。
- 🎯 **ヘルスチェック** — 任意の軽量 Base URL チェック。CLI がエラーを出す前に分かります。
- 🪶 **軽量** — 単一トレイアイコン、システム WebView、ディスク約 12 MB。Chromium 同梱なし、バックグラウンド常駐なし。

---

## 仕組み

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  プリセット/       │  ───▶  │  メインウィンドウか      │  ───▶  │  ~/.deepcode/        │
│  カスタム入力     │        │  トレイメニューで        │        │  settings.json       │
│  (DeepSeek,      │        │  「有効化」をクリック     │        │  が Rust メイン      │
│  Moonshot, …)    │        │                        │        │  プロセスから書き換え │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  次の Deep Code CLI 呼び出しが │
                                                            │  新しい settings を読み、   │
                                                            │  切り替わったプロバイダーと │
                                                            │  通信する。                │
                                                            └──────────────────────────┘
```

4 ステップ:

1. プロバイダーを **追加** (プリセットを選ぶか Base URL + Key を貼る)
2. メインウィンドウかトレイメニューから **有効化** をクリック
3. Deep Switch が Tauri Rust メインプロセス経由で `settings.json` を書き換え
4. 次に Deep Code CLI を呼ぶと、書き換えた設定が読まれる

これで完了です。

---

## インストール

### macOS(推奨)

[Releases](../../releases) ページから最新の `.dmg` をダウンロードし、**Deep Switch** を Applications フォルダにドラッグします。

> ビルドが未署名のため、DMG から初回起動時に Gatekeeper の警告が出ます。右クリック → *開く* で許可してください。

### Linux と Windows

公式インストーラはまだですが、ソースから動かせます:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run tauri dev
```

---

## 開発

要件:**Node.js 20+** および **Rust 1.77+**(Tauri 2 ツールチェーン)。

```bash
# クローン
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 依存インストール(リポジトリの lockfile を使用)
npm install

# 開発モード — Vite + Tauri + HMR
npm run tauri dev
# レンダラーのみ(ブラウザプレビュー、Tauri なし):
npm run dev:renderer

# レンダラーの型チェック
npx tsc --noEmit

# 現在プラットフォームの本番ビルド
npm run tauri build

# Lint
npm run lint
```

`npm run tauri dev` は Vite を `http://localhost:5173` で起動し、Tauri WebView ウィンドウから開きます。レンダラーは HMR、`src-tauri/src/**` 変更時は Rust が自動再コンパイル。

---

## 技術スタック

| レイヤー        | ツール                                            |
| --------------- | ------------------------------------------------- |
| シェル          | **Tauri 2**(システム WebView を使用)              |
| レンダラー      | **React 18** + **TypeScript 5** + **Vite 5**     |
| ネイティブ     | **Rust 1.77+**(serde, reqwest, tauri-plugin-log)  |
| i18n           | **i18next** + `i18next-browser-languagedetector` |
| ベンダーアイコン | **@lobehub/icons**(オープンソース SVG ブランドパック) |
| ローカル保存    | `~/.deep-switch/config.json`(JSON、アトミック書き込み) |
| 永続化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## プロジェクト構成

```
deep-switch/
├── src/
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/         # ProviderCard、PresetSelector、ProviderDetail など
│       ├── lib/                # vendor-icons.tsx(共有モジュール)
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── src-tauri/                   # Tauri Rust バックエンド
│   ├── src/
│   │   ├── main.rs             # Tauri エントリ
│   │   └── lib.rs              # 15 個の #[tauri::command] IPC + トレイ + DB
│   ├── icons/                   # アプリアイコンセット
│   ├── capabilities/           # Tauri セキュリティポリシー
│   ├── tauri.conf.json         # ウィンドウ設定、identifier、bundle 設定
│   └── Cargo.toml
├── public/                      # 静的アセット(トレイアイコンなど)
├── docs/                        # 多言語ドキュメント
├── .github/workflows/           # CI + リリース
│   ├── ci.yml
│   └── release.yml
├── tsconfig.json                # レンダラー TS 設定
└── vite.config.mts
```

---

## コントリビュート

PR 大歓迎 — テーマを絞ってください。

1. リポジトリをフォークしてトピックブランチを作成(`feat/<short-name>`、`fix/<short-name>`)。
2. プッシュ前に `npm run lint` と `npx tsc --noEmit` を実行。
3. PR は *何を* 変えたかだけでなく、**なぜ** 変えたかを説明する。

**プロバイダープリセットを追加** する場合、`src-tauri/src/lib.rs` の `get_builtin_presets` を編集 — `description` / `descriptionEn`(および platform、hint、homepageUrl)は両言語で同期させてください。
**翻訳を追加** する場合、`src/renderer/locales/en.json` と `src/renderer/locales/zh.json` を同期して編集し、キーが完全に一致するようにしてください。

---

## セキュリティとプライバシー

- 🔐 **API キーは `~/.deep-switch/config.json` にローカル保存** — あなたのマシンから一切出ません。Deep Switch にはバックエンドがなく「私たち」も存在しません。
- 🚫 **分析・テレメトリ・クラッシュレポートなし** — サードパーティスクリプトなし、リモート設定フェッチなし。
- 🌐 **Deep Switch 自身が発生するネットワークトラフィック** は、モデルピッカーを開いたときの任意の `/v1/models` 取得と任意のヘルスチェックのみ — どちらもあなたのマシンから直接選んだプロバイダーへ。
- 🧪 **オープンソース** — あなたのマシンで動く全バイトがこのリポジトリにあります。自由に監査してください。

セキュリティ問題を見つけた場合は、公開 issue ではなく非公開セキュリティレポートで報告してください。

---

## ライセンス

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 謝辞

API を提供してくれているプロバイダーに感謝——**DeepSeek、Moonshot / Kimi、Zhipu GLM、MiniMax、ByteDance Doubao、SiliconFlow、OpenRouter、OpenAI、Groq**——そして Tauri、React、Vite、Rust、i18next のメンテナたちに。皆さんの仕事があってこそ、このアプリは簡単に作れます。
