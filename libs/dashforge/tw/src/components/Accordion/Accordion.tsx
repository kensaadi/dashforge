import * as RadixAccordion from '@radix-ui/react-accordion';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { accordionVariants } from './accordion.variants.js';
import type {
  AccordionProps,
  AccordionItem,
  AccordionSlotProps,
} from './accordion.types.js';

/**
 * Dashforge TW `<Accordion>` — collapsible section list.
 *
 * Built on `@radix-ui/react-accordion`:
 *  - APG accordion pattern: `role="region"` on content, header
 *    button with `aria-expanded` and `aria-controls` linked to
 *    the panel.
 *  - Keyboard support: Space / Enter toggle, ArrowDown / ArrowUp
 *    move focus between triggers, Home / End to extremes.
 *  - Two modes:
 *    - `type="single"` — at most one section open at a time;
 *      `collapsible` allows clicking the open section to close it
 *      (default true).
 *    - `type="multiple"` — multiple sections open simultaneously.
 *
 * The trigger renders a chevron that flips 180° via CSS
 * (`data-state=open` selector) — no React state, no JS animation.
 */
export function Accordion(props: AccordionProps) {
  const themeDefaults = useComponentDefaults('Accordion');
  const themeSlotProps = themeDefaults?.slotProps;
  const v = accordionVariants();
  const { items, sx, slotProps } = props;

  const renderItems = (items: AccordionItem[], slotProps?: AccordionSlotProps) =>
    items.map((item) => (
      <RadixAccordion.Item
        key={item.value}
        value={item.value}
        disabled={item.disabled}
        className={cn(v.item(), themeSlotProps?.item?.className, slotProps?.item?.className)}
      >
        <RadixAccordion.Header
          className={cn(v.header(), themeSlotProps?.header?.className, slotProps?.header?.className)}
        >
          <RadixAccordion.Trigger
            className={cn(v.trigger(), themeSlotProps?.trigger?.className, slotProps?.trigger?.className)}
          >
            {item.header}
            <svg
              className={cn(v.chevron(), themeSlotProps?.chevron?.className, slotProps?.chevron?.className)}
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
              <path d="M4 6l4 4 4-4" />
            </svg>
          </RadixAccordion.Trigger>
        </RadixAccordion.Header>
        <RadixAccordion.Content
          className={cn(v.content(), themeSlotProps?.content?.className, slotProps?.content?.className)}
        >
          <div className="pb-3 pt-0">{item.content}</div>
        </RadixAccordion.Content>
      </RadixAccordion.Item>
    ));

  if (props.type === 'multiple') {
    return (
      <RadixAccordion.Root
        type="multiple"
        value={props.value}
        defaultValue={props.defaultValue}
        onValueChange={props.onValueChange}
        className={cn(v.root(), themeSlotProps?.root?.className, slotProps?.root?.className, sx)}
      >
        {renderItems(items, slotProps)}
      </RadixAccordion.Root>
    );
  }

  return (
    <RadixAccordion.Root
      type="single"
      collapsible={props.collapsible ?? true}
      value={props.value}
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      className={cn(v.root(), themeSlotProps?.root?.className, slotProps?.root?.className, sx)}
    >
      {renderItems(items, slotProps)}
    </RadixAccordion.Root>
  );
}
