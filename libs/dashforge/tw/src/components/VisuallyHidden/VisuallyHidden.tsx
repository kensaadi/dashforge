import { forwardRef, type ElementType } from 'react';
import { cn } from '../../utils/cn.js';
import type { VisuallyHiddenProps } from './visuallyHidden.types.js';

/**
 * `<VisuallyHidden>` — the accessibility primitive.
 *
 * Hides children from sighted users (zero pixels rendered, no layout
 * impact) while keeping them in the accessibility tree. Screen readers
 * speak the content; voice control software uses it for click targets;
 * keyboard users see nothing — same as if it weren't there.
 *
 * Implementation: Tailwind's built-in `sr-only` utility, which expands to:
 *
 *   .sr-only {
 *     position: absolute;
 *     width: 1px;
 *     height: 1px;
 *     padding: 0;
 *     margin: -1px;
 *     overflow: hidden;
 *     clip: rect(0,0,0,0);
 *     white-space: nowrap;
 *     border-width: 0;
 *   }
 *
 * This is the canonical "visually-hidden but screen-reader-accessible"
 * pattern, also known as the WebAIM clip technique. Critically:
 *
 *   • NOT `display: none` (removes from a11y tree)
 *   • NOT `visibility: hidden` (also removes from a11y tree)
 *   • NOT `opacity: 0` (technically still rendered, doesn't help AT)
 *   • NOT `width/height: 0` (collapses, some AT skips it)
 *
 * Default tag is `<span>` (inline) — the 99% case is "label inside a
 * button or link". For block content, override with `as="div"`, but
 * be aware nesting block inside inline is invalid HTML.
 *
 * The component is intentionally tiny (~30 LoC total): one className,
 * one tag. The value is the COMPONENT NAME — `<VisuallyHidden>` reads
 * as an intentional a11y decision in code review, while
 * `className="sr-only"` looks like a typo or a forgotten utility.
 */
export const VisuallyHidden = forwardRef<HTMLElement, VisuallyHiddenProps>(
  function VisuallyHidden(props, ref) {
    const { as, sx, children, ...rest } = props;

    const Tag = (as ?? 'span') as ElementType;
    const classes = cn('sr-only', sx);

    return (
      <Tag ref={ref as never} className={classes} {...rest}>
        {children}
      </Tag>
    );
  },
);

VisuallyHidden.displayName = 'VisuallyHidden';
