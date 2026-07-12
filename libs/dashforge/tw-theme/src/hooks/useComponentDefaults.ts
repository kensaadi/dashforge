import type { TWComponentDefaults } from '@dashforge/tw-tokens';
import { useDashTWTheme } from './useDashTWTheme.js';

/**
 * Read the consumer-configured defaults for a specific component.
 *
 * Reactive: subscribes to the theme store so runtime `patchTheme()` /
 * `setTheme()` calls that touch `components.<Name>` re-fire this hook and
 * trigger a re-render of the caller.
 *
 * Returns `undefined` when the consumer hasn't configured anything for
 * this component (or when the theme has no `components` field at all —
 * the default). Callers should treat `undefined` as "no theme overrides,
 * use the component's own `defaultVariants`".
 *
 * @template K - The component name. Autocompletes to whatever components
 *   have augmented `TWComponentDefaults` via TS declaration merging.
 *
 * @example
 * ```tsx
 * function Button(props: ButtonProps) {
 *   const themeDefaults = useComponentDefaults('Button');
 *   const merged = { ...themeDefaults?.defaults, ...props };
 *   const classes = buttonVariants(merged);
 *   // ...
 * }
 * ```
 *
 * @returns The consumer-configured entry for this component, or `undefined`.
 */
export function useComponentDefaults<K extends keyof TWComponentDefaults>(
  name: K
): TWComponentDefaults[K] | undefined {
  const theme = useDashTWTheme();
  return theme.components?.[name] as TWComponentDefaults[K] | undefined;
}
