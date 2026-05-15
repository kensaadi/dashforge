import { proxy, subscribe } from 'valtio';
import type { TWTheme } from '@dashforge/tw-tokens';
import { defaultTWThemeLight, defaultTWThemeDark } from '@dashforge/tw-tokens';

/**
 * localStorage key for persisting the active TW mode. **Isolated** from
 * the MUI side key (`dashforge:theme:mode`) — the two ecosystems share
 * only the bridge layer (forms + ui-core + rbac).
 *
 * @internal
 */
const STORAGE_KEY = 'dashforge:tw-theme:mode';

/**
 * `'light' | 'dark'`. Mirrored from `TWThemeMeta['mode']` to avoid a
 * type-only import that would inflate the public surface in @internal
 * files.
 *
 * @internal
 */
type ThemeMode = 'light' | 'dark';

/**
 * Minimal localStorage-like API. Defined locally so this module compiles
 * in both DOM and non-DOM TS lib configs (Node/SSR).
 *
 * @internal
 */
type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

/**
 * Cross-tab storage event payload (subset we need).
 *
 * @internal
 */
type StorageLikeEvent = { key: string | null };

function getStorage(): KeyValueStorage | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as { localStorage?: KeyValueStorage };
  return g.localStorage ?? null;
}

function readStoredMode(): ThemeMode | null {
  const storage = getStorage();
  if (!storage) return null;
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    // Storage access throws in Safari private mode / sandboxed iframes
    // — degrade silently to "no stored mode".
    return null;
  }
  return raw === 'dark' || raw === 'light' ? raw : null;
}

function writeStoredMode(mode: ThemeMode): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEY, mode);
  } catch {
    // Quota exceeded / private mode — best-effort, no rethrow.
  }
}

function detectSystemMode(): ThemeMode | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as {
    matchMedia?: (q: string) => { matches: boolean };
  };
  if (typeof g.matchMedia !== 'function') return null;
  try {
    return g.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return null;
  }
}

/**
 * Resolve the initial mode at module-import time. Priority cascade:
 *
 *   1. `localStorage` value (user persisted choice)
 *   2. `matchMedia('(prefers-color-scheme: dark)')` (system preference)
 *   3. `'light'` fallback
 *
 * SSR helpers (`serverSideStyleTag`) can pre-inject CSS vars + the
 * `data-dash-tw-theme` attribute so the initial paint matches whatever
 * mode this resolution produces on the client — preventing FOUC.
 *
 * @internal
 */
function resolveInitialMode(): ThemeMode {
  return readStoredMode() ?? detectSystemMode() ?? 'light';
}

const initialMode = resolveInitialMode();
const initialTheme = initialMode === 'dark' ? defaultTWThemeDark : defaultTWThemeLight;

/**
 * Internal Valtio proxy holding the active TW theme. Not exported —
 * consumers interact via `useDashTWTheme()` (snapshot) or the action
 * functions in `tw-theme.actions.ts`.
 *
 * @internal
 */
export const twThemeStore = proxy<TWTheme>({ ...initialTheme });

/**
 * Replace the entire active theme. Use the higher-level `setMode` if
 * you only want to switch between the two default themes.
 */
export function setTheme(theme: TWTheme): void {
  Object.assign(twThemeStore, theme);
}

/**
 * Switch between the two shipped default themes by mode. Equivalent to
 * `setTheme(mode === 'dark' ? defaultTWThemeDark : defaultTWThemeLight)`.
 */
export function setMode(mode: ThemeMode): void {
  setTheme(mode === 'dark' ? defaultTWThemeDark : defaultTWThemeLight);
}

/**
 * Toggle between light and dark, picking the opposite of the currently
 * active `meta.mode`. Equivalent to a one-liner conditional `setMode`.
 */
export function toggleMode(): void {
  setMode(twThemeStore.meta.mode === 'dark' ? 'light' : 'dark');
}

/*
 * Persist the active mode whenever the store mutates. Reads the current
 * `meta.mode` after the mutation has applied (Valtio's `subscribe`
 * delivers a debounced callback once per microtask).
 */
subscribe(twThemeStore, () => {
  writeStoredMode(twThemeStore.meta.mode);
});

/*
 * Cross-tab sync. When another tab writes the storage key, mirror the
 * change here so all tabs render the same mode.
 *
 * Guarded against:
 *   - non-DOM environments (no `addEventListener` on `globalThis`)
 *   - the case where the storage event reports a mode equal to the
 *     current one (no-op to avoid infinite write loops)
 */
if (typeof globalThis !== 'undefined') {
  const g = globalThis as unknown as {
    addEventListener?: (
      type: string,
      listener: (e: StorageLikeEvent) => void
    ) => void;
  };

  g.addEventListener?.('storage', (e) => {
    if (e.key !== STORAGE_KEY) return;
    const next = readStoredMode();
    if (!next) return;
    if (twThemeStore.meta.mode !== next) {
      setMode(next);
    }
  });
}
