import { forwardRef } from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { kbdVariants } from './kbd.variants.js';
import type { KbdProps } from './kbd.types.js';

/**
 * `<Kbd>` — a single keycap.
 *
 * ```tsx
 * Press <Kbd>Esc</Kbd> to close
 * ```
 *
 * See {@link KbdProps} for the full API surface, including why chords are
 * composed rather than passed as an array.
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(function Kbd(
  rawProps,
  ref
) {
  const themeDefaults = useComponentDefaults('Kbd');
  const { size, sx, className, children } = {
    ...themeDefaults?.defaults,
    ...rawProps,
  } as KbdProps;

  return (
    <kbd ref={ref} className={cn(kbdVariants({ size }), className, sx)}>
      {children}
    </kbd>
  );
});

Kbd.displayName = 'Kbd';
