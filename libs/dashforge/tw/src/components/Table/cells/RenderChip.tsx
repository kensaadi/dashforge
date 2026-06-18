import type { ReactNode } from 'react';
import { Chip } from '../../Chip/Chip.js';
import type { ChipProps } from '../../Chip/chip.types.js';

/**
 * Internal mini-chip used by the Table cell renderer library.
 *
 * **Sprint 4.4 refactor**: this component used to own its own
 * `chipVariants` recipe (the 3 × 7 variant × color matrix). The
 * matrix has since been promoted to the public `<Chip>` at
 * `components/Chip/Chip.tsx` as the single source of truth.
 * `RenderChip` is now a thin wrapper that translates its
 * `children`-style API to `<Chip label={…}>` without any visual
 * change. Table cell consumers keep working unchanged.
 *
 * For new code, prefer importing `<Chip>` from `@dashforge/tw`
 * directly — `RenderChip` exists only for the Table cell renderer
 * registry where the `children` prop convention pre-dates the
 * public Chip API.
 */
export interface RenderChipProps
  extends Pick<ChipProps, 'color' | 'variant' | 'size' | 'className'> {
  children: ReactNode;
}

export function RenderChip(props: RenderChipProps) {
  const { children, color, variant, size, className } = props;
  return (
    <Chip
      label={children}
      color={color}
      variant={variant}
      size={size}
      className={className}
    />
  );
}
