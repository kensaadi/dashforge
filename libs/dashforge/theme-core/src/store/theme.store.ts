import { proxy, subscribe } from 'valtio';
import type { DashforgeTheme } from '@dashforge/tokens';
import { defaultLightTheme, defaultDarkTheme } from '@dashforge/tokens';

const STORAGE_KEY = 'dashforge:theme:mode';

type ThemeMode = 'light' | 'dark';

/*
 * A minimal type to define methods of localStorage object
 */
type KeyValueStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
};

type StorageLikeEvent = { key: string | null };

function getStorage(): KeyValueStorage | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as unknown as { localStorage?: KeyValueStorage };
  return g.localStorage ?? null;
}

function readStoreMode(): ThemeMode | null {
  const storage = getStorage();
  if (!storage) return null;

  const raw = storage.getItem(STORAGE_KEY);
  return raw === 'dark' || raw === 'light' ? raw : null;
}

function writeStoreMode(mode: ThemeMode): void {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(STORAGE_KEY, mode);
}

const initialMode = readStoreMode() ?? defaultLightTheme.meta.mode;
const initialTheme =
  initialMode === 'dark' ? defaultDarkTheme : defaultLightTheme;

/**
 * Internal theme store (NOT exported publicly)
 */
const internalThemeStore = proxy<DashforgeTheme>({
  ...initialTheme,
});

/**
 * Switch the active theme
 */
export function setTheme(theme: DashforgeTheme): void {
  Object.assign(internalThemeStore, theme);
}

/**
 * Toggle between light and dark modes
 */
export function toggleThemeMode(): void {
  const isDark = internalThemeStore.meta.mode === 'dark';
  setTheme(isDark ? defaultLightTheme : defaultDarkTheme);
}

/**
 * Set theme mode explicitly
 */
export function setThemeMode(mode: 'light' | 'dark'): void {
  setTheme(mode === 'dark' ? defaultDarkTheme : defaultLightTheme);
}

/*
 * Persist mode on change
 */
subscribe(internalThemeStore, () => {
  writeStoreMode(internalThemeStore.meta.mode);
});

/*
 * Optional: cross-tab sync (no DOM types)
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

    const mode = readStoreMode();
    if (!mode) return;

    if (internalThemeStore.meta.mode !== mode) {
      setThemeMode(mode);
    }
  });
}

export { internalThemeStore as themeStore };
