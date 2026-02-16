import type { DashforgeTheme } from '@dashforge/tokens';
import { themeStore } from './theme.store';

/**
 * DeepPartial utility
 */
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Replace entire theme
 */
export function replaceTheme(next: DashforgeTheme) {
  Object.assign(themeStore, next);
}

/**
 * Patch theme partially (deep merge)
 */
export function patchTheme(partial: DeepPartial<DashforgeTheme>) {
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
