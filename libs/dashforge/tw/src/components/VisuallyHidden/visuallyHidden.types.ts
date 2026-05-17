import type { ElementType, HTMLAttributes, ReactElement } from 'react';

/**
 * Props for `<VisuallyHidden>` — the a11y primitive.
 *
 * Hides content visually (zero pixels rendered) while keeping it
 * accessible to assistive technology (screen readers, voice control).
 * The canonical use case: icon-only buttons that need an audible label
 * for non-visual users.
 *
 *   <button>
 *     <CloseIcon />
 *     <VisuallyHidden>Close dialog</VisuallyHidden>
 *   </button>
 *
 * Implementation uses Tailwind's `sr-only` utility, which sets
 * `position: absolute; width: 1px; height: 1px; padding: 0;
 * margin: -1px; overflow: hidden; clip: rect(0,0,0,0);
 * white-space: nowrap; border-width: 0;` — the canonical
 * "visually-hidden but screen-reader-accessible" pattern. Better
 * than `display: none` (removes from a11y tree) and better than
 * `visibility: hidden` (also removes from a11y tree).
 */
export interface VisuallyHiddenProps
  extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  /**
   * The text or markup hidden from sighted users but read by AT.
   * Most often a string label.
   */
  children?: ReactElement | string | number;

  /**
   * Override the rendered HTML tag. Defaults to `'span'` — inline
   * placement is the most common case (label inside a button or link).
   * Use `as="div"` when the hidden content is block-level, but be
   * aware: nesting a block inside an inline parent is invalid HTML.
   */
  as?: ElementType;

  /**
   * Utility classes appended to `sr-only`. RARELY needed for this
   * primitive (it's just hidden text) — kept for API parity.
   */
  sx?: string;
}
