import type { ReactNode } from 'react';

/**
 * Subset of `<Tooltip>` props theme-configurable via
 * `theme.components.Tooltip.defaults` (Option C).
 */
export interface TooltipVariantProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  hideArrow?: boolean;
  delayDuration?: number;
  sideOffset?: number;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Tooltip?: {
      defaults?: Partial<TooltipVariantProps>;
    };
  }
}

export interface TooltipSlotProps {
  content?: { className?: string };
  arrow?: { className?: string };
}

/**
 * Props for `<Tooltip>`.
 *
 * Built on `@radix-ui/react-tooltip`. Wrap any element with a tooltip
 * that follows APG semantics (`role="tooltip"`, `aria-describedby`
 * wired to the trigger).
 *
 * Renders an arrow by default. Three side options
 * (top / right / bottom / left) with 'top' as default. Delay
 * configurable via `delayDuration` (forwarded to Radix Provider).
 */
export interface TooltipProps {
  /** The element that, when hovered/focused, shows the tooltip. */
  children: ReactNode;
  /** Tooltip body content. */
  content: ReactNode;
  /** Side of the trigger to show the tooltip on. @default 'top' */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment along the perpendicular axis. @default 'center' */
  align?: 'start' | 'center' | 'end';
  /** Hide the arrow indicator. @default false (arrow shown) */
  hideArrow?: boolean;
  /** Delay before the tooltip shows on hover (ms). @default 200 */
  delayDuration?: number;
  /**
   * Controlled open state. Use when the tooltip should be programmatic
   * (e.g. revealed on a manual button press). Omit for default
   * hover / focus behavior.
   */
  open?: boolean;
  /** Called when the tooltip's open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Side offset in pixels from the trigger. @default 4 */
  sideOffset?: number;
  /** Per-slot overrides. */
  slotProps?: TooltipSlotProps;
}
