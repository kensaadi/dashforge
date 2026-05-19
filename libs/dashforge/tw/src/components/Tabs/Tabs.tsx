import * as RadixTabs from '@radix-ui/react-tabs';
import { cn } from '../../utils/cn.js';
import { tabsVariants } from './tabs.variants.js';
import type { TabsProps } from './tabs.types.js';

/**
 * Dashforge TW `<Tabs>` — declarative tab navigation.
 *
 * Built on `@radix-ui/react-tabs`:
 *  - APG tabs pattern (arrow-key navigation, automatic activation,
 *    `role="tablist"` + `role="tab"` + `role="tabpanel"`).
 *  - Controlled / uncontrolled (`value` / `defaultValue`).
 *
 * Two variant axes:
 *  - `variant` — `underline` (default) | `pill`
 *  - `orientation` — `horizontal` (default) | `vertical`
 */
export function Tabs(props: TabsProps) {
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    orientation = 'horizontal',
    sx,
    slotProps,
  } = props;

  const v = tabsVariants({ variant, orientation });
  const resolvedDefault = defaultValue ?? items[0]?.value;

  return (
    <RadixTabs.Root
      value={value}
      defaultValue={resolvedDefault}
      onValueChange={onValueChange}
      orientation={orientation}
      className={cn(v.root(), sx, slotProps?.root?.className)}
    >
      <RadixTabs.List
        className={cn(v.list(), slotProps?.list?.className)}
      >
        {items.map((item) => (
          <RadixTabs.Trigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className={cn(v.trigger(), slotProps?.trigger?.className)}
          >
            {item.label}
          </RadixTabs.Trigger>
        ))}
      </RadixTabs.List>
      {items.map((item) => (
        <RadixTabs.Content
          key={item.value}
          value={item.value}
          className={cn(v.content(), slotProps?.content?.className)}
        >
          {item.content}
        </RadixTabs.Content>
      ))}
    </RadixTabs.Root>
  );
}
