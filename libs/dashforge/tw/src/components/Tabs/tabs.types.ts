import type { ReactNode } from 'react';
import type { TabsVariants } from './tabs.variants.js';

/**
 * Subset of `<Tabs>` props theme-configurable via
 * `theme.components.Tabs.defaults` (Option C).
 */
export type TabsVariantProps = Pick<TabsVariants, 'variant' | 'orientation'>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Tabs?: {
      defaults?: Partial<TabsVariantProps>;
    };
  }
}

export interface TabsSlotProps {
  root?: { className?: string };
  list?: { className?: string };
  trigger?: { className?: string };
  content?: { className?: string };
}

/**
 * Single tab item — paired `{ value, label, content }`. The `value`
 * is the canonical id (selected via the `value` / `defaultValue`
 * props on the root); the `label` is the trigger button text, and
 * `content` is what renders in the panel when this tab is active.
 */
export interface TabItem {
  value: string;
  label: ReactNode;
  /** Tab panel content. */
  content: ReactNode;
  /** Per-tab disabled flag. */
  disabled?: boolean;
}

/**
 * Props for `<Tabs>`.
 *
 * Custom clean-room implementation — the headless `useTabs` engine, no Radix.
 * Two variant axes:
 *  - `variant` — `underline` (default) | `pill`
 *  - `orientation` — `horizontal` (default) | `vertical`
 *
 * Supports controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`) modes — the `value` prop wins when both are set.
 */
export interface TabsProps extends TabsVariants {
  /** Tab items array. */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Default active value (uncontrolled). Defaults to first item's value. */
  defaultValue?: string;
  /** Fires when the active tab changes. */
  onValueChange?: (value: string) => void;
  /**
   * Keep inactive panels mounted (hidden via the `hidden` attribute).
   * Default `false` — only the active panel is in the DOM.
   */
  keepMounted?: boolean;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot overrides. */
  slotProps?: TabsSlotProps;
}
