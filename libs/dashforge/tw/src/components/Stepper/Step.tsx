import type { StepProps } from './stepper.types.js';

/**
 * `<Step>` — a config-carrier child of `<Stepper>`.
 *
 * Renders NOTHING on its own — the parent `<Stepper>` walks its children
 * with `React.Children.toArray`, extracts each `<Step>`'s props to build
 * the visible sequence, and drives the strip + content rendering from
 * there. This mirrors the MUI Tabs / Chakra Tabs "compound children as
 * config" pattern.
 *
 * Placement rule (enforced by the parent's dev-warn): `<Step>` must be a
 * DIRECT child of `<Stepper>`. Wrapping steps in a fragment is fine
 * (`React.Children.toArray` flattens fragments); wrapping in an arbitrary
 * `<div>` is not — the parent won't see the step and will skip it.
 *
 * @see StepProps for the full config surface.
 */
export function Step(_props: StepProps): null {
  return null;
}

Step.displayName = 'Step';

/**
 * Marker used by `<Stepper>` to recognize its own compound child type
 * without pulling in `React.ReactElement<StepProps>` machinery. The
 * parent traverses `React.Children.toArray(children)` and matches on
 * `child.type === Step` — matching on `displayName` would be brittle
 * against React tree cloning.
 */
export const __IS_STEP = Symbol.for('@dashforge/tw/Step');
(Step as unknown as { [key: symbol]: boolean })[__IS_STEP] = true;
