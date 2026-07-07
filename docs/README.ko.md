# Deep Switch

> **Deep Code** CLI 의 AI 공급사를 원클릭으로 전환합니다. 몇 초면 끝. 설정 파일을 열 필요도, 재시작도 없습니다.

---

## 다운로드 / Download

**최신 안정 버전:** [v0.1.0](../../releases/latest)

| 플랫폼 | 다운로드 | 크기 |
|---|---|---|
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned.dmg`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned.dmg) | ~183 MB |
| macOS (Apple Silicon) | [`Deep.Switch-0.1.0-arm64-resigned-mac.zip`](../../releases/download/v0.1.0/Deep.Switch-0.1.0-arm64-resigned-mac.zip) | ~176 MB |
| Linux / Windows | [소스에서 빌드](#개발) | — |

> ⚠️ **이 빌드는 서명되지 않았으며 Apple 공증도 받지 않았습니다.** 첫 실행 시 macOS 가 *'"Deep Switch" 가 손상되어 열 수 없습니다'* 를 표시합니다. 우회 방법:
> 1. DMG 를 열고 **Deep Switch** 를 `/Applications` 로 드래그합니다.
> 2. **Finder** 에서 `/Applications` 로 이동해 **Deep Switch** 를 우클릭 → **열기** → 대화 상자에서 확인을 클릭합니다.
> 3. 그 후로는 일반적인 더블 클릭으로 실행할 수 있습니다.
>
> 터미널 방법: `sudo xattr -dr com.apple.quarantine "/Applications/Deep Switch.app"`
>
> Apple Developer ID 를 확보하는 대로 서명 + 공증 버전으로 전환할 예정입니다. 그때까지 위 방법을 사용해 주세요.

---

## 언어 / Languages

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

**Deep Code CLI 전용 공급사 전환 도구 ── 당신이 실제로 일하는 방식을 위해 만들어졌습니다.**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](../LICENSE)
[![Platform](https://img.shields.io/badge/platform-macOS%20%7C%20Linux%20%7C%20Windows-blue)](#설치)
[![Electron](https://img.shields.io/badge/electron-28-9feaf9)](https://www.electronjs.org)
[![React](https://img.shields.io/badge/react-18-61dafb)](https://react.dev)

</div>

---

## Deep Switch 가 뭔가요?

Deep Switch 는 macOS 의 메뉴 막대 / Dock 에 살짝 자리 잡는 작은 유틸리티입니다(Linux 와 Windows 에서는 시스템 트레이). `~/.deepcode/settings.json` 을 직접 써서 **Deep Code** CLI 가 다음에 붙을 AI 공급사를 즉시 바꿔줍니다. 한 번만 등록해두면, JSON 파일을 열 필요 없이 클릭 한 번으로 전환 완료.

Deep Switch 는 Deep Code **를 위한** 미러링 / 교체용 유틸리티입니다. Deep Code 본체는 손대지 않고, CLI 가 다음 호출 때 읽어 들일 설정만 손대도록 설계되어 있습니다.

---

## 왜 필요한가요?

여러 공급사를 오가며 일하는 게 이렇게 번거로울 이유는 없습니다.

- 🧩 **공급사가 너무 많고, 키도 너무 많습니다** ── DeepSeek, Moonshot, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq … 각각 자기만의 Base URL 과 모델 이름, 그리고 자기만의 까탈스러움이 있습니다.
- 📝 **`settings.json` 을 손으로 편집** ── 키 한 글자만 잘못 입력하거나 콤마 하나 빠뜨리면 JSON 이 망가집니다.
- 🐢 **전환이 너무 느립니다** ── CLI 종료, 파일 수정, 재시작, 대기, 반복.
- 💾 **백업 상태가 쉽게 사라집니다** ── 한 번 덮어쓰면 옛날 설정은 영원히 돌아오지 않습니다.
- 🔁 **반복 작업** ── 새 프로젝트를 시작할 때마다 같은 의식을 반복합니다.

Deep Switch 는 이 모든 것을 클릭 한 번으로 정리합니다.

---

## 기능

- ⚡ **원클릭 활성화** ── 공급사를 고르고 *활성화* 를 누르면 끝.
- 📦 **풍부한 프리셋** ── DeepSeek · Moonshot/Kimi · Zhipu GLM · MiniMax · ByteDance Doubao · SiliconFlow · OpenRouter · OpenAI · Groq, 그리고 자유롭게 채울 수 있는 *사용자 지정* 슬롯.
- 🔄 **실시간 적용** ── `~/.deepcode/settings.json` 을 직접 새로 씁니다. 다음 CLI 호출부터는 이미 새 공급사로 붙어 있습니다. **재시작 불필요.**
- 🧠 **모델 선택기** ── 공급자의 `/v1/models` 엔드포인트에서 실제로 노출되는 모델 목록을 실시간으로 받아옵니다.
- 🤔 **사고 모드 토글** ── 체인 오브 소트를 켜고, 추론 깊이를 `high` 또는 `max` 로 선택.
- 🌐 **이중 언어 UI** ── 한국어와 영문, 시스템 로케일을 자동 감지, 수동으로 덮어쓰기 가능.
- 📌 **트레이 메뉴 빠른 전환** ── 트레이 아이콘을 우클릭하면 메인 창을 열지 않고도 공급사 전환. 메뉴 라벨은 UI 언어에 맞춰 표시.
- 🪄 **최초 “현재 설정 감지” 가져오기** ── Deep Code 가 현재 사용 중인 설정을 그대로 읽어, 클릭 한 번에 저장 가능한 공급사로 등록.
- 🔒 **자격 증명은 로컬에만 보관** ── `~/.deep-switch/config.json` 에 저장. 업로드도, 동기화도, 로깅도 하지 않습니다.
- 🛟 **백업과 복원** ── 매번 쓸 때마다 직전 파일을 스냅샷으로 남겨, 잘못 전환해도 클릭 한 번으로 되돌릴 수 있습니다.
- 🎯 **헬스 체크** ── 공급자의 Base URL 을 가볍게 점검해, CLI 가 불평하기 전에 “붙을 수 있는지” 알려 줍니다.
- 🪶 **가볍습니다** ── 트레이 아이콘 하나뿐. 백그라운드 데몬도, 불필요하게 무거운 엔진도 없습니다.

---

## 동작 방식

```
┌──────────────────┐        ┌────────────────────────┐        ┌──────────────────────┐
│  프리셋 /         │  ───▶  │  메인 창 또는            │  ───▶  │  ~/.deepcode/        │
│  사용자 지정      │        │  트레이 메뉴에서          │        │  settings.json       │
│  공급사 목록      │        │  “활성화” 클릭           │        │  이 메인 프로세스에     │
│  (DeepSeek,       │        │                        │        │  의해 디스크에 기록됨  │
│  Moonshot …)      │        │                        │        │                      │
└──────────────────┘        └────────────────────────┘        └──────────┬───────────┘
                                                                        │
                                                                        ▼
                                                            ┌──────────────────────────┐
                                                            │  Deep Code CLI 의 다음      │
                                                            │  호출에서 새 settings 을   │
                                                            │  읽어 선택한 공급사로       │
                                                            │  붙습니다.                  │
                                                            └──────────────────────────┘
```

순서는 단 네 단계:

1. 공급사를 **추가** (프리셋 선택 또는 Base URL + Key 붙여넣기).
2. 메인 창 또는 트레이 메뉴에서 **활성화**.
3. Deep Switch 메인 프로세스가 새 `settings.json` 을 디스크에 씁니다.
4. 다음에 Deep Code CLI 를 호출하면 방금 저장한 파일이 로드됩니다.

이게 끝입니다.

---

## 설치

### macOS(권장)

#### Homebrew(추천)

```bash
brew install --cask deep-switch
```

#### 직접 다운로드

[Releases](../../releases) 페이지에서 최신 `.dmg` 또는 `.zip` 을 받고, **Deep Switch** 를 “응용 프로그램” 폴더로 끌어다 놓으세요.

> 빌드가 서명되지 않아, DMG 에서 첫 실행 시 우클릭 → *열기* 로 Gatekeeper 안내를 통과시켜야 할 수 있습니다.

### Linux & Windows

아직 정식 설치 프로그램은 없지만, 소스에서 바로 실행할 수 있습니다:

```bash
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch
npm install
npm run dev
```

바이너리를 직접 패키징하고 싶다면 아래 [개발](#개발) 섹션의 `npm run dist` 를 참고하세요.

---

## 개발

요구 사항:**Node.js 18 이상**, **npm 9 이상**.

```bash
# 클론
git clone https://github.com/skyedolyn-sys/deep-switch.git
cd deep-switch

# 의존성 설치(저장소 동봉 lockfile 사용)
npm install

# 개발 모드 ── Vite + Electron 동시 실행, HMR 지원
npm run dev

# 메인 프로세스 타입 검사 + 빌드
npm run build:main

# 렌더러 타입 검사 + 빌드
npm run build:renderer

# 운영 빌드 일식
npm run build

# 현재 플랫폼용 바이너리 패키징
npm run dist

# 린트
npm run lint
```

`npm run dev` 는 Vite 를 `http://localhost:5173` 에 띄우고 Electron 이 그쪽을 가리키도록 실행합니다. 렌더러는 HMR 로 갱신되고, 메인 프로세스는 TypeScript 파일 변경 시 빠르게 재시작됩니다.

---

## 기술 스택

| 계층           | 사용 기술                                          |
| -------------- | ------------------------------------------------- |
| 셸             | **Electron 28**                                  |
| 렌더러         | **React 18** + **TypeScript 5**                  |
| 번들러 (web)   | **Vite 5**                                       |
| 번들러 (앱)     | **electron-builder 24**                          |
| 다국어         | **i18next** + `i18next-browser-languagedetector` |
| 로컬 저장소    | `electron-store`(OS 키체인이 가능하면 암호화 저장) |
| 영구 저장      | `~/.deep-switch/config.json` + `~/.deepcode/settings.json` |

---

## 프로젝트 구조

```
deep-switch/
├── src/
│   ├── main/                   # Electron 메인 프로세스
│   │   ├── index.ts            # 앱 & 트레이 기동
│   │   ├── presets.ts          # 내장 공급사 프리셋
│   │   ├── provider-manager.ts # 사용자 공급사 CRUD
│   │   ├── vendors.ts          # 벤더 메타데이터
│   │   ├── health-check.ts     # 선택형 Base URL 점검
│   │   └── quota.ts            # 쿼터 스냅샷
│   ├── preload/                # contextBridge 노출면
│   └── renderer/               # React UI
│       ├── App.tsx
│       ├── components/
│       ├── locales/            # en.json, zh.json
│       ├── i18n.ts
│       └── global.css
├── build/                      # 앱 아이콘
├── public/                     # 정적 자산
├── scripts/                    # 보조 스크립트
├── docs/                       # 다국어 & 추가 문서
├── electron-builder 설정 위치   # package.json → "build"
├── tsconfig.json               # 렌더러 TS 설정
├── tsconfig.main.json          # 메인 프로세스 TS 설정
└── vite.config.ts
```

---

## 기여하기

PR 환영 ── 주제를 집중해 주세요.

1. 저장소를 포크하고 토픽 브랜치를 만듭니다(`feat/<short-name>`, `fix/<short-name>`).
2. 푸시 전에 `npm run lint` 와 `npm run build` 를 실행.
3. PR 에서는 *무엇* 을 바꿨는지보다 **왜** 바꿨는지를 적어 주세요.

공급사 프리셋을 추가할 때는 `src/main/presets.ts` 를 편집하고, `description` / `descriptionEn`(및 platform, hint) 의 두 언어 버전을 함께 유지해 주세요.
번역을 추가할 때는 `src/renderer/locales/en.json` 과 `src/renderer/locales/zh.json` 을 함께 편집해 키가 정확히 일치하도록 맞춰 주세요.

---

## 보안 & 프라이버시

- 🔐 **API 키는 `~/.deep-switch/config.json` 에 로컬로만 보관** 됩니다. 외부로 절대 전송하지 않습니다. “우리” 같은 건 없습니다 ── Deep Switch 에는 백엔드가 없어요.
- 🚫 **분석, 텔레메트리, 크래시 리포트 없음**. 서드파티 스크립트도, 원격 설정 가져오기도 일체 하지 않습니다.
- 🌐 **Deep Switch 가 직접 발생시키는 네트워크 트래픽은** 모델 선택기 사용 시의 선택적 `/v1/models` 요청과 선택적 헬스 체크뿐 ── 둘 다 사용자의 머신에서 선택한 공급사로 곧장 향합니다.
- 🧪 **오픈 소스** ── 사용자의 머신에서 실행되는 모든 바이트가 이 저장소에 들어 있습니다. 마음껏 검증해 주세요.
- 🧯 **자동 백업** ── `~/.deepcode/settings.json` 을 쓸 때마다 직전 파일을 스냅샷으로 보관합니다. 잘못 전환해도 한 번 클릭으로 되돌릴 수 있습니다.

보안 이슈를 발견하시면 공개 이슈가 아닌 비공개 자문으로 알려 주세요.

---

## 라이선스

[MIT](../LICENSE) © 2026 Deep Switch contributors.

---

## 감사의 말

이 앱이 라우팅하는 API 를 제공해 준 공급사들 ── **DeepSeek, Moonshot / Kimi, Zhipu GLM, MiniMax, ByteDance Doubao, SiliconFlow, OpenRouter, OpenAI, Groq** ── 그리고 Electron, React, Vite, i18next 의 메인테이너께 깊은 감사를 드립니다. 그들 덕분에 이 앱을 가볍게 만들 수 있습니다.
