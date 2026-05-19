import * as RadixPopover from '@radix-ui/react-popover';
import { cn } from '../../utils/cn.js';
import { popoverVariants } from './popover.variants.js';
import type { PopoverProps } from './popover.types.js';

/**
 * Dashforge TW `<Popover>` — clickable floating content panel.
 *
 * Built on `@radix-ui/react-popover`:
 *  - Focus trap inside the popover (Tab cycles within).
 *  - Outside-click + Escape dismiss.
 *  - APG dialog-like semantics (`role="dialog"` on content).
 *  - Portal-rendered.
 *
 * Use `<Popover>` for menus / pickers / settings panels with
 * interactive children. Use `<Tooltip>` for read-only hints.
 */
export function Popover(props: PopoverProps) {
  const {
    children,
    content,
    side = 'bottom',
    align = 'center',
    showArrow = false,
    open,
    onOpenChange,
    sideOffset = 8,
    width,
    slotProps,
  } = props;

  const v = popoverVariants();

  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>{children}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          side={side}
          align={align}
          sideOffset={sideOffset}
          style={width != null ? { width } : undefined}
          className={cn(v.content(), slotProps?.content?.className)}
        >
          {content}
          {showArrow && (
            <RadixPopover.Arrow
              className={cn(v.arrow(), slotProps?.arrow?.className)}
            />
          )}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
}
