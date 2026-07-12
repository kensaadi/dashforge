import type { TWComponentDefaults } from '@dashforge/tw-tokens';
import { useDashTWTheme } from './useDashTWTheme.js';

/**
 * Type-level extraction: the `slotProps` shape (if any) that a component
 * augmentation has declared on its `TWComponentDefaults[K]` entry.
 *
 * Deliberately loose (`unknown` when absent) so components that only
 * declare `defaults` don't force `useSlotProps` to error at the type
 * layer — the hook simply returns `undefined` at runtime.
 */
type SlotPropsOf<K extends keyof TWComponentDefaults> =
  NonNullable<TWComponentDefaults[K]> extends { slotProps?: infer SP }
    ? SP
    : undefined;

/**
 * Read the consumer-configured `slotProps` entry for a specific slot of
 * a compound component.
 *
 * Reactive via the underlying `useDashTWTheme` subscription. Returns
 * `undefined` when the consumer has not configured a slotProps entry for
 * this component/slot pair.
 *
 * @template K - Component name. Autocompletes from the augmented registry.
 * @template S - Slot name. Autocompletes from the component's declared
 *   `slotProps` shape.
 *
 * @example
 * ```tsx
 * function DataGridHeader(props: DataGridHeaderProps) {
 *   const themeSlot = useSlotProps('DataGrid', 'header');
 *   const merged = mergeSlotProps(themeSlot, props);
 *   return <div {...merged} className={cn(merged.className, props.sx)} />;
 * }
 * ```
 *
 * @returns The consumer-configured slot entry, or `undefined`.
 */
export function useSlotProps<
  K extends keyof TWComponentDefaults,
  S extends keyof NonNullable<SlotPropsOf<K>>,
>(name: K, slot: S): NonNullable<SlotPropsOf<K>>[S] | undefined {
  const theme = useDashTWTheme();
  const componentDef = theme.components?.[name] as
    | { slotProps?: Record<string, unknown> }
    | undefined;
  const slotProps = componentDef?.slotProps;
  return slotProps?.[slot as string] as
    | NonNullable<SlotPropsOf<K>>[S]
    | undefined;
}
