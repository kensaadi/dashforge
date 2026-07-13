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
import { STACK_GAP_VALUES, stackVariants } from './stack.variants.js';
import type { StackVariants } from './stack.variants.js';
import type { StackProps } from './stack.types.js';

/**
 * Track already-warned `gap` values per module lifetime so the same
 * unknown value doesn't flood the console — mirrors the
 * useStandaloneFieldWarning "warn once" ergonomic. `Set<unknown>` so
 * `null` / arbitrary strings share the same bucket as `NaN`.
 */
const warnedGapValues = new Set<unknown>();

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

    // Dev-only guard for #111 (G-27): `<Stack gap>` is typed to the
    // strict `StackGap` literal union, but a dynamic runtime value
    // (e.g. `gap={someProps.spacing}` where `someProps` is loosely
    // typed) can still slip through. Warn once per unknown value so
    // consumers get a real signal instead of silent `rowGap: normal`.
    if (
      process.env.NODE_ENV !== 'production' &&
      gap !== undefined &&
      !STACK_GAP_VALUES.includes(gap as never) &&
      !warnedGapValues.has(gap)
    ) {
      warnedGapValues.add(gap);
      // eslint-disable-next-line no-console -- dev-only guard, guarded by NODE_ENV above.
      console.warn(
        `[@dashforge/tw] <Stack gap={${JSON.stringify(gap)}}> is not on the ` +
          `token-scale set (${STACK_GAP_VALUES.join(', ')}). The variant ` +
          `mapping silently falls back to no gap. Use a numeric literal ` +
          `from the accepted set — token strings like "sm" / "md" / "lg" ` +
          `are not supported.`,
      );
    }

    // Runtime safety-net for #112 (G-28): the `StackProps` interface
    // Omit-excludes `className`, forcing typed consumers to use `sx`. But
    // TS-loose consumers (unchecked casts, `{...anyProps}` spreads) can
    // still smuggle a `className` in at runtime. Left alone, the JSX
    // spread order `<Tag className={classes} {...rest}>` would let that
    // stray `className` clobber the entire variant chain via last-wins
    // prop override — the exact bug the Blueprint dogfood report caught.
    // Extract it, feed it through `cn` so tailwind-merge preserves the
    // non-conflicting utility (e.g. consumer's `min-h-0` + variant
    // `flex flex-col gap-3`), and drop it from the DOM spread.
    const { className: consumerClassName, ...safeRest } = rest as typeof rest & {
      className?: string;
    };

    const classes = cn(
      stackVariants({
        direction,
        align,
        justify,
        // `StackGap` is a numeric-only literal union (`0 | 0.5 | 1 | ...`)
        // for a clean consumer-facing API, but `tailwind-variants` sees
        // the object's mixed key set (`'0.5'` is a string literal at the
        // TypeScript level, the rest are numbers) and asks for that mixed
        // shape here. The JS runtime coerces object keys to strings on
        // lookup, so `stackVariants({ gap: 0.5 })` and
        // `stackVariants({ gap: '0.5' })` both resolve to `'gap-0.5'` —
        // the cast is a compile-time bridge only.
        gap: gap as StackVariants['gap'],
        wrap,
        fullWidth,
        fullHeight,
      }),
      consumerClassName,
      sx,
    );

    if (asChild) {
      // Slot expects a single child; divider has no place here.
      return (
        <Slot ref={ref} className={classes} {...safeRest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    const content = divider != null ? interleaveDividers(children, divider) : children;

    return (
      <Tag ref={ref as never} className={classes} {...safeRest}>
        {content}
      </Tag>
    );
  },
);

Stack.displayName = 'Stack';
