import type { ReactNode } from 'react';

/**
 * Subset of `<Popover>` props theme-configurable via
 * `theme.components.Popover.defaults` (Option C).
 */
export interface PopoverVariantProps {
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
  showArrow?: boolean;
  sideOffset?: number;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Popover?: {
      defaults?: Partial<PopoverVariantProps>;
    };
  }
}

export interface PopoverSlotProps {
  content?: { className?: string };
  arrow?: { className?: string };
}

/**
 * Props for `<Popover>`.
 *
 * Built on `@radix-ui/react-popover`. Use for richer floating UI
 * than a tooltip — e.g. action menus, color pickers, settings
 * panels.
 *
 * Differences vs `<Tooltip>`:
 *  - Popover is **clickable** and captures focus inside (focus trap).
 *  - Popover supports arbitrary interactive content (forms, buttons).
 *  - Popover dismisses on outside-click / Escape (Radix-managed).
 *  - No `role="tooltip"` — popovers are conceptually mini-dialogs.
 */
export interface PopoverProps {
  /** The trigger element (wrapped in Radix's `asChild` slot). */
  children: ReactNode;
  /** Popover body content. */
  content: ReactNode;
  /** Side of the trigger to render on. @default 'bottom' */
  side?: 'top' | 'right' | 'bottom' | 'left';
  /** Alignment along the perpendicular axis. @default 'center' */
  align?: 'start' | 'center' | 'end';
  /** Show an arrow indicator. @default false */
  showArrow?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Side offset in pixels. @default 8 */
  sideOffset?: number;
  /** Width of the popover content. CSS value. */
  width?: string;
  /** Per-slot overrides. */
  slotProps?: PopoverSlotProps;
}
