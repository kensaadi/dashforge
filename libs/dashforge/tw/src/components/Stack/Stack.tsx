import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { stackVariants } from './stack.variants.js';
import type { StackProps } from './stack.types.js';

/**
 * Walk the children, inserting `divider` BETWEEN every consecutive pair.
 *
 * Implementation notes:
 *   • `React.Children.toArray` assigns auto-keys but does NOT recursively
 *     flatten Fragments — it treats them as opaque single children. So
 *     `<Stack><><a/><b/></><c/></Stack>` is 2 boundaries (fragment + c),
 *     yielding ONE divider. Hoist items out of the fragment when you
 *     need a divider between them. Documented + asserted in the tests.
 *   • Dividers are wrapped in `<Fragment>` with a deterministic key
 *     derived from the boundary index — stable across re-renders so
 *     React reconciles correctly when children re-order.
 *   • If `divider` is a valid element, we `cloneElement` once per
 *     boundary (cheaper than re-rendering the JSX expression N-1 times).
 *     For string/number dividers we wrap in a span automatically.
 */
function interleaveDividers(children: ReactNode, divider: ReactNode): ReactNode[] {
  const items = Children.toArray(children);
  if (items.length <= 1) return items;

  const result: ReactNode[] = [];
  items.forEach((child, i) => {
    result.push(child);
    if (i < items.length - 1) {
      const key = `df-stack-divider-${i}`;
      if (isValidElement(divider)) {
        result.push(cloneElement(divider as ReactElement<{ key?: string }>, { key }));
      } else {
        result.push(<Fragment key={key}>{divider}</Fragment>);
      }
    }
  });
  return result;
}

/**
 * `<Stack>` — flex container 1D, the layout primitive.
 *
 * This is the ONLY component in @dashforge/tw that does flex. Box
 * doesn't, Grid does CSS Grid (not flex). The strict naming → engine
 * mapping is the whole point: when you read `<Stack>` in a JSX tree,
 * you instantly know it's flex. No `<Box display="flex" ...>` traps.
 *
 * Direction defaults to `'col'` (vertical stack) — the most common
 * case for forms, sidebars, settings panels. Pass `direction="row"`
 * for horizontal layouts (toolbars, button rows, breadcrumbs).
 *
 * The `divider` prop is the runtime-only piece: TV can't encode the
 * "render this between each child" logic as a class, so we walk the
 * children at render time. The walk is O(n); for n ≤ ~10 (typical
 * Stack content) the cost is negligible. For very long Stacks (1000+
 * items), prefer to render dividers as part of each child instead.
 *
 * When `asChild` is true, the divider prop is silently ignored — Slot
 * requires a single child, and the N-1 insertion has nowhere to act.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(
  function Stack(props, ref) {
    const themeDefaults = useComponentDefaults('Stack');
    const merged: StackProps = { ...themeDefaults?.defaults, ...props };
    const {
      direction,
      align,
      justify,
      gap,
      wrap,
      fullWidth,
      fullHeight,
      divider,
      as,
      asChild = false,
      sx,
      children,
      ...rest
    } = merged;

    const classes = cn(
      stackVariants({ direction, align, justify, gap, wrap, fullWidth, fullHeight }),
      sx,
    );

    if (asChild) {
      // Slot expects a single child; divider has no place here.
      return (
        <Slot ref={ref} className={classes} {...rest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    const content = divider != null ? interleaveDividers(children, divider) : children;

    return (
      <Tag ref={ref as never} className={classes} {...rest}>
        {content}
      </Tag>
    );
  },
);

Stack.displayName = 'Stack';
