import { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } from 'electron';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import { ProviderManager, ProviderConfig } from './provider-manager';
import { BUILTIN_PRESETS, localizePreset } from './presets';
import { testProviderConnection } from './health-check';
import { guessVendorFromUrl } from './vendors';
import { fetchQuota, QuotaInfo } from './quota';

// Load translation tables from disk so we don't depend on the JSON imports
// being resolved at runtime by Electron's asar. Locales ship via
// extraResources → Contents/Resources/locales/<lang>.json
function loadLocale(lang: 'zh' | 'en'): Record<string, any> {
  const candidates: string[] = [];
  if (app.isPackaged) {
    candidates.push(path.join(process.resourcesPath, 'locales', `${lang}.json`));
  }
  candidates.push(
    path.join(__dirname, 'locales', `${lang}.json`),
    path.join(__dirname, '..', 'renderer', 'locales', `${lang}.json`),
    path.join(__dirname, '..', '..', 'src', 'renderer', 'locales', `${lang}.json`),
  );
  for (const file of candidates) {
    if (fs.existsSync(file)) {
      try { return JSON.parse(fs.readFileSync(file, 'utf-8')); }
      catch { /* fall through */ }
    }
  }
  return {};
}

const PACKAGED_LOCALES: Record<string, Record<string, any>> = {
  zh: loadLocale('zh'),
  en: loadLocale('en'),
};

const DEEPCODE_CONFIG = `${os.homedir()}/.deepcode/settings.json`;

// TODO: 替换为 Deep Switch 官网 URL (用户后续提供)
const OFFICIAL_SITE_URL = 'https://deepseek.com';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let providerManager: ProviderManager;
let isQuitting = false;

interface HealthSnapshot {
  ok: boolean;
  latencyMs: number;
  testedAt: number;
  quota?: QuotaInfo;
}
const healthCache = new Map<string, HealthSnapshot>();

// ─── Asset path ─────────────────────────────────────────────────

function iconPath(name: string): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'public', 'icons', name);
  }
  return path.join(__dirname, '..', '..', 'public', 'icons', name);
}

const LOCALES = PACKAGED_LOCALES;

function getSystemLang(): 'zh' | 'en' {
  const locale = app.getLocale().toLowerCase();
  return locale.startsWith('zh') ? 'zh' : 'en';
}

function getLang(): 'zh' | 'en' {
  const preferred = providerManager?.getSettings().preferredLanguage;
  if (preferred === 'zh' || preferred === 'en') return preferred;
  return getSystemLang();
}

function tr(key: string): string {
  const locale = LOCALES[getLang()] as Record<string, any>;
  const parts = key.split('.');
  let value: any = locale;
  for (const part of parts) {
    value = value?.[part];
  }
  return typeof value === 'string' ? value : key;
}

// ─── Window ─────────────────────────────────────────────────────

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 880,
    height: 620,
    minWidth: 680,
    minHeight: 480,
    title: 'Deep Switch',
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false,
  });

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('ready-to-show', () => mainWindow?.show());

  // Hide-to-tray: closing the window doesn't quit the app on macOS.
  // Only a real quit (via tray "退出" or Cmd+Q) sets isQuitting.
  mainWindow.on('close', (e) => {
    if (process.platform === 'darwin' && !isQuitting) {
      e.preventDefault();
      mainWindow?.hide();
    }
  });
  mainWindow.on('closed', () => { mainWindow = null; });
}

function showMainWindow(): void {
  if (!mainWindow) createWindow();
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
}

// ─── Health snapshot ────────────────────────────────────────────

async function fetchProviderHealth(p: ProviderConfig): Promise<HealthSnapshot> {
  const test = await testProviderConnection(p.baseUrl, p.apiKey, p.model, p.apiFormat);
  const quota = test.ok ? await fetchQuota(p.baseUrl, p.apiKey) : undefined;
  return {
    ok: test.ok,
    latencyMs: test.latencyMs,
    testedAt: Date.now(),
    quota: quota ?? undefined,
  };
}

function testProviderInBackground(providerId: string): void {
  const full = providerManager.getProvider(providerId);
  if (!full) return;
  void fetchProviderHealth(full).then((snap) => {
    healthCache.set(providerId, snap);
    rebuildTrayMenu();
  });
}

// ─── Tray menu ──────────────────────────────────────────────────

function formatActiveLabel(p: ProviderConfig): string {
  const vendor = guessVendorFromUrl(p.baseUrl);
  const snap = healthCache.get(p.id);
  const dot = snap ? (snap.ok ? '🟢' : '🔴') : '🟡';
  const right = snap?.quota?.text
    ?? (snap ? `${snap.latencyMs}ms` : tr('provider.status.untested'));
  return `${p.name} · ${vendor} · ${dot} ${right}`;
}

function rebuildTrayMenu(): void {
  if (!tray) return;
  const providers = providerManager.listProviders();
  const active = providerManager.getActiveProvider();

  const items: Electron.MenuItemConstructorOptions[] = [
    {
      label: tr('tray.openMainWindow'),
      click: () => showMainWindow(),
    },
    {
      label: tr('tray.openOfficialSite'),
      click: () => shell.openExternal(OFFICIAL_SITE_URL).catch((err) => {
        console.error('[Deep Switch] failed to open official site:', err);
      }),
    },
    { type: 'separator' },
    {
      label: active ? formatActiveLabel(active) : tr('tray.noActiveProvider'),
      enabled: false,
    },
    {
      label: tr('tray.switchProvider'),
      submenu: providers.length === 0
        ? [{ label: tr('tray.noProviders'), enabled: false }]
        : providers.map((p) => ({
            label: `${p.name}${p.id === active?.id ? '  ✓' : ''}`,
            click: () => applyFromTray(p.id),
          })),
    },
    { type: 'separator' },
    { label: tr('tray.quit'), click: () => { isQuitting = true; app.quit(); } },
  ];

  tray.setContextMenu(Menu.buildFromTemplate(items));
}

function applyFromTray(providerId: string): void {
  const full = providerManager.getProvider(providerId);
  if (!full) return;
  providerManager.applyToDeepCode(full);
  testProviderInBackground(providerId);
  rebuildTrayMenu();
}

function createTray(): void {
  // macOS forces monochrome rendering for icons ≤ 22pt in the menu bar, so
  // we ship a black-on-transparent "template" image and let macOS recolor it
  // to match the menu bar theme (white on dark, black on light).
  const trayPath = iconPath('deepseek-tray-template.png');
  const img = nativeImage.createFromPath(trayPath);
  // Provide a @2x variant for Retina menu bars.
  const retinaPath = iconPath('deepseek-tray-template-44.png');
  if (fs.existsSync(retinaPath)) {
    img.addRepresentation({
      scaleFactor: 2.0,
      buffer: fs.readFileSync(retinaPath),
    });
  }
  img.setTemplateImage(true);  // tell macOS: this IS a template image
  tray = new Tray(img);
  tray.setToolTip('Deep Switch');
  // Click on the tray icon shows the context menu (matches screenshot pattern).
  tray.on('click', () => tray?.popUpContextMenu());
  rebuildTrayMenu();
}

// ─── IPC ────────────────────────────────────────────────────────

function setupIpcHandlers(): void {
  // Provider CRUD
  ipcMain.handle('providers:list', () => providerManager.listProviders());
  ipcMain.handle('providers:get', (_e, id: string) => providerManager.getProvider(id));
  ipcMain.handle('providers:save', (_e, provider) => providerManager.saveProvider(provider));
  ipcMain.handle('providers:delete', (_e, id: string) => {
    const ok = providerManager.deleteProvider(id);
    if (ok) rebuildTrayMenu();
    return ok;
  });
  ipcMain.handle('providers:setActive', (_e, id: string) => providerManager.setActiveProvider(id));
  ipcMain.handle('providers:getActive', () => providerManager.getActiveProvider());
  ipcMain.handle('providers:apply', (_e, provider) => {
    const result = providerManager.applyToDeepCode(provider);
    void testProviderInBackground(provider.id);
    rebuildTrayMenu();
    return result;
  });

  // Presets
  ipcMain.handle('presets:list', () => {
    const lang = getLang();
    return BUILTIN_PRESETS.map((p) => localizePreset(p, lang));
  });

  // Health check + model fetch
  ipcMain.handle('providers:test', async (_e, { providerId }: { providerId: string }) => {
    const p = providerManager.getProvider(providerId);
    if (!p) return { ok: false, latencyMs: 0, error: 'Provider not found' };
    const result = await testProviderConnection(p.baseUrl, p.apiKey, p.model, p.apiFormat);
    // Refresh tray indicator too
    healthCache.set(providerId, {
      ok: result.ok,
      latencyMs: result.latencyMs,
      testedAt: Date.now(),
    });
    rebuildTrayMenu();
    return result;
  });

  ipcMain.handle('models:fetch', async (_e, { baseUrl, apiKey }: { baseUrl: string; apiKey: string }) => {
    try {
      const { fetchModelList } = await import('./health-check');
      const models = await fetchModelList(baseUrl, apiKey);
      return { ok: true, models };
    } catch (err: any) {
      console.error('[Deep Switch] models:fetch failed:', err.message);
      return { ok: false, error: err.message };
    }
  });

  // Read current Deep Code settings (for "Detect" button)
  ipcMain.handle('detect:run', () => providerManager.readCurrentDeepCodeConfig());

  // Settings
  ipcMain.handle('settings:get', () => providerManager.getSettings());
  ipcMain.handle('settings:save', (_e, settings) => providerManager.saveSettings(settings));

  // Deep Code config path detection / creation
  ipcMain.handle('deepcode:path', () => ({
    path: providerManager.getDeepCodeConfigPath(),
    exists: providerManager.hasDeepCodeConfig(),
  }));
  ipcMain.handle('deepcode:ensureConfig', () => {
    providerManager.ensureDeepCodeConfigExists();
    return {
      path: providerManager.getDeepCodeConfigPath(),
      exists: providerManager.hasDeepCodeConfig(),
    };
  });
}

// ─── Bootstrap ──────────────────────────────────────────────────

app.whenReady().then(() => {
  providerManager = new ProviderManager();
  setupIpcHandlers();

  // Dock icon is handled automatically by macOS from the .icns in the app bundle.
  // Do NOT call app.dock.setIcon() — it bypasses the system squircle mask.

  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    else showMainWindow();
  });
});

app.on('window-all-closed', () => {
  // macOS: keep alive in menu bar. Other platforms: quit as before.
  if (process.platform !== 'darwin') app.quit();
});