import { forwardRef } from 'react';
import { useComponentDefaults } from '@dashforge/tw-theme';
import { cn } from '../../utils/cn.js';
import { dividerVariants, dividerLineVariants } from './divider.variants.js';
import type { DividerProps } from './divider.types.js';

/**
 * `<Divider>` — visual separator. Two modes:
 *
 *   1. Line-only (no children):
 *
 *        <Divider />
 *      →  <hr role="separator" aria-orientation="horizontal" />
 *
 *      Renders a single horizontal line via `border-t-*` on an `<hr>`
 *      (which by default has no `display`, no margin in our reset, just
 *      acts as the border carrier).
 *
 *   2. Labeled (with children):
 *
 *        <Divider><Typography variant="overline">OR</Typography></Divider>
 *      →  <div role="separator" aria-orientation="horizontal">
 *           <span aria-hidden className="flex-1 border-t" />
 *           <span className="px-3">OR</span>
 *           <span aria-hidden className="flex-1 border-t" />
 *         </div>
 *
 *      Two line segments share the available space; the label sits
 *      between them with horizontal padding for breathing room. Each
 *      line segment is `aria-hidden` (the role="separator" on the root
 *      conveys the separator semantics — duplicating it would confuse
 *      screen readers).
 *
 * Alignment:
 *   • align="start"  → label hugs the left, right segment grows
 *   • align="center" (default) → both segments equal
 *   • align="end"    → label hugs the right, left segment grows
 *
 *   Implemented by setting `flex-basis: 0` to either segment to keep
 *   it minimal. We use `basis-[2rem]` (32px short stub) rather than
 *   `basis-0` so a tiny line still hints at the divider on the squashed
 *   side — pure flex-1 vs basis-0 would collapse it invisibly.
 *
 * Vertical orientation:
 *   The line orientation flips (border-l instead of border-t). Vertical
 *   labeled dividers are RARE in practice — supported for parity but
 *   the typical use is line-only between flex row items.
 *
 * a11y:
 *   • Root element gets `role="separator"` (or implicit via `<hr>`)
 *   • `aria-orientation` is set explicitly so AT knows the axis
 *   • Labeled mode: label has no extra role; the visual layout speaks
 */
export const Divider = forwardRef<HTMLElement, DividerProps>(
  function Divider(props, ref) {
    const themeDefaults = useComponentDefaults('Divider');
    const merged: DividerProps = { ...themeDefaults?.defaults, ...props };
    const {
      orientation = 'horizontal',
      align = 'center',
      variant = 'solid',
      color = 'neutral',
      children,
      flexItem,  // currently a no-op (see types) — `self-stretch` is in TV base
      sx,
      ...rest
    } = merged;

    // Reference flexItem to silence unused-var lint while keeping it in the
    // public API for parity with MUI Divider. Forward-compat hook.
    void flexItem;

    // ─── Mode 1: line-only (no children) ─────────────────────────────
    if (children == null) {
      const lineClasses = cn(
        dividerLineVariants({ orientation, variant, color, segment: 'full' }),
        sx,
      );

      // Horizontal → <hr>: zero default styling once we strip the UA
      // default `<hr>` border via `border-0` (in `dividerLineVariants`
      // base) and apply our own `border-t-*`. Vertical → <div> because
      // <hr> can't be vertical cross-browser-consistently.
      if (orientation === 'horizontal') {
        return (
          <hr
            ref={ref as never}
            role="separator"
            aria-orientation="horizontal"
            className={cn('border-0', lineClasses)}
            {...rest}
          />
        );
      }
      return (
        <div
          ref={ref as never}
          role="separator"
          aria-orientation="vertical"
          className={lineClasses}
          {...rest}
        />
      );
    }

    // ─── Mode 2: labeled (with children) ─────────────────────────────
    const rootClasses = cn(dividerVariants({ orientation, align }), sx);

    /*
     * Segment widths per `align`:
     *   • center → both flex-1 (equal share)
     *   • start  → left short stub, right grows
     *   • end    → left grows, right short stub
     *
     * "Short stub" = 2rem so the divider visually exists on the squashed
     * side without dominating the label.
     */
    const isHorizontal = orientation === 'horizontal';
    const leftStubClass  = align === 'start' ? (isHorizontal ? 'basis-8 grow-0' : 'basis-8 grow-0') : 'flex-1';
    const rightStubClass = align === 'end'   ? (isHorizontal ? 'basis-8 grow-0' : 'basis-8 grow-0') : 'flex-1';

    const lineCommon = dividerLineVariants({ orientation, variant, color, segment: 'grow' });
    const labelPadding = isHorizontal ? 'px-3' : 'py-3';

    return (
      <div
        ref={ref as never}
        role="separator"
        aria-orientation={orientation}
        className={rootClasses}
        {...rest}
      >
        <span aria-hidden="true" className={cn(lineCommon, leftStubClass)} />
        <span className={cn('shrink-0 text-sm text-neutral-500', labelPadding)}>
          {children}
        </span>
        <span aria-hidden="true" className={cn(lineCommon, rightStubClass)} />
      </div>
    );
  },
);

Divider.displayName = 'Divider';
