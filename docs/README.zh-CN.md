# Deep Switch

> 一键切换 **Deep Code** CLI 的 AI 服务商。秒级切换，无需改配置文件，无需重启。

---

## 下载 / Download

**最新稳定版：** [v0.1.0](../../releases/latest)

| 平台 | 下载 | 大小 |
|---|---|---|
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned.dmg`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned.dmg) | ~183 MB |
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned-mac.zip`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned-mac.zip) | ~176 MB |
| Linux / Windows | [源码编译](#开发) | — |

> ⚠️ **构建未签名也未经过苹果公证。** 首次启动 macOS 会提示 *「Deep Switch 已损坏，无法打开」*。绕过方法：
> 1. 打开 DMG，把 **Deep Switch** 拖入 `/Applications`。
> 2. 在 **Finder** 进入 `/Applications`，右键 **Deep Switch** → **打开** → 在弹窗中确认。
> 3. 之后就可以正常双击启动了。
>
> 命令行方式：`sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> 等我们拿到 Apple Developer ID 之后会切换为签名 + 公证版本。在此之前请用上面的方法。

---

## 语言 / Languages

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

**Deep Code CLI 的服务商切换器 —— 按你真正的工作方式设计。**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#安装)
[![Electron](https://img.shields.io/badge/electron-28-9feaf9)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)

</div>

---

## 这是什么？

Deep Switch 是一款小巧的 macOS 菜单栏 / Dock 工具(在 Linux 和 Windows 上则是系统托盘工具),用来改写 `~/.deepcode/settings.json`,让 **Deep Code** CLI 立即切换当前对接的 AI 服务商。一次添加,一键切换——从此告别手改 JSON。

它是 **为** Deep Code 打造的镜像 / 可互换工具:不改 Deep Code 本体,只改它下次调用时会读取的配置文件。

---

## 为什么需要它?

要在多家服务商之间穿梭,本不该这么痛苦。

- 🧩 **服务商太多,密钥太多** —— DeepSeek、Moonshot、智谱 GLM、MiniMax、字节豆包、SilliconFlow、OpenRouter、OpenAI、Groq……每家都有自家的 Base URL、模型名和坑点。
- 📝 **手动改 `settings.json`** —— 复制错一个字符、忘了加逗号,JSON 就崩了。
- 🐢 **切换太慢** —— 退出 CLI、改文件、重启、再等,反反复复。
- 💾 **备份状态容易丢失** —— 一覆盖,旧配置就再也回不来了。
- 🔁 **重复操作** —— 每个新项目都要重做一遍同样的流程。

Deep Switch 把这些全部收拢成一次点击。

---

## 功能特性

- ⚡ **一键启用** —— 选好服务商,点 *启用*,结束。
- 📦 **预设覆盖** —— DeepSeek · 月之暗面/Kimi · 智谱 GLM · MiniMax · 字节豆包 · SiliconFlow · OpenRouter · OpenAI · Groq,再加一个完全自定义的 *Custom* 槽位。
- 🔄 **实时生效** —— 直接改写 `~/.deepcode/settings.json`。你下次调用 CLI,就已经在新服务商上了。**无需重启。**
- 🧠 **模型选择器** —— 从服务商的 `/v1/models` 端点实时拉取模型列表,所选即所得。
- 🤔 **思考模式开关** —— 启用思维链,并可设定推理深度:`high`(高)或 `max`(极高)。
- 🌐 **双语界面** —— 简体中文与英文,自动识别系统语言,同时支持手动覆盖。
- 📌 **托盘菜单快速切换** —— 右键托盘图标即可在服务商间穿梭,无需打开主窗口;菜单文案跟随界面语言。
- 🪄 **首次“检测当前配置”导入** —— 读取 Deep Code 当前的实际配置,一键变成可保存的服务商。
- 🔒 **凭据仅本地存储** —— 放在 `~/.deep-switch/config.json` 里。不上传、不同步、不留日志。
- 🛟 **备份与回滚** —— 每次写入都会先快照一份旧文件,改坏了可以一键还原。
- 🎯 **健康检查** —— 可选地轻量探测服务商 Base URL,在 CLI 报错之前就告诉你通不通。
- 🪶 **轻量** —— 只有一个托盘图标,没有后台守护进程,也没有多余臃肿的引擎。

---

## 工作原理

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  预设 / 自定义    │  ───▶  │  在主窗口或托盘菜单中    │  ───▶  │  ~/.deepcode/        │
│  服务商列表       │        │  点击 "启用"            │        │  settings.json       │
│  (DeepSeek、      │        │                        │        │  会被主进程写入磁盘。  │
│  Moonshot…)       │        │                        │        │                      │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  Deep Code CLI 下次调用  │
                                                            │  时直接读取新的 settings, │
                                                            │  切换完成。                │
                                                            └──────────────────────────┘
```

完整流程只有四步:

1. **添加** 一家服务商(选预设,或粘贴自己的 Base URL + Key)。
2. 在主窗口或托盘菜单里 **启用** 它。
3. Deep Switch 由主进程把新的 `settings.json` 写入磁盘。
4. 你下次调用 Deep Code CLI,它就会加载刚刚保存的这份文件。

整个回路,到此结束。

---

## 安装

### macOS(推荐)

#### Homebrew(首选)

```bash
brew install --cask deep-switch
```

#### 直接下载

前往 [Releases](../../releases) 页面下载最新的 `.dmg` 或 `.zip`,把 **Deep Switch** 拖进「应用程序」文件夹即可。

> 因为构建尚未签名,首次从 DMG 启动时可能需要右键 → *打开* 来通过 Gatekeeper 提示。

### Linux 与 Windows

目前还没有官方安装包,但可以从源码运行:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

若想自行打包,可参考下方「[开发](#开发)」一节中的 `npm run dist`。

---

## 开发

环境要求:**Node.js 18+** 以及 **npm 9+**。

```bash
# 克隆
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 安装依赖(读取仓库自带的 lockfile)
npm install

# 开发模式 —— Vite + Electron 并发启动,带 HMR
npm run dev

# 主进程类型检查 + 构建
npm run build:main

# 渲染进程类型检查 + 构建
npm run build:renderer

# 完整生产构建
npm run build

# 打包当前平台的可执行文件
npm run dist

# 代码检查
npm run lint
```

`npm run dev` 会让 Vite 跑在 `http://localhost:5173`,然后启动 Electron 指向它——你会得到渲染进程的模块热替换,以及主进程在改动 TypeScript 文件时的快速重启。

---

## 技术栈

| 层级            | 技术选型                                          |
| --------------- | ------------------------------------------------- |
| 外壳            | **Electron 28**                                  |
| 渲染层          | **React 18** + **TypeScript 5**                  |
| 打包(web)       | **Vite 5**                                       |
| 打包(应用)      | **electron-builder 24**                          |
| 国际化          | **i18next** + `i18next-browser-languagedetector` |
| 本地存储        | `electron-store`(操作系统钥匙串可用时会加密落盘) |
| 持久化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## 项目结构

```
deep-switch/
├── src/
│   ├── main/                   # Electron 主进程
│   │   ├── index.ts            # 应用与托盘引导
│   │   ├── presets.ts          # 内置服务商预设
│   │   ├── provider-manager.ts # 用户服务商的增删改查
│   │   ├── vendors.ts          # 厂商元数据
│   │   ├── health-check.ts     # 可选的 Base URL 探测
│   │   └── quota.ts            # 配额快照
│   ├── preload/                # contextBridge 暴露面
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── build/                      # 应用图标
├── public/                     # 静态资源
├── scripts/                    # 辅助脚本
├── docs/                       # 多语言与额外文档
├── electron-builder 配置位于    # package.json → "build"
├── tsconfig.json               # 渲染进程 TS 配置
├── tsconfig.main.json          # 主进程 TS 配置
└── vite.config.ts
```

---

## 参与贡献

欢迎 PR——主题聚焦就好。

1. Fork 仓库后新建主题分支(`feat/<short-name>`、`fix/<short-name>`)。
2. 推送前请先执行 `npm run lint` 和 `npm run build`。
3. 提 PR 时讲清 **为什么** 改,而不仅仅是 *改了什么*。

补充服务商预设时,请改 `src/main/presets.ts`——务必同时维护 `description` / `descriptionEn`(以及 platform、hint)中英文两个版本。
补充文案翻译时,请同步修改 `src/renderer/locales/en.json` 与 `src/renderer/locales/zh.json`,两侧 key 必须完全一致。

---

## 安全与隐私

- 🔐 **API Key 放在 `~/.deep-switch/config.json`**,仅在你本机。不上传到任何地方。Deep Switch 根本没有后端——没有「我们」。
- 🚫 **无埋点、无遥测、无崩溃上报**。不引入任何第三方脚本,不做任何远程配置拉取。
- 🌐 **Deep Switch 自身产生的网络流量**,只有打开模型选择器时可选的 `/v1/models` 请求,以及可选的健康检查——两者都直接从你的机器发到你选中的服务商。
- 🧪 **开源** —— 在你机器上跑的每一个字节都在本仓库里,随便审。
- 🧯 **自动备份** —— 每次写入 `~/.deepcode/settings.json` 都会先快照上一份,误操作可以一键回滚。

如发现安全问题,请用私密安全公告提交,而非公开 issue。

---

## 许可证

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 致谢

诚挚感谢以下服务商提供的 API,本应用正是建立在它们之上——**DeepSeek、Moonshot / Kimi、智谱 GLM、MiniMax、字节豆包、SiliconFlow、OpenRouter、OpenAI、Groq**——以及 Electron、React、Vite、i18next 的维护者们,他们的工作让这个应用的构建变得轻而易举。
