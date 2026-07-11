# Deep Switch

> 一键切换 **Deep Code** CLI 的 AI 服务商。秒级切换,无需改配置文件,无需重启。

---

## 下载 / Download

**最新稳定版:** [v0.1.0](../../releases/latest)

| 平台 | 下载 | 大小 |
|---|---|---|
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.dmg`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.dmg) | ~5 MB |
| macOS (Apple Silicon) | [`deep-switch_0.1.0_aarch64.zip`](../../releases/download/v0.1.0/deep-switch_0.1.0_aarch64.zip) | ~5 MB |
| Linux (deb) | [`deep-switch_0.1.0_amd64.deb`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.deb) | ~6 MB |
| Linux (AppImage) | [`deep-switch_0.1.0_amd64.AppImage`](../../releases/download/v0.1.0/deep-switch_0.1.0_amd64.AppImage) | ~80 MB |
| Windows (MSI) | [`deep-switch_0.1.0_x64_en-US.msi`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64_en-US.msi) | ~5 MB |
| Windows (NSIS .exe) | [`deep-switch_0.1.0_x64-setup.exe`](../../releases/download/v0.1.0/deep-switch_0.1.0_x64-setup.exe) | ~5 MB |

> ⚠️ **macOS 构建使用了 ad-hoc 签名 + hardened runtime,但未经过苹果公证。** macOS 15 Sequoia 上的 Apple Silicon 用户应该不会再看到 Gatekeeper 提示。旧版 macOS 上若仍被拦截,可执行一次 `xattr -cr /Applications/deep-switch.app` 后再从 Finder 启动(若仍报错,右键 → **打开**)。等拿到合规的 Apple Developer ID 之后,会切到公证版本。
>
> Linux:AppImage 是便携版(无需安装);`.deb` 适用于 Debian/Ubuntu。Windows:MSI 用于系统级安装,NSIS `.exe` 是便携的单用户安装包。

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
[![Tauri 2](https://img.shields.io/badge/tauri-2-FFC131)](https://tauri.app)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)
[![Rust](https://img.shields.io/badge/rust-stable-orange)](https://www.rust-lang.org)

</div>

---

## 截图

<p align="center">
  <img src="./screenshots/main-window.png" alt="Deep Switch 主窗口 — DeepSeek、Kimi、MiniMax、Qwen、OpenAI 并排展示,一键启用" width="880" />
</p>

---

## 这是什么?

Deep Switch 是一款小巧的 macOS 菜单栏 / Dock 工具(在 Linux 和 Windows 上则是系统托盘工具),用来改写 `~/.deepcode/settings.json`,让 **Deep Code** CLI 立即切换当前对接的 AI 服务商。一次添加,一键切换——从此告别手改 JSON。

它是 **为** Deep Code 打造的镜像 / 可互换工具:不改 Deep Code 本体,只改它下次调用时会读取的配置文件。

---

## 为什么需要它?

要在多家服务商之间穿梭,本不该这么痛苦。

- 🧩 **服务商太多,密钥太多** —— DeepSeek、Moonshot、智谱 GLM、MiniMax、字节豆包、SiliconFlow、OpenRouter、OpenAI、Groq、商汤 SenseNova、清华 DeepSeek-R1……每家都有自家的 Base URL、模型名和坑点。
- 📝 **手动改 `settings.json`** —— 复制错一个字符、忘了加逗号,JSON 就崩了。
- 🐢 **切换太慢** —— 退出 CLI、改文件、重启、再等,反反复复。
- 💾 **备份状态容易丢失** —— 一覆盖,旧配置就再也回不来了。
- 🔁 **重复操作** —— 每个新项目都要重做一遍同样的流程。

Deep Switch 把这些全部收拢成一次点击。

---

## 功能特性

- ⚡ **一键启用** —— 选好服务商,点 *启用*,结束。
- 📦 **预设覆盖** —— DeepSeek · 月之暗面/Kimi · 智谱 GLM · MiniMax · 字节豆包 · SiliconFlow · OpenRouter · OpenAI · Groq · 商汤 SenseNova · 清华 DeepSeek-R1(671B 满血 + 32B 蒸馏,二者均可在预设卡片中选用),再加一个完全自定义的 *Custom* 槽位。
- 🔄 **实时生效** —— 直接改写 `~/.deepcode/settings.json`。你下次调用 CLI,就已经在新服务商上了。**无需重启。**
- 🌐 **OpenCode 同步** —— 同步把同一份服务商配置写入 `~/.config/opencode/opencode.json`,让 opencode-ai CLI 通过 `@ai-sdk/openai-compatible` 适配器也能用上。一份配置,两个客户端。
- 🧠 **模型选择器** —— 从服务商的 `/v1/models` 端点实时拉取模型列表,所选即所得。
- 🤔 **思考模式开关** —— 启用思维链,并可设定推理深度:`high`(高)或 `max`(极高)。
- 🛰️ **校园 / WAF 友好代理** —— 对身处严格 WAF 后的服务商(如清华的 madmodel.cs.tsinghua.edu.cn),Deep Switch 会拉起一个内嵌的 Node.js 辅助进程(`scripts/tsinghua-proxy.mjs`),自动重试瞬时 404,把 `<think>` 推理段单独拆成 `reasoning_content` 增量,并把警告片段以 chunk 形式流回客户端——CLI 在重试期间不会卡住。
- 🪟 **关闭即隐入托盘** —— 关闭窗口后应用继续驻留菜单栏;右键托盘图标可彻底退出。
- 🌐 **双语界面** —— 简体中文与英文,自动识别系统语言,同时支持手动覆盖。
- 📌 **托盘菜单快速切换** —— 右键托盘图标即可在服务商间穿梭,无需打开主窗口;菜单文案跟随界面语言;状态变更通过 `active-provider-changed` 事件同步回主窗口。
- 🪄 **首次"检测当前配置"导入** —— 读取 Deep Code 当前的实际配置,一键变成可保存的服务商。
- 🔒 **凭据仅本地存储** —— 放在 `~/.deep-switch/config.json` 里,文件权限 `0600`。不上传、不同步、不留日志。
- 🎯 **健康检查** —— 可选地轻量探测服务商 Base URL,在 CLI 报错之前就告诉你通不通。
- 🪶 **轻量** —— 单一托盘图标,系统 WebView,体积约 12 MB。无内置 Chromium,无后台守护进程。

---

## 工作原理

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  预设 / 自定义    │  ───▶  │  在主窗口或托盘菜单中    │  ───▶  │  ~/.deepcode/        │
│  服务商列表       │        │  点击 "启用"            │        │  settings.json       │
│  (DeepSeek、      │        │                        │        │  会被 Rust 主进程写  │
│  Moonshot…)       │        │                        │        │  入磁盘。            │
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
3. Deep Switch 通过 Tauri Rust 主进程把新的 `settings.json` 写入磁盘。
4. 你下次调用 Deep Code CLI,它就会加载刚刚保存的这份文件。

整个回路,到此结束。

---

## 安装

### macOS(推荐)

**Homebrew(一行命令,自动帮你处理 Gatekeeper 隔离):**

```bash
brew install --cask skyedolyn-sys/deep-switch/deep-switch
```

**或手动安装:** 前往 [Releases](../../releases) 页面下载最新的 `.dmg`,把 **Deep Switch** 拖进「应用程序」文件夹即可。

> 因为构建尚未签名,首次从 DMG 启动时可能需要右键 → *打开* 来通过 Gatekeeper 提示。用 Homebrew cask 安装会自动跑 `xattr -cr`,跳过这一步。

### Linux 与 Windows

官方安装包现已发布——参见页面顶部的 [下载](#下载--download) 表。

**Linux 用哪个文件?**

- **`.deb`**(Debian / Ubuntu):约 4 MB,系统级安装,需要 `sudo`,通过 `apt` 借用系统已有的 WebKitGTK。安装命令:`sudo dpkg -i deep-switch_0.1.0_amd64.deb`(多数桌面文件管理器也可双击安装)。
- **`.AppImage`**(任意发行版,无需 root):约 80 MB,完全自包含——把 WebKitGTK 一并打包,因此 Arch / Fedora / openSUSE 上无需额外安装系统库即可运行。用法:`chmod +x deep-switch_0.1.0_amd64.AppImage && ./deep-switch_0.1.0_amd64.AppImage`,或直接双击。体积是可移植性的代价——所有依赖都随车携带。

如果更想从源码运行:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run tauri dev
```

---

## 开发

环境要求:**Node.js 20+** 以及 **Rust 1.77+**(Tauri 2 工具链)。

```bash
# 克隆
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 安装依赖(读取仓库自带的 lockfile)
npm install

# 开发模式 —— Vite + Tauri 启动,带 HMR
npm run tauri dev
# 纯渲染层(浏览器预览,无 Tauri):
npm run dev:renderer

# 渲染层类型检查
npx tsc --noEmit

# 当前平台的生产构建
npm run tauri build

# 代码检查
npm run lint
```

`npm run tauri dev` 启动 Vite 在 `http://localhost:5173`,然后用 Tauri WebView 窗口打开它——你会得到渲染进程热替换,以及改动 `src-tauri/src/**` 时 Rust 自动重编译。

---

## 技术栈

| 层级            | 技术选型                                          |
| --------------- | ------------------------------------------------- |
| 外壳            | **Tauri 2**(使用系统 WebView)                    |
| 渲染层          | **React 18** + **TypeScript 5** + **Vite 5**     |
| 原生后端        | **Rust 1.77+**(serde, reqwest, tauri-plugin-log)  |
| WAF 辅助进程    | 内嵌 **Node.js** 子进程(`scripts/tsinghua-proxy.mjs`),仅在切换到 WAF 保护的服务商时拉起;透明重试 + SSE 流式转发 |
| 国际化          | **i18next** + `i18next-browser-languagedetector` |
| 厂商图标        | **@lobehub/icons**(开源 SVG 品牌包)               |
| 本地存储        | `~/.deep-switch/config.json`(JSON,原子写入)       |
| 持久化          | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` + `~/.config/opencode/opencode.json` |

---

## 项目结构

```
deep-switch/
├── src/
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/         # ProviderCard、PresetSelector、ProviderDetail 等
│       ├── lib/                # vendor-icons.tsx(共享模块)
│       ├── locales/            # en.json、zh.json
│       ├── i18n.ts
│       └── global.css
├── src-tauri/                   # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs             # Tauri 入口
│   │   └── lib.rs              # 15 个 #[tauri::command] IPC + 托盘 + 数据库
│   ├── icons/                   # 应用图标集
│   ├── capabilities/           # Tauri 安全策略
│   ├── tauri.conf.json         # 窗口配置、identifier、打包设置
│   └── Cargo.toml
├── public/                      # 静态资源(托盘图标等)
├── docs/                        # 多语言与额外文档
├── .github/workflows/           # CI + 发布
│   ├── ci.yml
│   └── release.yml
├── tsconfig.json                # 渲染层 TS 配置
└── vite.config.mts
```

---

## 参与贡献

欢迎 PR——主题聚焦就好。

1. Fork 仓库后新建主题分支(`feat/<short-name>`、`fix/<short-name>`)。
2. 推送前请先执行 `npm run lint` 和 `npx tsc --noEmit`。
3. 提 PR 时讲清 **为什么** 改,而不仅仅是 *改了什么*。

补充服务商预设时,请改 `src-tauri/src/lib.rs`(`get_builtin_presets`)——务必同时维护 `description` / `descriptionEn`(以及 platform、hint、homepageUrl)中英文两个版本。
补充文案翻译时,请同步修改 `src/renderer/locales/en.json` 与 `src/renderer/locales/zh.json`,两侧 key 必须完全一致。

---

## 安全与隐私

- 🔐 **API Key 放在 `~/.deep-switch/config.json`**,仅在你本机。不上传到任何地方。Deep Switch 根本没有后端——没有「我们」。
- 🚫 **无埋点、无遥测、无崩溃上报**。不引入任何第三方脚本,不做任何远程配置拉取。
- 🌐 **Deep Switch 自身产生的网络流量**,只有打开模型选择器时可选的 `/v1/models` 请求,以及可选的健康检查——两者都直接从你的机器发到你选中的服务商。
- 🧪 **开源** —— 在你机器上跑的每一个字节都在本仓库里,随便审。

如发现安全问题,请用私密安全公告提交,而非公开 issue。

---

## 许可证

[MIT](../LICENSE) © 2026 Deep Switch contributors。

---

## 致谢

诚挚感谢以下服务商提供的 API,本应用正是建立在它们之上——**DeepSeek、Moonshot / Kimi、智谱 GLM、MiniMax、字节豆包、SiliconFlow、OpenRouter、OpenAI、Groq、商汤 SenseNova、清华 DeepSeek-R1**——以及 Tauri、React、Vite、Rust、i18next 的维护者们,他们的工作让这个应用的构建变得轻而易举。
