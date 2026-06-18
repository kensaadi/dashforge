import { tv, type VariantProps } from 'tailwind-variants';
import type { MenuPlacement } from './menu.types.js';

/**
 * Tailwind-variants recipe for the Menu family.
 *
 * The whole menu family is styled here in one TV instance so the
 * compound rules (item color × selected × danger, etc.) live in
 * one source of truth.
 *
 * Slots:
 *   - `content`   — floating panel (DropdownMenu.Content)
 *   - `item`      — clickable row (DropdownMenu.Item)
 *   - `itemIcon`  — leading icon container
 *   - `itemLabel` — text content slot
 *   - `itemEnd`   — trailing slot (shortcut hint, chevron, …)
 *   - `label`     — non-interactive heading (DropdownMenu.Label)
 *   - `separator` — divider (DropdownMenu.Separator)
 *   - `skeleton`  — placeholder item (visual only, no Radix slot)
 */
export const menuVariants = tv({
  slots: {
    content: [
      'z-50 min-w-[180px] py-1.5',
      // Surface elevation: `bg-white` is hardcoded (does NOT
      // auto-invert via the dashforgePreset CSS-var swap), so we
      // pair it with `dark:bg-neutral-100` (target #171717 — one
      // elevation tier above page surface in dark mode). This is
      // Category B of THEME-AUDIT.md — must stay on the same
      // string literal so the whitelist regex matches.
      'rounded-md border border-neutral-200 bg-white dark:bg-neutral-100 shadow-lg',
      // Smooth fade-in via Radix's data-state attributes. Motion-
      // reduce gated.
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'motion-reduce:animate-none motion-reduce:transition-none',
      // List reset (defensive — same defensive pattern as
      // Autocomplete listbox after the listbox-bullets fix in 1.0.1).
      'list-none pl-0 m-0',
    ],
    item: [
      'group relative flex cursor-pointer select-none items-center gap-2',
      'px-3 py-1.5 mx-1 my-0.5',
      'rounded-md text-sm text-neutral-900',
      'outline-none',
      // Radix sets data-highlighted when the item is keyboard-focused
      // OR hovered. We anchor the active visual state to that single
      // attribute so keyboard + mouse interactions look identical.
      'data-[highlighted]:bg-neutral-100',
      // Disabled (Radix sets data-disabled).
      'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed data-[disabled]:pointer-events-none',
      'transition-colors duration-100',
      'motion-reduce:transition-none',
    ],
    itemIcon: 'shrink-0 inline-flex items-center justify-center w-4 h-4',
    itemLabel: 'flex-1 truncate',
    itemEnd: 'shrink-0 ml-3 inline-flex items-center text-xs text-neutral-500',
    label: [
      'px-3 py-1 mx-1 mt-1 text-xs font-medium uppercase tracking-wide',
      'text-neutral-500',
    ],
    separator: 'h-px my-1 mx-1 bg-neutral-200',
    skeleton: [
      'flex items-center gap-2 px-3 py-1.5 mx-1 my-0.5',
      'animate-pulse motion-reduce:animate-none',
    ],
  },
  variants: {
    /**
     * Item color intent. `'danger'` highlights destructive actions
     * (Delete, Sign out) with red bg on hover. Both bg and text
     * shift to the danger palette when the item is highlighted.
     */
    color: {
      default: {},
      danger: {
        item: [
          'text-danger-700',
          // Hover + keyboard focus → red soft bg + saturated text.
          'data-[highlighted]:bg-danger-50 data-[highlighted]:text-danger-800',
          // Dark mode: bg-danger-50 doesn't auto-invert (color
          // palettes don't), so we add the explicit dark variant.
          // The `text-danger-700` base also gets a dark counterpart
          // for readability on the dark surface.
          'dark:text-danger-300',
          'dark:data-[highlighted]:bg-danger-950 dark:data-[highlighted]:text-danger-200',
        ],
        itemIcon: 'text-danger-600 dark:text-danger-400',
      },
    },
    /**
     * Visual `selected` hint — adds a faint primary bg + the
     * leading edge gets a primary accent. Pure visual; v1 has no
     * controlled selection state machine.
     */
    selected: {
      true: {
        item: [
          'bg-primary-50 text-primary-900',
          'dark:bg-primary-950 dark:text-primary-100',
        ],
        itemIcon: 'text-primary-600 dark:text-primary-400',
      },
    },
  },
  defaultVariants: {
    color: 'default',
  },
});

export type MenuVariants = VariantProps<typeof menuVariants>;

/**
 * Resolve a `MenuPlacement` enum to Radix `side` + `align` props.
 * Single source of truth so Menu.tsx doesn't need a switch statement.
 */
export function placementToRadix(placement: MenuPlacement): {
  side: 'top' | 'right' | 'bottom' | 'left';
  align: 'start' | 'center' | 'end';
} {
  // The format is `<side>` or `<side>-<align>`. Center is the default
  // when no `-start` / `-end` suffix is present.
  const [side, alignSuffix] = placement.split('-') as [
    'top' | 'right' | 'bottom' | 'left',
    'start' | 'end' | undefined,
  ];
  return {
    side,
    align: alignSuffix ?? 'center',
  };
}
