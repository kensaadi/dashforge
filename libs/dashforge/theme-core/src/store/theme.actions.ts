import type { DashforgeTheme } from '@dashforge/tokens';
import { themeStore } from './theme.store';

/**
 * Replace entire theme
 */
export function replaceTheme(next: DashforgeTheme) {
  Object.assign(themeStore, next);
}

/**
 * Patch theme partially (deep merge)
 */
export function patchTheme(partial: Partial<DashforgeTheme>) {
  deepMerge(themeStore, partial);
}

function deepMerge(target: any, source: any) {
  for (const key in source) {
    const value = source[key];

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      if (!target[key]) {
        target[key] = {};
      }
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
}
