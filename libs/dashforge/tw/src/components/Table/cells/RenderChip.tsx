import type { ReactNode } from 'react';
import { tv, type VariantProps } from 'tailwind-variants';
import { cn } from '../../../utils/cn.js';

/**
 * Internal mini-chip used by the cell renderer library. Not exported
 * from `@dashforge/tw` as a standalone component (per Sprint 4.1
 * scope decision — a standalone `<Chip>` may ship in Sprint 5 if
 * demand emerges).
 *
 * Variants:
 *  - `color`: 7 intents (neutral / primary / success / warning /
 *    danger / info / secondary)
 *  - `variant`: `soft` (default) / `solid` / `outline`
 *  - `size`: `sm` / `md`
 */
const chipVariants = tv({
  base: [
    'inline-flex items-center gap-1 rounded-full font-medium',
    'whitespace-nowrap',
  ],
  variants: {
    color: {
      neutral: '',
      primary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      secondary: '',
    },
    variant: {
      soft: '',
      solid: '',
      outline: '',
    },
    size: {
      sm: 'h-5 px-2 text-xs',
      md: 'h-6 px-2.5 text-xs',
    },
  },
  compoundVariants: [
    // soft = subtle bg + dark text.
    // Neutral row uses NO `dark:` variants — the dashforgePreset()
    // CSS-var swap auto-inverts the neutral palette already.
    // Color rows below KEEP `dark:` variants because color palettes
    // don't auto-invert: the `dark:` shift is an intentional design
    // choice (darker bg + lighter text in dark mode for visual cohesion).
    { variant: 'soft', color: 'neutral',   class: 'bg-neutral-100 text-neutral-700' },
    { variant: 'soft', color: 'primary',   class: 'bg-primary-100 dark:bg-primary-950 text-primary-700 dark:text-primary-300' },
    { variant: 'soft', color: 'success',   class: 'bg-success-100 dark:bg-success-950 text-success-700 dark:text-success-300' },
    { variant: 'soft', color: 'warning',   class: 'bg-warning-100 dark:bg-warning-950 text-warning-700 dark:text-warning-300' },
    { variant: 'soft', color: 'danger',    class: 'bg-danger-100 dark:bg-danger-950 text-danger-700 dark:text-danger-300' },
    { variant: 'soft', color: 'info',      class: 'bg-info-100 dark:bg-info-950 text-info-700 dark:text-info-300' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-100 dark:bg-secondary-950 text-secondary-700 dark:text-secondary-300' },
    // solid = full bg + contrasting text.
    // solid neutral: both `bg-neutral-700` and `text-neutral-50` sit
    // on the neutral palette, so they auto-invert together via the
    // CSS-var swap — bg/text contrast is preserved in BOTH modes.
    // (`text-white` is deliberately NOT used here: white does not
    // auto-invert, which would flip the contrast in dark mode.)
    { variant: 'solid', color: 'neutral',   class: 'bg-neutral-700 text-neutral-50' },
    { variant: 'solid', color: 'primary',   class: 'bg-primary-500 text-white' },
    { variant: 'solid', color: 'success',   class: 'bg-success-500 text-white' },
    { variant: 'solid', color: 'warning',   class: 'bg-warning-500 text-white' },
    { variant: 'solid', color: 'danger',    class: 'bg-danger-500 text-white' },
    { variant: 'solid', color: 'info',      class: 'bg-info-500 text-white' },
    { variant: 'solid', color: 'secondary', class: 'bg-secondary-500 text-white' },
    // outline = border + colored text
    // outline neutral: both border + text auto-invert via CSS-var swap.
    { variant: 'outline', color: 'neutral',   class: 'border border-neutral-300 text-neutral-700' },
    { variant: 'outline', color: 'primary',   class: 'border border-primary-500 text-primary-700 dark:text-primary-300' },
    { variant: 'outline', color: 'success',   class: 'border border-success-500 text-success-700 dark:text-success-300' },
    { variant: 'outline', color: 'warning',   class: 'border border-warning-500 text-warning-700 dark:text-warning-300' },
    { variant: 'outline', color: 'danger',    class: 'border border-danger-500 text-danger-700 dark:text-danger-300' },
    { variant: 'outline', color: 'info',      class: 'border border-info-500 text-info-700 dark:text-info-300' },
    { variant: 'outline', color: 'secondary', class: 'border border-secondary-500 text-secondary-700 dark:text-secondary-300' },
  ],
  defaultVariants: {
    color: 'neutral',
    variant: 'soft',
    size: 'sm',
  },
});

type ChipVariants = VariantProps<typeof chipVariants>;

export interface RenderChipProps extends ChipVariants {
  children: ReactNode;
  className?: string;
}

export function RenderChip(props: RenderChipProps) {
  const { children, color, variant, size, className } = props;
  return (
    <span className={cn(chipVariants({ color, variant, size }), className)}>
      {children}
    </span>
  );
}
