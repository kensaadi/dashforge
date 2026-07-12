/**
 * Merge theme-configured slot props with instance-level slot props.
 *
 * **Precedence** (lowest → highest):
 *   1. Theme-configured (`themeProps` — from `useSlotProps`).
 *   2. Instance-level (`instanceProps` — passed by the caller).
 *
 * **Special-case `className` and `sx`**: rather than instance-wins, these
 * two are **concatenated** (theme first, then instance) so consumer
 * class-utility additions layer on top of theme-configured styling
 * without wiping it. Every other prop is a simple "instance wins".
 *
 * @example
 * ```tsx
 * const themeSlot = useSlotProps('DataGrid', 'header'); // { className: 'bg-neutral-50' }
 * const merged = mergeSlotProps(themeSlot, { className: 'font-bold', 'data-testid': 'grid-header' });
 * // → { className: 'bg-neutral-50 font-bold', 'data-testid': 'grid-header' }
 * ```
 *
 * @returns A new object; never mutates the inputs. Both inputs may be
 *   `undefined` — the return is an empty object in that case.
 */
export function mergeSlotProps<T extends Record<string, unknown>>(
  themeProps: T | undefined,
  instanceProps: T | undefined,
): T {
  if (!themeProps && !instanceProps) return {} as T;
  if (!themeProps) return { ...(instanceProps as T) };
  if (!instanceProps) return { ...themeProps };

  const merged: Record<string, unknown> = { ...themeProps };
  for (const [key, value] of Object.entries(instanceProps)) {
    if ((key === 'className' || key === 'sx') && typeof value === 'string') {
      const prior = merged[key];
      merged[key] = typeof prior === 'string' && prior.length > 0
        ? `${prior} ${value}`
        : value;
    } else if (value !== undefined) {
      merged[key] = value;
    }
  }
  return merged as T;
}
