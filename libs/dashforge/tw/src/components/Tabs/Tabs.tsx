import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { tabsVariants } from './tabs.variants.js';
import { useTabs } from './useTabs.js';
import type { TabsProps } from './tabs.types.js';

/**
 * Dashforge TW `<Tabs>` — declarative tab navigation.
 *
 * Custom clean-room implementation on the headless `useTabs` engine — no
 * runtime UI dependency. Implements the WAI-ARIA APG tabs pattern: arrow-key
 * navigation, automatic activation, roving tabindex, `role="tablist"` +
 * `role="tab"` + `role="tabpanel"`.
 *
 * Two variant axes:
 *  - `variant` — `underline` (default) | `pill`
 *  - `orientation` — `horizontal` (default) | `vertical`
 *
 * Controlled (`value` + `onValueChange`) or uncontrolled (`defaultValue`).
 * `keepMounted` keeps inactive panels in the DOM (default: only the active
 * panel is mounted).
 */
export function Tabs(props: TabsProps) {
  const themeDefaults = useComponentDefaults('Tabs');
  const merged: TabsProps = { ...themeDefaults?.defaults, ...props };
  const {
    items,
    value,
    defaultValue,
    onValueChange,
    variant = 'underline',
    orientation = 'horizontal',
    keepMounted = false,
    sx,
    slotProps,
  } = merged;

  const v = tabsVariants({ variant, orientation });
  const tabs = useTabs({
    items,
    value,
    defaultValue,
    onValueChange,
    orientation,
  });

  // Either all panels (hidden when inactive) or just the active one.
  const panels = keepMounted
    ? items
    : items.filter((item) => item.value === tabs.activeValue);

  return (
    <div className={cn(v.root(), sx, slotProps?.root?.className)}>
      <div
        {...tabs.getTabListProps()}
        className={cn(v.list(), slotProps?.list?.className)}
      >
        {items.map((item) => (
          <button
            key={item.value}
            type="button"
            {...tabs.getTabProps(item)}
            className={cn(v.trigger(), slotProps?.trigger?.className)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {panels.map((item) => (
        <div
          key={item.value}
          {...tabs.getPanelProps(item)}
          className={cn(v.content(), slotProps?.content?.className)}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}
