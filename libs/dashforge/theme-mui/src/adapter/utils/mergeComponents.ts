type ComponentFragment = {
  defaultProps?: Record<string, unknown>;
  styleOverrides?: Record<string, unknown>;
  [key: string]: unknown; // allow other keys (e.g. variants)
};

export function mergeComponents<T extends Record<string, ComponentFragment>>(
  ...parts: Array<Partial<T> | undefined>
): T {
  const out: Record<string, ComponentFragment> = {};
  const empty: ComponentFragment = {};

  for (const part of parts) {
    if (!part) continue;

    // Object.keys loses key types; index via a safe record view.
    const record = part as Record<string, ComponentFragment | undefined>;

    for (const key of Object.keys(record)) {
      const prev: ComponentFragment = out[key] ?? empty;
      const next: ComponentFragment = record[key] ?? empty;

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
