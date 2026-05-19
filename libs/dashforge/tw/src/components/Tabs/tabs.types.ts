import type { ReactNode } from 'react';
import type { TabsVariants } from './tabs.variants.js';

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
 * Built on `@radix-ui/react-tabs`. Two variant axes:
 *  - `variant` — `underline` (default) | `pill`
 *  - `orientation` — `horizontal` (default) | `vertical`
 *
 * Supports controlled (`value` + `onValueChange`) and uncontrolled
 * (`defaultValue`) modes — the `value` prop wins when both are set.
 */
export interface TabsProps extends TabsVariants {
  /** Tab items array (declarative — alternative to passing children). */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Default active value (uncontrolled). Defaults to first item's value. */
  defaultValue?: string;
  /** Fires when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Root className shortcut. */
  sx?: string;
  /** Per-slot overrides. */
  slotProps?: TabsSlotProps;
}
