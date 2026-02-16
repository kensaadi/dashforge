/**
 * Shallow-merge MUI `theme.components` fragments without clobbering:
 * - merges `defaultProps`
 * - merges `styleOverrides`
 * - last-write-wins for other keys (e.g. `variants`)
 *
 * Intentionally kept generic to avoid MUI Theme generic/type pitfalls.
 */
export function mergeComponents<T extends Record<string, any>>(
  ...parts: Array<T | undefined>
): T {
  const out: any = {};

  for (const part of parts) {
    if (!part) continue;

    for (const key of Object.keys(part)) {
      const prev = out[key] ?? {};
      const next = part[key] ?? {};

      out[key] = {
        ...prev,
        ...next,
        defaultProps: {
          ...(prev.defaultProps ?? {}),
          ...(next.defaultProps ?? {}),
        },
        styleOverrides: {
          ...(prev.styleOverrides ?? {}),
          ...(next.styleOverrides ?? {}),
        },
      };
    }
  }

  return out as T;
}
