import { registerSW } from 'virtual:pwa-register';

export const APP_VERSION = String(import.meta.env.VITE_APP_VERSION || '本地开发');
type UpdatePhase = 'idle' | 'checking' | 'downloading' | 'ready' | 'offline' | 'error' | 'unsupported';
export interface UpdateState { phase: UpdatePhase; message: string }
interface UpdateHooks {
  canReload: () => boolean;
  beforeReload: () => void;
  changed: (state: UpdateState) => void;
  notify: (message: string) => void;
}

/** Keep an installed app fresh without interrupting an expedition or deleting its save. */
export function createAppUpdates(hooks: UpdateHooks) {
  let state: UpdateState = { phase: 'idle', message: '联网后自动检查，也可以手动检查更新。' };
  let registration: ServiceWorkerRegistration | undefined, swUrl = '';
  let checking: Promise<void> | undefined, lastCheck = 0, reloadRequired = false;
  let finishRegistration!: () => void;
  const registered = new Promise<void>(resolve => { finishRegistration = resolve; });
  const set = (phase: UpdatePhase, message: string) => {
    state = { phase, message };
    hooks.changed(state);
  };
  const ready = () => set('ready', '新版本已下载。回到营地后点击更新，保留解锁与家园存档。');
  const reload = () => { hooks.beforeReload(); window.location.reload(); };

  function watchWorker(worker: ServiceWorker) {
    const changed = () => {
      if (worker.state === 'installed' && registration?.waiting) ready();
      else if (worker.state === 'redundant' && state.phase === 'downloading') {
        set('error', '离线包下载未完成，请保持联网后重试。');
      }
    };
    worker.addEventListener('statechange', changed);
    if (worker.state !== 'installed' && worker.state !== 'activated') {
      set('downloading', '正在下载离线资源，完成后即可更新。');
    }
    changed();
  }

  const updateSW = import.meta.env.PROD && 'serviceWorker' in navigator ? registerSW({
    immediate: true,
    onNeedRefresh: ready,
    onNeedReload() {
      if (hooks.canReload()) reload();
      else { reloadRequired = true; ready(); }
    },
    onOfflineReady() {
      if (state.phase !== 'ready') set('idle', '离线资源已缓存，可以断网游玩。');
      hooks.notify('离线缓存完成，可断网下潜。');
    },
    onRegisteredSW(url, reg) {
      swUrl = url;
      registration = reg;
      finishRegistration();
      if (!reg) { set('error', '离线更新注册失败，请联网后重新打开。'); return; }
      reg.addEventListener('updatefound', () => { if (reg.installing) watchWorker(reg.installing); });
      if (reg.waiting) ready();
      else if (reg.installing) watchWorker(reg.installing);
      void check();
    },
    onRegisterError(error) {
      finishRegistration();
      set('error', '无法注册离线更新，请保持联网后重新打开。');
      console.warn('离线缓存注册失败', error);
    }
  }) : undefined;

  async function check(manual = false): Promise<void> {
    if (!updateSW) {
      set('unsupported', import.meta.env.DEV ? '本地开发直接同步修改，无需下载更新。' : '当前浏览器无法使用离线更新，请在 Chrome / Edge 中打开。');
      if (manual) hooks.notify(state.message);
      return;
    }
    if (state.phase === 'ready') { if (manual) hooks.notify(state.message); return; }
    if (checking || (!manual && Date.now() - lastCheck < 30_000)) return checking;
    if (!navigator.onLine) {
      set('offline', '当前离线，联网后会自动检查更新。');
      if (manual) hooks.notify(state.message);
      return;
    }
    lastCheck = Date.now();
    checking = (async () => {
      let timeout: number | undefined;
      try {
        set('checking', '正在检查已部署的最新版本…');
        await Promise.race([registered, new Promise<never>((_, reject) => {
          timeout = window.setTimeout(() => reject(new Error('registration timeout')), 12_000);
        })]);
        if (!registration) throw new Error('service worker unavailable');
        if (registration.waiting) { ready(); return; }
        if (registration.installing) { watchWorker(registration.installing); return; }
        // Bypass the HTTP cache as well as the app's cached navigation shell.
        const response = await fetch(swUrl, { cache: 'no-store', signal: AbortSignal.timeout(12_000) });
        if (!response.ok) throw new Error(`service worker HTTP ${response.status}`);
        await registration.update();
        if (registration.waiting || reloadRequired) ready();
        else if (registration.installing) watchWorker(registration.installing);
        else {
          // version.json is deliberately network-only; never claim "latest" from an offline shell.
          const url = new URL(`${import.meta.env.BASE_URL}version.json`, document.baseURI);
          const versionResponse = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(8_000) });
          if (registration.waiting) { ready(); return; }
          if (registration.installing) { watchWorker(registration.installing); return; }
          if (versionResponse.ok) {
            const release: unknown = await versionResponse.json();
            if (typeof release === 'object' && release && 'version' in release && release.version !== APP_VERSION) {
              set('error', '发现已部署的新版本，离线包尚未就绪，请稍后再检查。');
              if (manual) hooks.notify(state.message);
              return;
            }
          }
          set('idle', '已检查部署站点，当前离线包没有可用更新。');
          if (manual) hooks.notify('检查完成，当前没有可用更新。');
        }
      } catch (error) {
        if (registration?.waiting) ready();
        else if (registration?.installing) watchWorker(registration.installing);
        else {
          set(navigator.onLine ? 'error' : 'offline', navigator.onLine ? '检查失败，可能网络不稳定。请稍后重试。' : '当前离线，联网后会自动检查更新。');
          if (manual) hooks.notify(state.message);
          console.warn('检查更新失败', error);
        }
      } finally {
        window.clearTimeout(timeout);
        checking = undefined;
      }
    })();
    return checking;
  }

  async function apply() {
    if (!hooks.canReload()) { hooks.notify('请先结算或返回营地，再更新应用。'); return; }
    if (state.phase !== 'ready') { await check(true); return; }
    hooks.beforeReload();
    if (reloadRequired) { reload(); return; }
    if (!registration?.waiting) { set('idle', '更新状态已变化，请重新检查。'); await check(true); return; }
    try { await updateSW?.(true); }
    catch (error) { ready(); hooks.notify('更新未完成，请再试一次。'); console.warn('应用更新失败', error); }
  }

  if (updateSW) {
    document.addEventListener('visibilitychange', () => { if (!document.hidden) void check(); });
    window.addEventListener('pageshow', () => { void check(); });
    window.addEventListener('focus', () => { void check(); });
    window.addEventListener('online', () => { lastCheck = 0; void check(); });
    window.setInterval(() => { if (!document.hidden) void check(); }, 5 * 60_000);
  }
  return { get state() { return state; }, check, apply };
}
