import type { DashforgeTheme } from '@dashforge/tokens';
import { defaultLightTheme } from '@dashforge/tokens';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * Deep merge utility for theme objects
 */
function deepMerge(target: unknown, source: unknown): unknown {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return source ?? target;
  }
  if (!target || typeof target !== 'object' || Array.isArray(target)) {
    return source;
  }

  const result: Record<string, unknown> = {
    ...(target as Record<string, unknown>),
  };
  const sourceObj = source as Record<string, unknown>;

  for (const key in sourceObj) {
    const sourceValue = sourceObj[key];
    const targetValue = result[key];

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue, sourceValue);
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue;
    }
  }

  return result;
}

/**
 * Create a custom Dashforge theme by merging overrides with the default light theme
 *
 * @example
 * ```tsx
 * const myTheme = createDashTheme({
 *   color: {
 *     intent: {
 *       primary: '#7c3aed',
 *       success: '#059669',
 *     },
 *   },
 * });
 * ```
 */
export function createDashTheme(
  overrides: DeepPartial<DashforgeTheme>
): DashforgeTheme {
  return deepMerge(defaultLightTheme, overrides) as DashforgeTheme;
}
