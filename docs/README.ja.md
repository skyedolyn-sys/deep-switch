# Deep Switch

> **Deep Code** CLI の AI プロバイダをワンクリックで切り替え。秒単位で完了。設定ファイルを編集する必要なし、再起動もなし。

---

## ダウンロード / Download

**最新安定版:** [v0.1.0](../../releases/latest)

| プラットフォーム | ダウンロード | サイズ |
|---|---|---|
| macOS (Apple Silicon) | [`Deep Switch-0.1.0-arm64.dmg`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64.dmg) | ~183 MB |
| macOS (Apple Silicon) | [`Deep Switch-0.1.0-arm64-mac.zip`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-mac.zip) | ~176 MB |
| Linux / Windows | [ソースからビルド](#開発) | — |

> ⚠️ **このビルドは署名・公証されていません。** 初回起動時に macOS は *「"Deep Switch" は破損しているため開けません」* を表示します。回避手順:
> 1. DMG を開き、**Deep Switch** を `/Applications` にドラッグします。
> 2. **Finder** で `/Applications` を開き、**Deep Switch** を右クリック → **開く** → ダイアログで確認します。
> 3. 以降は通常のダブルクリックで起動できます。
>
> ターミナルからの方法: `sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> Apple Developer ID を取得でき次第、署名・公証版へ移行します。それまでは上記の方法をご利用ください。

---

## 言語 / Languages

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

**Deep Code CLI 向けプロバイダ切替ツール ── あなたの働き方に本気で寄り添います。**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#インストール)
[![Electron](https://img.shields.io/badge/electron-28-9feaf9)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)

</div>

---

## Deep Switch とは?

Deep Switch は、macOS のメニューバー / Dock に常駐する小さなユーティリティ(Linux / Windows ではシステムトレイ)です。`~/.deepcode/settings.json` を書き換えることで、**Deep Code** CLI が次に使う AI プロバイダを即座に切り替えます。一度登録すれば、JSON ファイルを開かなくてもワンクリックで切替完了。

Deep Code の **ための** ミラーリング / 入れ替えユーティリティであり、Deep Code 本体には一切手を加えません。あくまで CLI が次に読み込む設定だけを書き換えます。

---

## なぜ必要?

多くのプロバイダを扱うのが、こんなに面倒であるべきはずがありません。

- 🧩 **プロバイダが多すぎ、鍵が多すぎ** ── DeepSeek、Moonshot、Zhipu GLM、MiniMax、ByteDance Doubao、SiliconFlow、OpenRouter、OpenAI、Groq……それぞれに異なる Base URL、モデル名、癖があります。
- 📝 **`settings.json` を手作業で編集** ── キーの一文字を打ち間違える、カンマを忘れるだけで JSON が壊れます。
- 🐢 **切替が遅い** ── CLI を終了し、ファイルを編集し、再起動し、待ち、また同じことの繰り返し。
- 💾 **バックアップ状態が失われやすい** ── 上書きしてしまえば、元の設定は二度と戻せません。
- 🔁 **繰り返しの作業** ── 新しいプロジェクトを始めるたびに同じ儀式。

Deep Switch は、これらすべてをワンクリックにまとめます。

---

## 機能

- ⚡ **ワンクリック有効化** ── プロバイダを選んで *有効化* を押すだけ。
- 📦 **プリセット網羅** ── DeepSeek · Moonshot/Kimi · Zhipu GLM · MiniMax · ByteDance Doubao · SiliconFlow · OpenRouter · OpenAI · Groq、そして自由に設定できる *カスタム* スロット。
- 🔄 **ライブ適用** ── `~/.deepcode/settings.json` を直接書き換えます。次回の CLI 呼び出しからすでに新しいプロバイダに繋がります。**再起動不要。**
- 🧠 **モデルピッカー** ── プロバイダの `/v1/models` エンドポイントからモデル一覧をライブ取得。実際に提供されている中から選べます。
- 🤔 **思考モード切替** ── チェーン・オブ・ソートを有効化し、推論深度を `high`(高)または `max`(最高)から選択。
- 🌐 **バイリンガル UI** ── 日本語と英語、システムのロケールを自動検出、手動オーバーライドも対応。
- 📌 **トレイメニューからのクイック切替** ── トレイアイコンを右クリックすれば、メインウィンドウを開かずにプロバイダを切り替え。表示言語は UI 言語に追従。
- 🪄 **初回「現在の設定を検出」インポート** ── Deep Code が現在使っている設定をそのまま取り込み、保存可能なプロバイダとして 1 クリックで登録。
- 🔒 **資格情報はローカル保存のみ** ── `~/.deep-switch/config.json` に保存。アップロードも同期もロギングも一切なし。
- 🛟 **バックアップと復元** ── 書き換えるたびに前のファイルをスナップショット。切替を誤っても 1 クリックで戻せます。
- 🎯 **ヘルスチェック** ── プロバイダの Base URL を軽量にプローブし、CLI より先に「繋がるか」をお知らせ。
- 🪶 **軽量** ── トレイアイコン 1 つだけ。常駐デーモンも、不要に膨らんだエンジンもなし。

---

## 仕組み

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  プリセット/      │  ───▶  │  メインウィンドウまたは   │  ───▶  │  ~/.deepcode/        │
│  カスタム         │        │  トレイメニューで          │        │  settings.json       │
│  プロバイダ一覧   │        │  「有効化」をクリック      │        │  がメインプロセスで    │
│  (DeepSeek、      │        │                        │        │  ディスクに書き込まれる│
│  Moonshot…)       │        │                        │        │                      │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  Deep Code CLI の次の      │
                                                            │  呼び出し時に新しい         │
                                                            │  settings を読み込み、     │
                                                            │  選択したプロバイダに繋がる │
                                                            └──────────────────────────┘
```

流れは 4 ステップだけ:

1. プロバイダを **追加** (プリセットを選ぶか、Base URL + Key を貼り付ける)。
2. メインウィンドウまたはトレイメニューから **有効化**。
3. Deep Switch のメインプロセスが新しい `settings.json` をディスクに書き込む。
4. 次回 Deep Code CLI を呼び出すと、今保存したばかりのファイルが読み込まれる。

これでループ完了です。

---

## インストール

### macOS(推奨)

#### Homebrew(おすすめ)

```bash
brew install --cask deep-switch
```

#### 直接ダウンロード

[Releases](../../releases) ページから最新の `.dmg` または `.zip` を入手し、**Deep Switch** を「アプリケーション」フォルダにドラッグしてください。

> ビルドが未署名のため、DMG から初回起動する際に右クリック → *開く* で Gatekeeper の確認を通過させる必要がある場合があります。

### Linux / Windows

公式インストーラはまだ用意されていませんが、ソースから実行できます:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

バイナリを自分でパッケージしたい場合は、下記の[開発](#開発)セクションの `npm run dist` を参照してください。

---

## 開発

要件:**Node.js 18 以上**、**npm 9 以上**。

```bash
# クローン
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 依存をインストール(リポジトリ同梱の lockfile を使用)
npm install

# 開発モード ── Vite + Electron を並列起動、HMR 付き
npm run dev

# メインプロセスの型チェック + ビルド
npm run build:main

# レンダラーの型チェック + ビルド
npm run build:renderer

# 本番ビルド一式
npm run build

# 現在プラットフォーム向けバイナリをパッケージ
npm run dist

# Lint
npm run lint
```

`npm run dev` は Vite を `http://localhost:5173` で起動し、Electron がそこへ向くように立ち上がります。レンダラーは HMR で更新され、メインプロセスは TypeScript ファイル変更時に素早く再起動します。

---

## 技術スタック

| レイヤ          | 採用技術                                          |
| --------------- | ------------------------------------------------- |
| シェル          | **Electron 28**                                  |
| レンダラー      | **React 18** + **TypeScript 5**                  |
| バンドラ(web)   | **Vite 5**                                       |
| バンドラ(app)   | **electron-builder 24**                          |
| 国際化          | **i18next** + `i18next-browser-languagedetector` |
| ローカル保存    | `electron-store`(OS のキーチェーンが使える環境では暗号化) |
| 永続化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## プロジェクト構成

```
deep-switch/
├── src/
│   ├── main/                   # Electron メインプロセス
│   │   ├── index.ts            # アプリ & トレイ起動
│   │   ├── presets.ts          # 内蔵プロバイダプリセット
│   │   ├── provider-manager.ts # ユーザープロバイダの CRUD
│   │   ├── vendors.ts          # ベンダー情報
│   │   ├── health-check.ts     # 任意の Base URL プローブ
│   │   └── quota.ts            # クォータのスナップショット
│   ├── preload/                # contextBridge 公開面
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── build/                      # アプリアイコン
├── public/                     # 静的アセット
├── scripts/                    # 補助スクリプト
├── docs/                       # 多言語 & 追加ドキュメント
├── electron-builder 設定は      # package.json → "build"
├── tsconfig.json               # レンダラー TS 設定
├── tsconfig.main.json          # メインプロセス TS 設定
└── vite.config.ts
```

---

## コントリビュート

PR 大歓迎 ── テーマを絞ってください。

1. リポジトリをフォークし、トピックブランチを作成(`feat/<short-name>`、`fix/<short-name>`)。
2. プッシュ前に `npm run lint` と `npm run build` を実行。
3. PR では *何を* 変えたかではなく **なぜ** 変えたかを説明してください。

プロバイダプリセットを追加する場合は `src/main/presets.ts` を編集し、`description` / `descriptionEn`(および platform、hint)の日本語・英語版を揃えてください。
翻訳を追加する場合は `src/renderer/locales/en.json` と `src/renderer/locales/zh.json` を同時に編集し、key を完全一致させてください。

---

## セキュリティとプライバシー

- 🔐 **API キーは `~/.deep-switch/config.json` にローカル保存**。外部へは一切送信しません。私たち側の「私たち」は存在しません ── Deep Switch にバックエンドはありません。
- 🚫 **アナリティクス、テレメトリ、クラッシュレポートなし**。第三者スクリプトの埋め込みや、リモート設定の取得も行いません。
- 🌐 **Deep Switch 自身が発する通信は**、モデルピッカー使用時の任意の `/v1/models` 取得と任意のヘルスチェックだけ ── どちらもあなたのマシンから、選んだプロバイダへ直接届きます。
- 🧪 **オープンソース** ── あなたのマシンで動作するすべてのバイトが、このリポジトリにあります。自由に監査してください。
- 🧯 **自動バックアップ** ── `~/.deepcode/settings.json` を書き換えるたびに、必ずひとつ前のスナップショットを取ります。誤操作からも 1 クリックで戻れます。

セキュリティ上の問題を見つけた場合は、公開 issue ではなく private advisory でご報告ください。

---

## ライセンス

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 謝辞

このアプリがルーティングしている API を提供してくれているプロバイダ各位 ── **DeepSeek、Moonshot / Kimi、Zhipu GLM、MiniMax、ByteDance Doubao、SiliconFlow、OpenRouter、OpenAI、Groq** ── そして Electron、React、Vite、i18next のメンテナに深く感謝します。彼らの仕事があってこそ、このアプリはシンプルに作れます。
