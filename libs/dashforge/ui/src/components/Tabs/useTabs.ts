import { useCallback, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { TabItem } from './tabs.types';

/**
 * `useTabs` — the headless tab engine for the MUI `<Tabs>`.
 *
 * Pure logic, zero UI: active-value state (controlled / uncontrolled) plus
 * the WAI-ARIA APG keyboard model (arrow keys, Home/End, roving tabindex,
 * automatic activation, disabled-skip, edge wrap). Returns attribute bundles
 * for the `tablist` / `tab` / `tabpanel` roles.
 *
 * Deliberately NOT a shared package: the tab logic is ~90 lines — too thin
 * to justify a published `tabs-core`. The Tailwind skin keeps its own
 * near-identical copy. Only the public API contract is shared.
 */
interface UseTabsOptions {
  items: TabItem[];
  value: string | undefined;
  defaultValue: string | undefined;
  onValueChange: ((value: string) => void) | undefined;
  orientation: 'horizontal' | 'vertical';
}

interface TabListAttributes {
  role: 'tablist';
  'aria-orientation': 'horizontal' | 'vertical';
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
}

interface TabAttributes {
  role: 'tab';
  id: string;
  'aria-selected': boolean;
  'aria-controls': string;
  tabIndex: number;
  disabled: boolean | undefined;
  'data-state': 'active' | 'inactive';
  onClick: () => void;
  ref: (el: HTMLButtonElement | null) => void;
}

interface PanelAttributes {
  role: 'tabpanel';
  id: string;
  'aria-labelledby': string;
  tabIndex: number;
  hidden: boolean;
  'data-state': 'active' | 'inactive';
}

export interface UseTabsResult {
  /** The currently active tab value. */
  activeValue: string;
  getTabListProps: () => TabListAttributes;
  getTabProps: (item: TabItem) => TabAttributes;
  getPanelProps: (item: TabItem) => PanelAttributes;
}

export function useTabs(options: UseTabsOptions): UseTabsResult {
  const { items, value, defaultValue, onValueChange, orientation } = options;

  const baseId = useId();
  const firstValue = items[0]?.value ?? '';
  const [internalValue, setInternalValue] = useState<string>(
    defaultValue ?? firstValue,
  );
  const isControlled = value !== undefined;
  const activeValue = isControlled ? value : internalValue;

  // Tab buttons, keyed by value — used to move DOM focus on keyboard nav.
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const select = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
      const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
      const enabled = items.filter((item) => item.disabled !== true);
      if (enabled.length === 0) {
        return;
      }
      const currentIndex = enabled.findIndex(
        (item) => item.value === activeValue,
      );
      let targetIndex: number | null = null;
      if (event.key === nextKey) {
        targetIndex =
          currentIndex < 0 ? 0 : (currentIndex + 1) % enabled.length;
      } else if (event.key === prevKey) {
        targetIndex =
          currentIndex < 0
            ? enabled.length - 1
            : (currentIndex - 1 + enabled.length) % enabled.length;
      } else if (event.key === 'Home') {
        targetIndex = 0;
      } else if (event.key === 'End') {
        targetIndex = enabled.length - 1;
      }
      if (targetIndex === null) {
        return;
      }
      event.preventDefault();
      const target = enabled[targetIndex];
      if (target === undefined) {
        return;
      }
      select(target.value);
      tabRefs.current.get(target.value)?.focus();
    },
    [items, orientation, activeValue, select],
  );

  const getTabListProps = (): TabListAttributes => ({
    role: 'tablist',
    'aria-orientation': orientation,
    onKeyDown: handleKeyDown,
  });

  const getTabProps = (item: TabItem): TabAttributes => {
    const active = item.value === activeValue;
    return {
      role: 'tab',
      id: `${baseId}-tab-${item.value}`,
      'aria-selected': active,
      'aria-controls': `${baseId}-panel-${item.value}`,
      tabIndex: active ? 0 : -1,
      disabled: item.disabled,
      'data-state': active ? 'active' : 'inactive',
      onClick: () => {
        if (item.disabled !== true) {
          select(item.value);
        }
      },
      ref: (el: HTMLButtonElement | null) => {
        if (el) {
          tabRefs.current.set(item.value, el);
        } else {
          tabRefs.current.delete(item.value);
        }
      },
    };
  };

  const getPanelProps = (item: TabItem): PanelAttributes => {
    const active = item.value === activeValue;
    return {
      role: 'tabpanel',
      id: `${baseId}-panel-${item.value}`,
      'aria-labelledby': `${baseId}-tab-${item.value}`,
      tabIndex: 0,
      hidden: !active,
      'data-state': active ? 'active' : 'inactive',
    };
  };

  return { activeValue, getTabListProps, getTabProps, getPanelProps };
}
