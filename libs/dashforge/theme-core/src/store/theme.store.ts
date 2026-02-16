import { proxy } from 'valtio';
import type { DashforgeTheme } from '@dashforge/tokens';
import { defaultLightTheme, defaultDarkTheme } from '@dashforge/tokens';

/**
 * Internal theme store (NOT exported publicly)
 */
const internalThemeStore = proxy<DashforgeTheme>({
  ...defaultLightTheme,
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

export { internalThemeStore as themeStore };
