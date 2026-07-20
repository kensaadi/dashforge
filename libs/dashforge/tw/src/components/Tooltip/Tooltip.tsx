import * as RadixTooltip from '@radix-ui/react-tooltip';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { tooltipVariants } from './tooltip.variants.js';
import type { TooltipProps } from './tooltip.types.js';

/**
 * Dashforge TW `<Tooltip>` — hoverable / focusable tooltip.
 *
 * Built on `@radix-ui/react-tooltip`:
 *  - APG tooltip pattern: `role="tooltip"`, `aria-describedby` wired
 *    to the trigger automatically (Radix manages the id linkage).
 *  - Shows on hover OR keyboard focus.
 *  - Dismissed on Escape or pointer leave.
 *
 * Wrap any single React node — it becomes the trigger via Radix's
 * `asChild` slot. The trigger inherits `aria-describedby` so screen
 * readers announce the tooltip content along with the trigger.
 *
 * @example
 * ```tsx
 * <Tooltip content="Delete this item">
 *   <Button variant="ghost">
 *     <TrashIcon />
 *   </Button>
 * </Tooltip>
 * ```
 *
 * Each consumer can also wrap the entire app once in
 * `<RadixTooltip.Provider>` to share delay/skip configuration; we
 * include a per-component provider here for ease-of-use.
 */
export function Tooltip(props: TooltipProps) {
  const themeDefaults = useComponentDefaults('Tooltip');
  const merged: TooltipProps = { ...themeDefaults?.defaults, ...props };
  const themeSlotProps = themeDefaults?.slotProps;
  const {
    children,
    content,
    side = 'top',
    align = 'center',
    hideArrow = false,
    delayDuration = 200,
    open,
    onOpenChange,
    sideOffset = 4,
    sx,
    slotProps,
  } = merged;

  const v = tooltipVariants();

  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      <RadixTooltip.Root open={open} onOpenChange={onOpenChange}>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            side={side}
            align={align}
            sideOffset={sideOffset}
            className={cn(v.content(), sx, themeSlotProps?.content?.className, slotProps?.content?.className)}
          >
            {content}
            {!hideArrow && (
              <RadixTooltip.Arrow
                className={cn(v.arrow(), themeSlotProps?.arrow?.className, slotProps?.arrow?.className)}
              />
            )}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
}
