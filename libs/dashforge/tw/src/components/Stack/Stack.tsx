import {
  Children,
  Fragment,
  cloneElement,
  forwardRef,
  isValidElement,
  useContext,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Slot } from '@radix-ui/react-slot';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { useAccessState } from '../../hooks/useAccessState.js';
import {
  STACK_DIRECTION_VALUES,
  STACK_GAP_VALUES,
  stackVariants,
} from './stack.variants.js';
import type { StackVariants } from './stack.variants.js';
import type { StackProps } from './stack.types.js';

/**
 * Track already-warned `gap` values per module lifetime so the same
 * unknown value doesn't flood the console — mirrors the
 * useStandaloneFieldWarning "warn once" ergonomic. `Set<unknown>` so
 * `null` / arbitrary strings share the same bucket as `NaN`.
 */
const warnedGapValues = new Set<unknown>();

/** Same "warn once per value" bucket, for `direction`. */
const warnedDirectionValues = new Set<unknown>();

/** Whether the `spacing`-instead-of-`gap` warning has already fired. */
let warnedSpacingAlias = false;

/**
 * Names people reach for instead of the ones this component uses, mapped to
 * what they meant. kensaadi/dashforge#63 gap K reported the surprise;
 * accepting both spellings was the alternative and was not taken, because a
 * second name for one axis is a fork every consumer, every theme default
 * and every doc example then has to pick a side of, forever.
 *
 * TypeScript already rejects these. The guard is for the consumers TS does
 * not reach: JS callers, `{...anyProps}` spreads, values read from config.
 * Left alone the value is simply dropped and the Stack renders its default
 * axis, which is the silent failure the report described as "surprising".
 */
const DIRECTION_ALIASES: Record<string, string> = {
  column: 'col',
  'column-reverse': 'col-reverse',
  vertical: 'col',
  horizontal: 'row',
};

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
/**
 * The divider orientation that separates items along each axis. A row is
 * separated by vertical rules and a column by horizontal ones, which is the
 * opposite of what the names suggest and the reason this was worth deriving
 * rather than leaving to the caller. kensaadi/dashforge#63 gap F.
 */
const DIVIDER_ORIENTATION_FOR: Record<string, 'horizontal' | 'vertical'> = {
  row: 'vertical',
  'row-reverse': 'vertical',
  col: 'horizontal',
  'col-reverse': 'horizontal',
};

/**
 * True for our own `<Divider>`, read off `displayName` rather than by
 * importing the component: Stack has no business depending on Divider, and
 * the check has to fail safely for anything else. Injecting an
 * `orientation` prop into a foreign element is how `tooltip` once landed on
 * the DOM as an unknown attribute (README-BUG § BUG 9).
 */
function isDashforgeDivider(node: ReactElement): boolean {
  return (node.type as { displayName?: string })?.displayName === 'Divider';
}

function interleaveDividers(
  children: ReactNode,
  divider: ReactNode,
  direction: string
): ReactNode[] {
  const items = Children.toArray(children);
  if (items.length <= 1) return items;

  const result: ReactNode[] = [];
  items.forEach((child, i) => {
    result.push(child);
    if (i < items.length - 1) {
      const key = `df-stack-divider-${i}`;
      if (isValidElement(divider)) {
        // A `<Divider>` defaults to `horizontal`, so dropping one into a
        // row Stack gave a zero-height rule at `w-full`: it did not
        // separate anything, it demanded the whole width and squeezed the
        // items instead. The Stack knows its own axis, so it supplies the
        // orientation the caller did not choose. An explicit `orientation`
        // always wins, and a non-Divider node is passed through untouched.
        const props = divider.props as { orientation?: unknown };
        const shouldDerive =
          isDashforgeDivider(divider) && props.orientation === undefined;

        result.push(
          cloneElement(divider as ReactElement<{ key?: string }>, {
            key,
            ...(shouldDerive
              ? { orientation: DIVIDER_ORIENTATION_FOR[direction] ?? 'horizontal' }
              : {}),
          } as Partial<{ key?: string }>)
        );
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
      visibleWhen,
      access,
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
       
      console.warn(
        `[@dashforge/tw] <Stack gap={${JSON.stringify(gap)}}> is not on the ` +
          `token-scale set (${STACK_GAP_VALUES.join(', ')}). The variant ` +
          `mapping silently falls back to no gap. Use a numeric literal ` +
          `from the accepted set — token strings like "sm" / "md" / "lg" ` +
          `are not supported.`,
      );
    }

    // Same shape of guard for `direction`, which fails the same silent way:
    // an unrecognised value is dropped by the variant recipe and the Stack
    // falls back to `defaultVariants.direction`, so a column Stack asked
    // for as "column" quietly lays out as a column anyway and a "vertical"
    // row does not. See kensaadi/dashforge#63 gap K.
    if (
      process.env.NODE_ENV !== 'production' &&
      direction !== undefined &&
      !STACK_DIRECTION_VALUES.includes(direction as never) &&
      !warnedDirectionValues.has(direction)
    ) {
      warnedDirectionValues.add(direction);
      const meant = DIRECTION_ALIASES[String(direction)];
      console.warn(
        `[@dashforge/tw] <Stack direction={${JSON.stringify(direction)}}> is ` +
          `not an accepted value (${STACK_DIRECTION_VALUES.join(', ')}). ` +
          `The variant mapping drops it and the Stack falls back to ` +
          `"${'col'}".` +
          (meant ? ` Did you mean "${meant}"?` : ''),
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

    // Bridge — hooks called unconditionally, ABOVE the early return
    // (rules-of-hooks; see README-BUG § BUG 33 for what happens when a
    // subscription is made conditional instead). `useEngineVisibility`
    // re-evaluates the predicate reactively inside a `<DashForm>` and
    // watches nothing when `visibleWhen` is omitted; `useAccessState`
    // consults the @dashforge/rbac policy engine. Both are no-ops when
    // their prop is absent, so a consumer passing neither renders
    // exactly as before.
    const bridge = useContext(DashFormContext);
    const isVisible = useEngineVisibility(bridge?.engine, visibleWhen);
    const accessState = useAccessState(access);

    // Early return — predicate false OR RBAC denies visibility.
    if (!isVisible || !accessState.visible) return null;

    const ariaProps = {
      'aria-disabled': accessState.disabled || undefined,
      'aria-readonly': accessState.readonly || undefined,
      'data-disabled': accessState.disabled || undefined,
      'data-readonly': accessState.readonly || undefined,
    };

    const {
      className: consumerClassName,
      // `spacing` is MUI's name for this axis and the one consumers reach
      // for first (kensaadi/dashforge#63 gap K). Pulled out of the spread
      // rather than passed through: React 19 writes an unknown lowercase
      // attribute to the DOM without a word, so `spacing={2}` would ship as
      // `spacing="2"` on the element while doing nothing to the layout.
      // That is BUG 9's failure mode, and the warning below is the signal
      // the consumer would otherwise never get.
      spacing: spacingAlias,
      ...safeRest
    } = rest as typeof rest & {
      className?: string;
      spacing?: unknown;
    };

    if (
      process.env.NODE_ENV !== 'production' &&
      spacingAlias !== undefined &&
      !warnedSpacingAlias
    ) {
      warnedSpacingAlias = true;
      console.warn(
        `[@dashforge/tw] <Stack spacing={${JSON.stringify(spacingAlias)}}> ` +
          `has no effect: this component calls the axis \`gap\`. The value ` +
          `is dropped rather than forwarded, so it does not reach the DOM ` +
          `either. Use gap={${JSON.stringify(spacingAlias)}}.`,
      );
    }

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
      // RBAC-denied surfaces dim and carry the ARIA attributes assigned
      // below, so descendants and assistive tech can react.
      accessState.disabled && 'opacity-60',
      accessState.readonly && 'opacity-80',
      consumerClassName,
      sx,
    );

    if (asChild) {
      // Slot expects a single child; divider has no place here.
      return (
        <Slot ref={ref} className={classes} {...ariaProps} {...safeRest}>
          {children as ReactElement}
        </Slot>
      );
    }

    const Tag = (as ?? 'div') as ElementType;
    const content =
      divider != null
        ? interleaveDividers(children, divider, direction ?? 'col')
        : children;

    return (
      <Tag ref={ref as never} className={classes} {...ariaProps} {...safeRest}>
        {content}
      </Tag>
    );
  },
);

Stack.displayName = 'Stack';
