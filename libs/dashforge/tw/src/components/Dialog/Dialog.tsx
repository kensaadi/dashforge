import * as RadixDialog from '@radix-ui/react-dialog';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { dialogVariants } from './dialog.variants.js';
import type { DialogProps } from './dialog.types.js';

/**
 * Dashforge TW `<Dialog>` — declarative modal dialog.
 *
 * Built on `@radix-ui/react-dialog`:
 *  - APG dialog pattern out of the box (focus trap, restore focus on
 *    close, Esc-to-close, `aria-modal`, `aria-labelledby`).
 *  - Renders into a portal (no z-index hell).
 *  - Scroll lock on `<body>` while open.
 *
 * Use the imperative `useDialog()` (export from this same module) if
 * you want a `confirm()`-style return value pattern (similar to
 * `useConfirm()` from `ConfirmDialog`). Use `<Dialog>` when you want
 * the control flow living in your component tree.
 */
export function Dialog(props: DialogProps) {
  const themeDefaults = useComponentDefaults('Dialog');
  const merged: DialogProps = { ...themeDefaults?.defaults, ...props };
  const {
    open,
    onOpenChange,
    children,
    title,
    description,
    showCloseButton = true,
    disableBackdropClose = false,
    disableEscapeClose = false,
    size = 'md',
    sx,
    slotProps,
  } = merged;
  // Theme-level slotProps (Option C Track B). Theme classes go first,
  // instance classes second, so `tailwind-merge` picks the instance
  // where they collide.
  const themeSlotProps = themeDefaults?.slotProps;

  const v = dialogVariants({ size });

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            v.overlay(),
            themeSlotProps?.overlay?.className,
            slotProps?.overlay?.className,
          )}
        />
        <RadixDialog.Content
          className={cn(
            v.content(),
            themeSlotProps?.content?.className,
            slotProps?.content?.className,
            sx,
          )}
          // When no `description` is supplied we render no
          // `<RadixDialog.Description>`. Radix then logs a dev warning
          // unless the Content explicitly opts out via
          // `aria-describedby={undefined}` — the documented escape
          // hatch for description-less dialogs. Spread it ONLY in that
          // case so a present description still auto-links its id.
          {...(description == null
            ? { 'aria-describedby': undefined }
            : {})}
          onPointerDownOutside={(event) => {
            if (disableBackdropClose) event.preventDefault();
          }}
          onEscapeKeyDown={(event) => {
            if (disableEscapeClose) event.preventDefault();
          }}
        >
          {title != null && (
            <RadixDialog.Title
              className={cn(
                v.title(),
                themeSlotProps?.title?.className,
                slotProps?.title?.className,
              )}
            >
              {title}
            </RadixDialog.Title>
          )}
          {description != null && (
            <RadixDialog.Description
              className={cn(
                v.description(),
                themeSlotProps?.description?.className,
                slotProps?.description?.className,
              )}
            >
              {description}
            </RadixDialog.Description>
          )}
          <div
            className={cn(
              v.body(),
              themeSlotProps?.body?.className,
              slotProps?.body?.className,
            )}
          >
            {children}
          </div>
          {showCloseButton && (
            <RadixDialog.Close
              aria-label="Close"
              className={cn(
                v.closeButton(),
                themeSlotProps?.closeButton?.className,
                slotProps?.closeButton?.className,
              )}
            >
              <svg
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </RadixDialog.Close>
          )}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
