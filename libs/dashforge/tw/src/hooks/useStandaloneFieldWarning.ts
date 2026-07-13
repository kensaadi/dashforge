import { useEffect, useRef } from 'react';

/**
 * `useStandaloneFieldWarning` — dev-only guard for `@dashforge/tw` form
 * widgets rendered outside a `DashFormProvider` and without a controlled
 * (`value` + `onChange`) pair.
 *
 * The failure mode this catches is silent: without a bridge AND without
 * user-owned value/onChange, the widget mounts as an uncontrolled input
 * that never emits changes upward. There is no visual hint, no console
 * error, and no exception — the consumer just wonders why typing does
 * nothing.
 *
 * The warning fires **once per mount** (guarded via a ref) and only in
 * development builds (`process.env.NODE_ENV !== 'production'`). In
 * production the hook is a no-op — the `useEffect` still runs but the
 * predicate short-circuits before touching `console`.
 *
 * Note that `isFormMode`, `value`, and `onChange` are captured on the
 * first render only. If a consumer legitimately moves from unset to
 * controlled after mount, the warning does not un-fire — but the mount
 * itself was already broken, so warning once is enough.
 *
 * @param componentName — e.g. `"TextField"`, `"Checkbox"`. Included in the
 *   warning message so consumers can spot the offending widget.
 * @param name — the widget's `name` prop; included when set so the message
 *   points at a specific field.
 * @param isFormMode — `true` when a `DashFormBridge` is present in context
 *   AND registers the field. Suppresses the warning.
 * @param value — the user-provided value prop (`value` on TextField /
 *   NumberField / Textarea / RadioGroup, `checked` on Switch / Checkbox).
 * @param onChange — the user-provided change callback (`onChange` on
 *   TextField / NumberField / Textarea, `onCheckedChange` on Switch /
 *   Checkbox, `onValueChange` on RadioGroup).
 *
 * @see Issue #113 — `@dashforge/tw`: dev warning for standalone form
 * widget without value/onChange (G-29).
 */
export function useStandaloneFieldWarning(
  componentName: string,
  name: string | undefined,
  isFormMode: boolean,
  value: unknown,
  onChange: unknown,
): void {
  const hasWarnedRef = useRef(false);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (hasWarnedRef.current) return;
    if (isFormMode) return;
    if (value !== undefined) return;
    if (onChange !== undefined) return;
    hasWarnedRef.current = true;
    const nameSegment =
      typeof name === 'string' && name.length > 0 ? ` name="${name}"` : '';
    // eslint-disable-next-line no-console -- dev-only guard, guarded by NODE_ENV above.
    console.warn(
      `[@dashforge/tw] <${componentName}${nameSegment}> is not inside a ` +
        `DashFormProvider and no value/onChange were provided. Did you ` +
        `forget the provider, or intend controlled mode? The widget will ` +
        `render but never emit changes upward. See the "Controlled vs ` +
        `bridge mode" docs.`,
    );
    // The check runs once on mount; the ref guards re-runs even if React
    // Strict Mode double-invokes the effect in development.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
