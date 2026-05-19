import type { ReactNode } from 'react';
import type { DialogVariants } from './dialog.variants.js';

/**
 * Per-slot className overrides for `<Dialog>`. Mirrors the
 * canonical TW slotProps shape: `{ slot?: { className?: string } }`.
 */
export interface DialogSlotProps {
  overlay?: { className?: string };
  content?: { className?: string };
  title?: { className?: string };
  description?: { className?: string };
  closeButton?: { className?: string };
  body?: { className?: string };
  actions?: { className?: string };
}

/**
 * Props for the declarative `<Dialog>` component.
 *
 * Built on `@radix-ui/react-dialog`. Use this when:
 *  - You want full control over the dialog's open state (controlled
 *    from a parent component).
 *  - You want to mount a custom-styled dialog body / trigger that
 *    composes with the rest of your component tree.
 *  - You don't need an imperative `confirm()`-style return value
 *    (use `useDialog()` or `useConfirm()` for those).
 *
 * Three size variants (`sm` / `md` / `lg`) with sensible defaults.
 * Backdrop + content animations respect `prefers-reduced-motion`.
 */
export interface DialogProps extends Pick<DialogVariants, 'size'> {
  /** Controlled open state. */
  open: boolean;
  /** Called when the dialog requests to change open state. */
  onOpenChange: (open: boolean) => void;
  /** Dialog body — usually a `<DialogContent>` subtree. */
  children: ReactNode;
  /** Dialog title (screen-reader announced via `aria-labelledby`). */
  title?: ReactNode;
  /** Dialog description (announced via `aria-describedby`). */
  description?: ReactNode;
  /**
   * Show the `×` close button in the top-right corner.
   * @default true
   */
  showCloseButton?: boolean;
  /**
   * Disable closing on backdrop click.
   * @default false
   */
  disableBackdropClose?: boolean;
  /**
   * Disable closing on Escape key.
   * @default false
   */
  disableEscapeClose?: boolean;
  /** Root className shortcut on the content element. */
  sx?: string;
  /** Per-slot overrides. */
  slotProps?: DialogSlotProps;
}
