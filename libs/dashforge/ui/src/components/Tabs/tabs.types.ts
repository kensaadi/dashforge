import type { ReactNode } from 'react';

/**
 * Single tab item — paired `{ value, label, content }`. The `value` is the
 * canonical id (selected via `value` / `defaultValue` on the root); `label`
 * is the trigger text; `content` is the panel body for this tab.
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
 * Props for the {@link Tabs} component.
 *
 * `Tabs` is a custom, clean-room tab navigation built on the headless
 * `useTabs` engine (no `@mui/material` `Tabs`). Standalone — no form bridge,
 * no RBAC. The prop surface mirrors the Tailwind `@dashforge/tw` `Tabs`.
 *
 * Two variant axes:
 * - `variant` — `underline` (default) | `pill`
 * - `orientation` — `horizontal` (default) | `vertical`
 */
export interface TabsProps {
  /** Tab items array. */
  items: TabItem[];
  /** Controlled active value. */
  value?: string;
  /** Default active value (uncontrolled). Defaults to the first item's value. */
  defaultValue?: string;
  /** Fires when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Visual variant. Default `underline`. */
  variant?: 'underline' | 'pill';
  /** Tab-strip orientation. Default `horizontal`. */
  orientation?: 'horizontal' | 'vertical';
  /**
   * Keep inactive panels mounted (hidden via the `hidden` attribute).
   * Default `false` — only the active panel is in the DOM.
   */
  keepMounted?: boolean;
  /** Test id applied to the root element. */
  testId?: string;
}
