import { useContext, useEffect } from 'react';
import { DashFormContext } from '../bridge';

/**
 * Module-level dedup set. Keyed on `${componentName}:${name}:${propKey}`.
 * The hook fires at most once per (component-instance-name × prop) —
 * even across multiple mounts of the same field name — because in
 * practice a consumer either passes the misuse combination or they
 * don't; a second warning is noise.
 *
 * Test-only: `_clearWarnedForTests` allows suites to reset the set
 * between tests without exposing the set itself.
 *
 * @internal
 */
const warned = new Set<string>();

/**
 * @internal
 * Test-only helper. Do not call from production code.
 */
export function _clearWarnedForTests(): void {
  warned.clear();
}

/**
 * Dev-mode warning for bridge-integrated field components:
 * if the component is running in form mode (i.e. mounted under a
 * `<DashFormProvider>`, detected at runtime via `useContext(DashFormContext)`)
 * AND the consumer has passed any of the controlled / uncontrolled
 * value props (`value`, `defaultValue`, `onValueChange`), fire a
 * console warning pointing to the correct API — `<DashForm
 * defaultValues={{ [name]: ... }} />` for initial values, reactions
 * or `useDashFormContext().rhf` for the rest.
 *
 * ## Why this exists
 *
 * The type system cannot see React context — TypeScript has no
 * visibility into whether a JSX subtree will end up under a provider
 * at runtime. Any type-side discriminant (e.g. splitting the props
 * type on `rules` presence) is a proxy prediction and misses the
 * common case where consumers pass no `rules` while writing form
 * code. The runtime, however, already knows the truth: reading
 * `useContext(DashFormContext)` returns the bridge (form mode) or
 * `null` (standalone). This hook exposes that truth as a targeted
 * warning at the exact prop level.
 *
 * The type-side split (kept in place for the components that have
 * one, e.g. Autocomplete) catches the `rules + defaultValue` misuse
 * combination at compile time. This runtime warning is the other
 * half of the pair — it catches the `defaultValue` (or `value` or
 * `onValueChange`) alone case that the type-side cannot see.
 *
 * ## Cost
 *
 * Guarded by `process.env.NODE_ENV !== 'production'`. In production
 * builds every reasonable bundler dead-code-eliminates the body of
 * the effect. Zero cost in shipped consumer bundles.
 *
 * Dedup keeps dev-console noise low: at most one warning per
 * `(componentName, name, propKey)` triple for the process lifetime.
 *
 * ## Usage
 *
 * Call from any bridge-integrated field component near the top of
 * the function body, unconditionally (respects rules of hooks):
 *
 * ```tsx
 * useWarnIfControlledInFormMode('Autocomplete', name, {
 *   value: explicitValue,
 *   defaultValue,
 *   onValueChange,
 * });
 * ```
 *
 * The hook reads the bridge from the same context the component
 * itself reads, so no `isFormMode` argument is required.
 *
 * @param componentName - Human-readable component name for the warning
 *   message (e.g. `"Autocomplete"`, `"Select"`). NOT a package path;
 *   the message is read by developers scanning the console.
 * @param name - The `name` prop of the field. Interpolated into the
 *   warning message to help locate the offending field.
 * @param controlledProps - Object whose keys are the prop names that
 *   should be forbidden in form mode. Only keys with a non-`undefined`
 *   value trigger a warning. Recommended shape: `{ value, defaultValue,
 *   onValueChange }` with the destructured prop values passed through.
 */
export function useWarnIfControlledInFormMode(
  componentName: string,
  name: string,
  controlledProps: Record<string, unknown>,
): void {
  const bridge = useContext(DashFormContext);
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    // No bridge → standalone mode → the controlled/uncontrolled props
    // are the correct API for this component's state. Nothing to warn.
    if (!bridge?.register) return;

    for (const propKey of Object.keys(controlledProps)) {
      const propValue = controlledProps[propKey];
      if (propValue === undefined) continue;
      const key = `${componentName}:${name}:${propKey}`;
      if (warned.has(key)) continue;
      warned.add(key);
      // Deliberate cross-cutting warning — surfaces at the consumer's
      // dev console next to their other build output. Message names
      // the component, the field, the offending prop and the correct
      // API to use instead.
      console.warn(
        `[Dashforge] <${componentName} name="${name}">: \`${propKey}\` is ` +
          `ignored inside a <DashFormProvider>. Form-mode initial values ` +
          `come from <DashForm defaultValues={{ ${name}: … }} />; ` +
          `field-level state comes from the bridge. ` +
          `(This warning appears once per field.)`,
      );
    }
    // We intentionally depend on `bridge` (identity-stable across
    // renders for a mounted provider) and the two primitive strings.
    // `controlledProps` object identity changes on every render, but
    // the effect body iterates its keys imperatively — a new object
    // with the same values just re-runs the dedup check, which is
    // O(#keys) and short-circuits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, componentName, name]);
}
