use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use std::collections::HashMap;
use std::time::Instant;
use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::menu::{Menu, MenuItem, PredefinedMenuItem, Submenu};
use tauri::tray::TrayIconBuilder;

// ─── Data Structs ────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProviderConfig {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub api_key: String,
    pub model: String,
    pub api_format: String, // "openai" | "anthropic"
    pub thinking_enabled: bool,
    pub reasoning_effort: String, // "high" | "max"
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    pub active_provider_id: Option<String>,
    pub deep_code_config_path: String,
    pub preferred_language: String, // "system" | "zh" | "en"
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StoredData {
    pub providers: Vec<ProviderConfig>,
    pub settings: AppSettings,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct ProviderPreset {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub model: String,
    pub vendor: String,
    pub api_format: String,
    pub thinking_enabled: bool,
    pub reasoning_effort: String,
    pub description: String,
    pub description_en: String,
    pub hint: Option<String>,
    pub hint_en: Option<String>,
    pub platform: String,
    pub platform_en: String,
    pub context_window: Option<u64>,
    pub card_suffix: Option<String>,
    pub card_suffix_en: Option<String>,
    pub homepage_url: Option<String>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct LocalizedPreset {
    pub id: String,
    pub name: String,
    pub base_url: String,
    pub model: String,
    pub vendor: String,
    pub api_format: String,
    pub thinking_enabled: bool,
    pub reasoning_effort: String,
    pub description: String,
    pub hint: Option<String>,
    pub platform: String,
    pub context_window: Option<u64>,
    pub card_suffix: Option<String>,
    pub homepage_url: Option<String>,
}

// ─── Default Config ──────────────────────────────────────────────────────────

impl Default for StoredData {
    fn default() -> Self {
        let home = dirs::home_dir().expect("could not get home directory");
        let default_deepcode_config = home.join(".deepcode").join("settings.json").to_string_lossy().to_string();
        StoredData {
            providers: Vec::new(),
            settings: AppSettings {
                active_provider_id: None,
                deep_code_config_path: default_deepcode_config,
                preferred_language: "system".to_string(),
            },
        }
    }
}

impl StoredData {
    pub fn migrate(&mut self) -> bool {
        let mut changed = false;
        
        let before_len = self.providers.len();
        self.providers.retain(|p| {
            let u = p.base_url.to_lowercase();
            !u.contains("127.0.0.1:9527") && !u.contains("localhost:9527")
        });
        if self.providers.len() != before_len {
            changed = true;
        }

        let before_len = self.providers.len();
        self.providers.retain(|p| {
            let k = &p.api_key;
            !(k.contains("Test Connection") || k.contains("BASIC INFO") || k.len() > 500)
        });
        if self.providers.len() != before_len {
            changed = true;
        }

        changed
    }
}

// ─── Database / Storage Manager ──────────────────────────────────────────────

pub struct AppDb {
    pub store_path: PathBuf,
    pub data: Mutex<StoredData>,
    pub health_cache: Mutex<HashMap<String, (bool, u64)>>,
}

impl AppDb {
    pub fn new() -> Self {
        let home = dirs::home_dir().expect("could not find home directory");
        let dir = home.join(".deep-switch");
        let store_path = dir.join("config.json");

        let mut data = StoredData::default();
        if store_path.exists() {
            if let Ok(raw) = fs::read_to_string(&store_path) {
                if let Ok(parsed) = serde_json::from_str::<StoredData>(&raw) {
                    data = parsed;
                }
            }
        }
        
        let db = AppDb {
            store_path,
            data: Mutex::new(data),
            health_cache: Mutex::new(HashMap::new()),
        };
        
        // Run migration
        {
            let mut guard = db.data.lock().unwrap();
            if guard.migrate() {
                db.save_locked(&guard);
            }
        }
        
        db
    }

    pub fn save(&self) {
        let guard = self.data.lock().unwrap();
        self.save_locked(&guard);
    }

    fn save_locked(&self, guard: &StoredData) {
        if let Some(parent) = self.store_path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        if let Ok(serialized) = serde_json::to_string_pretty(guard) {
            let _ = fs::write(&self.store_path, serialized);
        }
    }
}

// ─── Preset Lists ────────────────────────────────────────────────────────────

fn get_builtin_presets() -> Vec<ProviderPreset> {
    vec![
        ProviderPreset {
            id: "deepseek-v4-pro".to_string(),
            name: "DeepSeek".to_string(),
            base_url: "https://api.deepseek.com".to_string(),
            model: "deepseek-v4-pro".to_string(),
            vendor: "DeepSeek".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "max".to_string(),
            description: "V4 Pro · 推荐 · 1M 上下文 · 深度思考 · Agent 主力".to_string(),
            description_en: "V4 Pro · Recommended · 1M context · Deep reasoning · Agent-ready".to_string(),
            hint: Some("https://platform.deepseek.com/api_keys 获取 Key (sk- 开头)".to_string()),
            hint_en: Some("Get key at https://platform.deepseek.com/api_keys (sk- prefix)".to_string()),
            platform: "DeepSeek Platform".to_string(),
            platform_en: "DeepSeek Platform".to_string(),
            context_window: Some(1000000),
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://platform.deepseek.com".to_string()),
},
        ProviderPreset {
            id: "deepseek-v4-flash".to_string(),
            name: "DeepSeek".to_string(),
            base_url: "https://api.deepseek.com".to_string(),
            model: "deepseek-v4-flash".to_string(),
            vendor: "DeepSeek".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "high".to_string(),
            description: "V4 Flash · 快速响应 · 性价比高 · 轻量任务首选".to_string(),
            description_en: "V4 Flash · Fast response · Cost-effective · Best for lightweight tasks".to_string(),
            hint: None,
            hint_en: None,
            platform: "DeepSeek Platform".to_string(),
            platform_en: "DeepSeek Platform".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://platform.deepseek.com".to_string()),
},
        ProviderPreset {
            id: "deepseek-r1".to_string(),
            name: "DeepSeek".to_string(),
            base_url: "https://api.deepseek.com".to_string(),
            model: "deepseek-reasoner".to_string(),
            vendor: "DeepSeek".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "max".to_string(),
            description: "R1 纯推理 · 数学/代码/逻辑 · 思维链".to_string(),
            description_en: "R1 pure reasoning · Math / code / logic · Chain-of-thought".to_string(),
            hint: None,
            hint_en: None,
            platform: "DeepSeek Platform".to_string(),
            platform_en: "DeepSeek Platform".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://platform.deepseek.com".to_string()),
},
        ProviderPreset {
            id: "kimi-k2.7-code".to_string(),
            name: "Kimi".to_string(),
            base_url: "https://api.moonshot.cn/v1".to_string(),
            model: "kimi-k2.7-code".to_string(),
            vendor: "Moonshot".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "max".to_string(),
            description: "K2.7 Code · Coding 专用 · 256K 上下文 · 30% 减 thinking 用量".to_string(),
            description_en: "K2.7 Code · Coding-optimized · 256K context · 30% less thinking usage".to_string(),
            hint: Some("platform.moonshot.cn 控制台 · Key 前缀 sk-".to_string()),
            hint_en: Some("Get key from platform.moonshot.cn console · sk- prefix".to_string()),
            platform: "Moonshot 开放平台 (platform.moonshot.cn)".to_string(),
            platform_en: "Moonshot Open Platform (platform.moonshot.cn)".to_string(),
            context_window: Some(262144),
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://platform.moonshot.cn".to_string()),
},
        ProviderPreset {
            id: "kimi-for-coding".to_string(),
            name: "Kimi".to_string(),
            base_url: "https://api.kimi.com/coding/v1".to_string(),
            model: "kimi-for-coding".to_string(),
            vendor: "Moonshot".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "max".to_string(),
            description: "For Coding · Kimi Plus 会员 Coding 专用 · 256K 上下文".to_string(),
            description_en: "For Coding · Kimi Plus members · Coding-optimized · 256K context".to_string(),
            hint: Some("kimi.com/code 订阅 · Key 前缀 sk-kimi-".to_string()),
            hint_en: Some("Subscribe at kimi.com/code · sk-kimi- prefix".to_string()),
            platform: "Kimi Code (www.kimi.com/code/)".to_string(),
            platform_en: "Kimi Code (www.kimi.com/code/)".to_string(),
            context_window: Some(262144),
            card_suffix: Some(" · Coding".to_string()),
            card_suffix_en: Some(" · Coding".to_string()),
            homepage_url: Some("https://kimi.com/code".to_string()),
},
        ProviderPreset {
            id: "zhipu-glm".to_string(),
            name: "GLM".to_string(),
            base_url: "https://open.bigmodel.cn/api/paas/v4".to_string(),
            model: "glm-4-plus".to_string(),
            vendor: "Zhipu".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: false,
            reasoning_effort: "max".to_string(),
            description: "GLM-4 Plus 旗舰 · 可下拉切换 glm-4-flash / glm-4-air 等".to_string(),
            description_en: "GLM-4 Plus flagship · Switch to glm-4-flash / glm-4-air via dropdown".to_string(),
            hint: Some("open.bigmodel.cn 获取 Key".to_string()),
            hint_en: Some("Get key at open.bigmodel.cn".to_string()),
            platform: "智谱开放平台 (open.bigmodel.cn)".to_string(),
            platform_en: "Zhipu Open Platform (open.bigmodel.cn)".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://open.bigmodel.cn".to_string()),
},
        ProviderPreset {
            id: "siliconflow".to_string(),
            name: "SiliconFlow".to_string(),
            base_url: "https://api.siliconflow.cn/v1".to_string(),
            model: "deepseek-ai/DeepSeek-V3".to_string(),
            vendor: "SiliconFlow".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: false,
            reasoning_effort: "max".to_string(),
            description: "硅基流动 · 模型聚合 · DeepSeek/Qwen 等开源模型 · 免费额度".to_string(),
            description_en: "SiliconFlow · Model hub · DeepSeek/Qwen open models · Free tier".to_string(),
            hint: None,
            hint_en: None,
            platform: "SiliconFlow (siliconflow.cn)".to_string(),
            platform_en: "SiliconFlow (siliconflow.cn)".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://siliconflow.cn".to_string()),
},
        ProviderPreset {
            id: "openrouter".to_string(),
            name: "OpenRouter".to_string(),
            base_url: "https://openrouter.ai/api/v1".to_string(),
            model: "deepseek/deepseek-r1".to_string(),
            vendor: "OpenRouter".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: true,
            reasoning_effort: "max".to_string(),
            description: "全球模型网关 · 按量付费 · Claude/GPT/DeepSeek 等".to_string(),
            description_en: "Global model gateway · Pay-as-you-go · Claude/GPT/DeepSeek and more".to_string(),
            hint: None,
            hint_en: None,
            platform: "OpenRouter (openrouter.ai)".to_string(),
            platform_en: "OpenRouter (openrouter.ai)".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://openrouter.ai".to_string()),
},
        ProviderPreset {
            id: "openai".to_string(),
            name: "OpenAI".to_string(),
            base_url: "https://api.openai.com/v1".to_string(),
            model: "gpt-4o".to_string(),
            vendor: "OpenAI".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: false,
            reasoning_effort: "max".to_string(),
            description: "GPT-4o · 128K 上下文 · 多模态 · 通用标杆".to_string(),
            description_en: "GPT-4o · 128K context · Multimodal · General benchmark".to_string(),
            hint: None,
            hint_en: None,
            platform: "OpenAI Platform".to_string(),
            platform_en: "OpenAI Platform".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: Some("https://platform.openai.com".to_string()),
},
        ProviderPreset {
            id: "custom-blank".to_string(),
            name: "自定义".to_string(),
            base_url: "".to_string(),
            model: "".to_string(),
            vendor: "Custom".to_string(),
            api_format: "openai".to_string(),
            thinking_enabled: false,
            reasoning_effort: "max".to_string(),
            description: "空白模板 · 手动填写 Base URL / Model / Name — 私有部署、自建代理".to_string(),
            description_en: "Blank template · Fill in Base URL / Model / Name manually — self-hosted or private proxy".to_string(),
            hint: Some("下一步会让你填完整信息".to_string()),
            hint_en: Some("Next step will ask for full details".to_string()),
            platform: "任意 OpenAI 兼容端点".to_string(),
            platform_en: "Any OpenAI-compatible endpoint".to_string(),
            context_window: None,
            card_suffix: None,
            card_suffix_en: None,
            homepage_url: None,
        },
    ]
}

// ─── Translation & Utilities ──────────────────────────────────────────────────

fn tr(key: &str, lang: &str) -> String {
    let is_zh = lang == "zh" || lang.starts_with("zh");
    match key {
        "tray.openMainWindow" => if is_zh { "打开主界面" } else { "Open Main Window" }.to_string(),
        "tray.openOfficialSite" => if is_zh { "打开官方网站" } else { "Open Official Website" }.to_string(),
        "tray.noActiveProvider" => if is_zh { "未激活 — 在主窗口选择供应商" } else { "No active provider — select one in the main window" }.to_string(),
        "tray.switchProvider" => if is_zh { "切换供应商" } else { "Switch Provider" }.to_string(),
        "tray.noProviders" => if is_zh { "（暂无供应商）" } else { "(No providers)" }.to_string(),
        "tray.quit" => if is_zh { "退出" } else { "Quit" }.to_string(),
        "provider.status.untested" => if is_zh { "未测试" } else { "Untested" }.to_string(),
        _ => key.to_string(),
    }
}

fn get_lang(data: &StoredData) -> &str {
    let preferred = &data.settings.preferred_language;
    if preferred == "zh" || preferred == "en" {
        preferred
    } else {
        "zh"
    }
}

fn guess_vendor(url: &str) -> String {
    let u = url.to_lowercase();
    if u.contains("deepseek") { return "DeepSeek".to_string(); }
    if u.contains("openai") { return "OpenAI".to_string(); }
    if u.contains("moonshot") || u.contains("kimi") { return "Moonshot (Kimi)".to_string(); }
    if u.contains("bigmodel") || u.contains("z.ai") { return "Zhipu (GLM)".to_string(); }
    if u.contains("minimax") || u.contains("minimaxi") { return "MiniMax".to_string(); }
    if u.contains("volces") { return "ByteDance (Doubao)".to_string(); }
    if u.contains("siliconflow") { return "SiliconFlow".to_string(); }
    if u.contains("openrouter") { return "OpenRouter".to_string(); }
    if u.contains("groq") { return "Groq".to_string(); }
    "Custom".to_string()
}

fn open_url(url: &str) {
    #[cfg(target_os = "macos")]
    let _ = std::process::Command::new("open").arg(url).spawn();
    #[cfg(target_os = "windows")]
    let _ = std::process::Command::new("cmd").args(&["/C", "start", url]).spawn();
    #[cfg(target_os = "linux")]
    let _ = std::process::Command::new("xdg-open").arg(url).spawn();
}

// ─── Health / Latency Checks ─────────────────────────────────────────────────

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TestResult {
    pub ok: bool,
    pub latency_ms: u64,
    pub error: Option<String>,
    pub model: Option<String>,
}

async fn test_provider_connection(
    base_url: &str,
    api_key: &str,
    model: &str,
    api_format: &str,
) -> TestResult {
    let base = base_url.trim_end_matches('/').trim_end_matches("/v1");
    let is_anthropic = api_format == "anthropic";
    let url = if is_anthropic {
        format!("{}/v1/messages", base)
    } else {
        format!("{}/v1/chat/completions", base)
    };
    
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build() 
    {
        Ok(c) => c,
        Err(e) => return TestResult { ok: false, latency_ms: 0, error: Some(e.to_string()), model: Some(model.to_string()) }
    };

    let mut req = client.post(&url).header("Content-Type", "application/json");
    if is_anthropic {
        req = req.header("x-api-key", api_key).header("anthropic-version", "2023-06-01");
    } else {
        req = req.header("Authorization", format!("Bearer {}", api_key));
    }

    let body = serde_json::json!({
        "model": model,
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 1,
        "stream": false
    });

    let start = Instant::now();
    let res = req.json(&body).send().await;
    let latency = start.elapsed().as_millis() as u64;

    match res {
        Ok(response) => {
            if response.status().is_success() {
                TestResult { ok: true, latency_ms: latency, error: None, model: Some(model.to_string()) }
            } else {
                let status = response.status().as_u16();
                if status == 401 || status == 403 {
                    TestResult { ok: false, latency_ms: latency, error: Some("API Key 无效或已过期".to_string()), model: Some(model.to_string()) }
                } else {
                    let text = response.text().await.unwrap_or_default();
                    let truncated = if text.len() > 200 { &text[0..200] } else { &text };
                    TestResult { ok: false, latency_ms: latency, error: Some(format!("HTTP {}: {}", status, truncated)), model: Some(model.to_string()) }
                }
            }
        }
        Err(e) => {
            let err_msg = if e.is_timeout() {
                "连接超时 (8s)".to_string()
            } else {
                e.to_string()
            };
            TestResult { ok: false, latency_ms: latency, error: Some(err_msg), model: Some(model.to_string()) }
        }
    }
}

async fn test_provider_in_background(
    app_handle: tauri::AppHandle,
    provider: ProviderConfig,
) {
    let res = test_provider_connection(
        &provider.base_url,
        &provider.api_key,
        &provider.model,
        &provider.api_format,
    ).await;
    
    let state = app_handle.state::<AppDb>();
    {
        let mut cache = state.health_cache.lock().unwrap();
        cache.insert(provider.id.clone(), (res.ok, res.latency_ms));
    }
    
    let guard = state.data.lock().unwrap();
    let _ = rebuild_tray_menu(&app_handle, &guard);
}

// ─── Deep Code Settings Helper ───────────────────────────────────────────────

fn apply_to_deepcode_internal(provider: &ProviderConfig, data: &StoredData) -> bool {
    let config_path = PathBuf::from(&data.settings.deep_code_config_path);

    if let Some(parent) = config_path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    let mut existing = if config_path.exists() {
        if let Ok(raw) = fs::read_to_string(&config_path) {
            serde_json::from_str::<serde_json::Value>(&raw).unwrap_or(serde_json::json!({}))
        } else {
            serde_json::json!({})
        }
    } else {
        serde_json::json!({})
    };

    if !existing.is_object() {
        existing = serde_json::json!({});
    }

    let mut env = existing.get("env").cloned().unwrap_or(serde_json::json!({}));
    if !env.is_object() {
        env = serde_json::json!({});
    }

    if let Some(env_obj) = env.as_object_mut() {
        env_obj.insert("BASE_URL".to_string(), serde_json::Value::String(provider.base_url.clone()));
        env_obj.insert("API_KEY".to_string(), serde_json::Value::String(provider.api_key.clone()));
        env_obj.insert("MODEL".to_string(), serde_json::Value::String(provider.model.clone()));
    }

    if let Some(obj) = existing.as_object_mut() {
        obj.insert("env".to_string(), env);
        obj.insert("thinkingEnabled".to_string(), serde_json::Value::Bool(provider.thinking_enabled));
        obj.insert("reasoningEffort".to_string(), serde_json::Value::String(provider.reasoning_effort.clone()));
    }

    if let Ok(serialized) = serde_json::to_string_pretty(&existing) {
        fs::write(&config_path, serialized).is_ok()
    } else {
        false
    }
}

// ─── Tray Menu Builder ────────────────────────────────────────────────────────

fn format_active_label(p: &ProviderConfig, cache: &HashMap<String, (bool, u64)>, lang: &str) -> String {
    let vendor = guess_vendor(&p.base_url);
    let (dot, right) = if let Some(&(ok, latency)) = cache.get(&p.id) {
        if ok {
            ("🟢", format!("{}ms", latency))
        } else {
            ("🔴", "Error".to_string())
        }
    } else {
        ("🟡", tr("provider.status.untested", lang))
    };
    format!("{} · {} · {} {}", p.name, vendor, dot, right)
}

fn load_tray_icon(app_handle: &tauri::AppHandle) -> Option<tauri::image::Image<'_>> {
    let paths = [
        app_handle.path().resource_dir().unwrap_or_default().join("public").join("icons").join("tray-template.png"),
        std::env::current_dir().unwrap_or_default().join("public").join("icons").join("tray-template.png"),
    ];

    for path in &paths {
        if path.exists() {
            if let Ok(img) = tauri::image::Image::from_path(path) {
                return Some(img);
            }
        }
    }
    
    app_handle.default_window_icon().cloned()
}

fn rebuild_tray_menu(app_handle: &tauri::AppHandle, data: &StoredData) -> Result<(), tauri::Error> {
    let tray = match app_handle.tray_by_id("main") {
        Some(t) => t,
        None => return Ok(()),
    };

    let lang = get_lang(data);
    let menu = Menu::new(app_handle)?;
    
    let open_main = MenuItem::with_id(app_handle, "open_main", &tr("tray.openMainWindow", lang), true, None::<&str>)?;
    menu.append(&open_main)?;
    
    let open_site = MenuItem::with_id(app_handle, "open_site", &tr("tray.openOfficialSite", lang), true, None::<&str>)?;
    menu.append(&open_site)?;
    
    menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
    
    let active_label = if let Some(active_id) = &data.settings.active_provider_id {
        if let Some(active) = data.providers.iter().find(|p| &p.id == active_id) {
            let state = app_handle.state::<AppDb>();
            let cache = state.health_cache.lock().unwrap();
            format_active_label(active, &cache, lang)
        } else {
            tr("tray.noActiveProvider", lang)
        }
    } else {
        tr("tray.noActiveProvider", lang)
    };
    let active_item = MenuItem::with_id(app_handle, "active_indicator", &active_label, false, None::<&str>)?;
    menu.append(&active_item)?;
    
    let submenu = Submenu::new(app_handle, &tr("tray.switchProvider", lang), true)?;
    if data.providers.is_empty() {
        let empty_item = MenuItem::with_id(app_handle, "empty_providers", &tr("tray.noProviders", lang), false, None::<&str>)?;
        submenu.append(&empty_item)?;
    } else {
        for p in &data.providers {
            let label = if data.settings.active_provider_id.as_ref() == Some(&p.id) {
                format!("{}  ✓", p.name)
            } else {
                p.name.clone()
            };
            let id = format!("apply_{}", p.id);
            let item = MenuItem::with_id(app_handle, &id, &label, true, None::<&str>)?;
            submenu.append(&item)?;
        }
    }
    menu.append(&submenu)?;
    
    menu.append(&PredefinedMenuItem::separator(app_handle)?)?;
    
    let quit_item = MenuItem::with_id(app_handle, "quit", &tr("tray.quit", lang), true, None::<&str>)?;
    menu.append(&quit_item)?;
    
    tray.set_menu(Some(menu))?;
    Ok(())
}

// ─── Tauri Commands ──────────────────────────────────────────────────────────

#[tauri::command]
fn list_providers(state: tauri::State<AppDb>) -> Vec<ProviderConfig> {
    let guard = state.data.lock().unwrap();
    guard.providers.iter().map(|p| {
        let mut cloned = p.clone();
        if !cloned.api_key.is_empty() {
            cloned.api_key = "••••••••".to_string();
        }
        cloned
    }).collect()
}

#[tauri::command]
fn get_provider(state: tauri::State<AppDb>, id: String) -> Option<ProviderConfig> {
    let guard = state.data.lock().unwrap();
    guard.providers.iter().find(|p| p.id == id).cloned()
}

#[tauri::command]
fn save_provider(state: tauri::State<AppDb>, provider: serde_json::Value) -> Result<ProviderConfig, String> {
    let mut guard = state.data.lock().unwrap();
    
    let id_opt = provider.get("id").and_then(|v| v.as_str());
    let name = provider.get("name").and_then(|v| v.as_str()).ok_or("Name is required")?.to_string();
    let base_url = provider.get("baseUrl").and_then(|v| v.as_str()).ok_or("BaseUrl is required")?.to_string();
    let model = provider.get("model").and_then(|v| v.as_str()).ok_or("Model is required")?.to_string();
    let api_key_opt = provider.get("apiKey").and_then(|v| v.as_str());

    let api_format = provider.get("apiFormat").and_then(|v| v.as_str()).unwrap_or("openai").to_string();
    let thinking_enabled = provider.get("thinkingEnabled").and_then(|v| v.as_bool()).unwrap_or(false);
    let reasoning_effort = provider.get("reasoningEffort").and_then(|v| v.as_str()).unwrap_or("high").to_string();

    let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);

    if let Some(id) = id_opt {
        if let Some(idx) = guard.providers.iter().position(|p| p.id == id) {
            let existing = &guard.providers[idx];
            let api_key = if let Some(key) = api_key_opt {
                if key.is_empty() || key == "••••••••" {
                    existing.api_key.clone()
                } else {
                    key.to_string()
                }
            } else {
                existing.api_key.clone()
            };
            
            let updated = ProviderConfig {
                id: id.to_string(),
                name,
                base_url,
                model,
                api_key,
                api_format,
                thinking_enabled,
                reasoning_effort,
                created_at: existing.created_at.clone(),
                updated_at: now,
            };
            guard.providers[idx] = updated.clone();
            state.save_locked(&guard);
            return Ok(updated);
        }
    }

    // Create new
    let new_id = uuid::Uuid::new_v4().to_string();
    let api_key = api_key_opt.unwrap_or("").to_string();
    let created = ProviderConfig {
        id: new_id,
        name,
        base_url,
        model,
        api_key,
        api_format,
        thinking_enabled,
        reasoning_effort,
        created_at: now.clone(),
        updated_at: now,
    };
    guard.providers.push(created.clone());
    state.save_locked(&guard);
    Ok(created)
}

#[tauri::command]
fn delete_provider(app_handle: tauri::AppHandle, state: tauri::State<AppDb>, id: String) -> bool {
    let mut guard = state.data.lock().unwrap();
    if let Some(idx) = guard.providers.iter().position(|p| p.id == id) {
        guard.providers.remove(idx);
        if guard.settings.active_provider_id.as_ref() == Some(&id) {
            guard.settings.active_provider_id = None;
        }
        state.save_locked(&guard);
        
        let _ = rebuild_tray_menu(&app_handle, &guard);
        return true;
    }
    false
}

#[tauri::command]
fn set_active_provider(state: tauri::State<AppDb>, id: String) -> bool {
    let mut guard = state.data.lock().unwrap();
    if guard.providers.iter().any(|p| p.id == id) {
        guard.settings.active_provider_id = Some(id);
        state.save_locked(&guard);
        return true;
    }
    false
}

#[tauri::command]
fn get_active_provider(state: tauri::State<AppDb>) -> Option<ProviderConfig> {
    let guard = state.data.lock().unwrap();
    let active_id = guard.settings.active_provider_id.as_ref()?;
    guard.providers.iter().find(|p| &p.id == active_id).cloned().map(|mut p| {
        if !p.api_key.is_empty() {
            p.api_key = "••••••••".to_string();
        }
        p
    })
}

#[tauri::command]
fn apply_provider(app_handle: tauri::AppHandle, state: tauri::State<AppDb>, provider: ProviderConfig) -> Result<serde_json::Value, String> {
    let mut guard = state.data.lock().unwrap();
    
    let plain_provider = if provider.api_key == "••••••••" {
        guard.providers.iter().find(|p| p.id == provider.id).cloned().ok_or("Provider not found")?
    } else {
        provider
    };

    if apply_to_deepcode_internal(&plain_provider, &guard) {
        guard.settings.active_provider_id = Some(plain_provider.id.clone());
        state.save_locked(&guard);
        
        let _ = rebuild_tray_menu(&app_handle, &guard);
        
        let handle_clone = app_handle.clone();
        let provider_clone = plain_provider.clone();
        tauri::async_runtime::spawn(async move {
            test_provider_in_background(handle_clone, provider_clone).await;
        });

        Ok(serde_json::json!({
            "env": {
                "BASE_URL": plain_provider.base_url,
                "MODEL": plain_provider.model,
            }
        }))
    } else {
        Err("Failed to apply config to Deep Code".to_string())
    }
}

#[tauri::command]
fn list_presets(state: tauri::State<AppDb>) -> Vec<LocalizedPreset> {
    let guard = state.data.lock().unwrap();
    let lang = get_lang(&guard);
    let is_zh = lang == "zh" || lang.starts_with("zh");
    
    get_builtin_presets().into_iter().map(|p| {
        LocalizedPreset {
            id: p.id,
            name: p.name,
            base_url: p.base_url,
            model: p.model,
            vendor: p.vendor,
            api_format: p.api_format,
            thinking_enabled: p.thinking_enabled,
            reasoning_effort: p.reasoning_effort,
            description: if is_zh { p.description } else { p.description_en },
            hint: if is_zh { p.hint } else { p.hint_en },
            platform: if is_zh { p.platform } else { p.platform_en },
            context_window: p.context_window,
            card_suffix: if is_zh { p.card_suffix } else { p.card_suffix_en },
            homepage_url: p.homepage_url,
        }
    }).collect()
}

#[tauri::command]
async fn test_provider(app_handle: tauri::AppHandle, state: tauri::State<'_, AppDb>, provider_id: String) -> Result<TestResult, String> {
    let p = {
        let guard = state.data.lock().unwrap();
        guard.providers.iter().find(|x| x.id == provider_id).cloned()
    };
    
    let p = match p {
        Some(x) => x,
        None => return Ok(TestResult { ok: false, latency_ms: 0, error: Some("Provider not found".to_string()), model: None })
    };

    let res = test_provider_connection(&p.base_url, &p.api_key, &p.model, &p.api_format).await;
    
    {
        let mut cache = state.health_cache.lock().unwrap();
        cache.insert(provider_id, (res.ok, res.latency_ms));
    }
    
    let guard = state.data.lock().unwrap();
    let _ = rebuild_tray_menu(&app_handle, &guard);
    
    Ok(res)
}

#[tauri::command]
async fn fetch_models(base_url: String, api_key: String) -> Result<serde_json::Value, String> {
    let base = base_url.trim_end_matches('/').trim_end_matches("/v1");
    let url = format!("{}/v1/models", base);
    
    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build() 
    {
        Ok(c) => c,
        Err(e) => return Ok(serde_json::json!({ "ok": false, "error": e.to_string() }))
    };

    let res = client.get(&url)
        .header("Authorization", format!("Bearer {}", api_key))
        .send()
        .await;

    match res {
        Ok(response) => {
            if response.status().is_success() {
                if let Ok(data) = response.json::<serde_json::Value>().await {
                    let mut models = Vec::new();
                    if let Some(arr) = data.get("data").and_then(|v| v.as_array()) {
                        for m in arr {
                            if let Some(id) = m.get("id").and_then(|v| v.as_str()) {
                                models.push(id.to_string());
                            }
                        }
                    }
                    models.sort();
                    Ok(serde_json::json!({ "ok": true, "models": models }))
                } else {
                    Ok(serde_json::json!({ "ok": false, "error": "Failed to parse models JSON" }))
                }
            } else {
                Ok(serde_json::json!({ "ok": false, "error": format!("HTTP {}", response.status()) }))
            }
        }
        Err(e) => {
            Ok(serde_json::json!({ "ok": false, "error": e.to_string() }))
        }
    }
}

#[tauri::command]
fn detect_config(state: tauri::State<AppDb>) -> Option<ProviderConfig> {
    let guard = state.data.lock().unwrap();
    let config_path = PathBuf::from(&guard.settings.deep_code_config_path);
    if !config_path.exists() {
        return None;
    }
    
    if let Ok(raw) = fs::read_to_string(&config_path) {
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(&raw) {
            let env = parsed.get("env")?;
            let base_url = env.get("BASE_URL")?.as_str()?.to_string();
            let api_key = env.get("API_KEY")?.as_str()?.to_string();
            let model = env.get("MODEL")?.as_str()?.to_string();
            
            let thinking_enabled = parsed.get("thinkingEnabled").and_then(|v| v.as_bool()).unwrap_or(false);
            let reasoning_effort = parsed.get("reasoningEffort").and_then(|v| v.as_str()).unwrap_or("high").to_string();
            
            let now = chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true);
            return Some(ProviderConfig {
                id: "".to_string(),
                name: format!("Deep Code ({})", model),
                base_url,
                api_key,
                model,
                api_format: "openai".to_string(),
                thinking_enabled,
                reasoning_effort,
                created_at: now.clone(),
                updated_at: now,
            });
        }
    }
    None
}

#[tauri::command]
fn get_settings(state: tauri::State<AppDb>) -> AppSettings {
    let guard = state.data.lock().unwrap();
    guard.settings.clone()
}

#[tauri::command]
fn save_settings(state: tauri::State<AppDb>, settings: serde_json::Value) -> AppSettings {
    let mut guard = state.data.lock().unwrap();
    if let Some(active_provider_id) = settings.get("activeProviderId") {
        guard.settings.active_provider_id = active_provider_id.as_str().map(|s| s.to_string());
    }
    if let Some(deep_code_config_path) = settings.get("deepCodeConfigPath") {
        if let Some(path) = deep_code_config_path.as_str() {
            guard.settings.deep_code_config_path = path.to_string();
        }
    }
    if let Some(preferred_language) = settings.get("preferredLanguage") {
        if let Some(lang) = preferred_language.as_str() {
            guard.settings.preferred_language = lang.to_string();
        }
    }
    state.save_locked(&guard);
    guard.settings.clone()
}

#[tauri::command]
fn get_deepcode_path(state: tauri::State<AppDb>) -> DeepCodePathInfo {
    let guard = state.data.lock().unwrap();
    let path = guard.settings.deep_code_config_path.clone();
    let exists = Path::new(&path).exists();
    DeepCodePathInfo { path, exists }
}

#[tauri::command]
fn ensure_deepcode_config(state: tauri::State<AppDb>) -> DeepCodePathInfo {
    let guard = state.data.lock().unwrap();
    let path_str = guard.settings.deep_code_config_path.clone();
    let path = Path::new(&path_str);
    if !path.exists() {
        if let Some(parent) = path.parent() {
            let _ = fs::create_dir_all(parent);
        }
        let _ = fs::write(path, "{\n  \"env\": {}\n}");
    }
    let exists = path.exists();
    DeepCodePathInfo { path: path_str, exists }
}

#[derive(Serialize)]
pub struct DeepCodePathInfo {
    pub path: String,
    pub exists: bool,
}

// ─── Entry Point ─────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::default().build())
        .manage(AppDb::new())
        .setup(|app| {
            let tray_icon = load_tray_icon(app.handle());
            let tray_builder = if let Some(icon) = tray_icon {
                // Mark as macOS template image so the system inverts the
                // silhouette automatically to match the menu-bar appearance
                // (white on dark menu bar, dark on light menu bar). Without
                // this flag macOS renders the raw bitmap and a black glyph
                // vanishes against the dark menu bar.
                TrayIconBuilder::with_id("main").icon(icon).icon_as_template(true)
            } else {
                TrayIconBuilder::with_id("main")
            };
            let _tray = tray_builder.tooltip("Deep Switch").build(app)?;

            // Hide to tray on window close instead of quitting.
            // The user can right-click the tray icon to quit explicitly.
            if let Some(win) = app.get_webview_window("main") {
                let win_clone = win.clone();
                win.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { .. } = event {
                        let _ = win_clone.hide();
                    }
                });
            }

            let app_db = app.state::<AppDb>();
            let guard = app_db.data.lock().unwrap();
            let _ = rebuild_tray_menu(app.handle(), &guard);

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_providers,
            get_provider,
            save_provider,
            delete_provider,
            set_active_provider,
            get_active_provider,
            apply_provider,
            list_presets,
            test_provider,
            fetch_models,
            detect_config,
            get_settings,
            save_settings,
            get_deepcode_path,
            ensure_deepcode_config
        ])
        .on_menu_event(|app, event| {
            let id = event.id().as_ref();
            if id == "open_main" {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.unminimize();
                    let _ = win.set_focus();
                }
            } else if id == "open_site" {
                open_url("https://deepseek.com");
            } else if id == "quit" {
                app.exit(0);
            } else if id.starts_with("apply_") {
                let provider_id = &id[6..];
                let state = app.state::<AppDb>();
                let mut guard = state.data.lock().unwrap();
                if let Some(idx) = guard.providers.iter().position(|p| p.id == provider_id) {
                    let provider = guard.providers[idx].clone();
                    if apply_to_deepcode_internal(&provider, &guard) {
                        guard.settings.active_provider_id = Some(provider_id.to_string());
                        state.save_locked(&guard);
                        
                        let handle_clone = app.clone();
                        let provider_clone = provider.clone();
                        tauri::async_runtime::spawn(async move {
                            test_provider_in_background(handle_clone, provider_clone).await;
                        });
                    }
                }
                let _ = rebuild_tray_menu(app, &guard);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
