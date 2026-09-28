import type { ReactNode } from 'react';
import type { KbdVariants } from './kbd.variants.js';

/** Size scale. `md` matches body text; `sm` sits inside dense chrome. */
export type KbdSize = NonNullable<KbdVariants['size']>;

/**
 * Subset of `<Kbd>` props configurable through
 * `theme.components.Kbd.defaults` (Option C).
 */
export type KbdVariantProps = Pick<KbdVariants, 'size'>;

/**
 * Props for `<Kbd>` — a single keycap, for showing the key that triggers
 * something (`⌘K`, `Esc`, `Shift`).
 *
 * It renders the semantic `<kbd>` element rather than a styled span, which
 * is the whole reason the primitive exists: assistive tech and reader modes
 * treat `<kbd>` as keyboard input, and a span says nothing.
 *
 * **Combinations compose.** There is no `keys` prop: a chord is two caps
 * and whatever separator the design calls for, and baking one in would
 * decide `⌘ + K` against `⌘K` for every consumer.
 *
 * ```tsx
 * <span className="inline-flex items-center gap-1">
 *   <Kbd>⌘</Kbd>
 *   <Kbd>K</Kbd>
 * </span>
 * ```
 *
 * A keycap is display chrome, so it carries no `access` / `visibleWhen`:
 * like `<Typography>`, it is gated by wrapping it, not by gating itself.
 */
export interface KbdProps {
  /** The key label. Usually one glyph or a short word (`Esc`, `Tab`). */
  children: ReactNode;

  /**
   * Cap size.
   *
   * @default 'md'
   */
  size?: KbdSize;

  /**
   * Utility classes appended to the variant chain. Resolved through
   * `tailwind-merge`, so a consumer's class always wins over the recipe.
   *
   * @default undefined
   */
  sx?: string;

  /**
   * Escape hatch for the rendered `<kbd>`: `id`, `title`, `data-*`.
   *
   * @default undefined
   */
  className?: string;
}

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Kbd?: {
      defaults?: Partial<KbdVariantProps>;
    };
  }
}
