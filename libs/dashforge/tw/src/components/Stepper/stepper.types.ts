import type { ReactNode } from 'react';
import type { Engine } from '@dashforge/ui-core';
import type { AccessRequirement } from '@dashforge/rbac';
import type { StepperVariants } from './stepper.variants.js';

/**
 * The lifecycle state of a single step within the visible sequence.
 *
 * - `pending`   — step comes AFTER the current step (not yet visited).
 * - `current`   — the step the user is on right now.
 * - `completed` — step was visited AND the consumer has advanced past it
 *                 (implies `visitedSteps.has(step.name)` AND it is not
 *                 the current step and is before it in the sequence).
 * - `invalid`   — the step has an entry in `errors`, populated after a
 *                 failed `goNext()` attempt (from `fields` trigger or
 *                 `isValid` callback returning false).
 * - `skipped`   — reserved for future non-linear skip semantics; unused
 *                 in v1.
 */
export type StepState =
  | 'pending'
  | 'current'
  | 'completed'
  | 'invalid'
  | 'skipped';

/**
 * Per-step error record surfaced on `useStep().errors`. Populated when
 * `<Step fields={...}>` fails its RHF `trigger` call, or when a step's
 * `isValid` callback returns `false`.
 *
 * The error routing pattern (Review step with clickable list) reads
 * this array to render jump-links back to the step that failed.
 */
export interface StepError {
  /** The step's `name` (unique key). */
  step: string;
  /** The step's `label` (for consumer-friendly display). */
  label: ReactNode;
  /** How the step became invalid. */
  reason: 'fields' | 'isValid';
  /** RHF `formState.errors` at the moment of the failed transition. */
  errors: Record<string, unknown> | null;
}

/**
 * Payload emitted to `<Stepper onStepInvalid>` when a `goNext()` attempt
 * fails validation.
 */
export interface OnStepInvalidPayload {
  /** The step that failed. */
  step: string;
  /** Its index within the visible sequence. */
  index: number;
  /** How it failed. */
  reason: 'fields' | 'isValid';
  /** RHF errors, if the failure came from `fields` trigger. */
  errors: Record<string, unknown> | null;
}

/**
 * The shape returned by `useStep()` — the consumer-facing API of the
 * current Stepper context. Available to any component rendered inside
 * a `<Stepper>` tree (typically the current `<Step>`'s children or a
 * custom footer).
 *
 * The hook is the ONLY public path to the Stepper's internal state —
 * consumers do NOT reach into the internal context directly.
 */
export interface UseStepReturn {
  /** The current step's `name`. */
  currentStep: string;
  /** Its index within the visible sequence. */
  currentStepIndex: number;
  /**
   * The filtered visible sequence, in declaration order. Steps whose
   * `visibleWhen` returned `false` are absent.
   */
  visibleSteps: Array<{ name: string; label: ReactNode }>;
  /**
   * Set of step names the user has visited so far. Reset by `reset()`,
   * pre-populated by `initialStep` (every step before the initial one
   * is treated as visited so a resumed wizard doesn't break the
   * `allowJumpTo="visited"` gate).
   */
  visitedSteps: Set<string>;
  /**
   * Errors recorded from the most recent failed `goNext()` calls. Cleared
   * for a step when it is re-visited AND successfully re-validated.
   */
  errors: StepError[];
  /**
   * Advance to the next step. Runs the current step's validation
   * (`fields` trigger via `bridge.trigger` + optional `isValid` callback
   * with AND semantics) and, on failure, records the error + fires
   * `onStepInvalid`. On success beyond the last step, fires
   * `onComplete()`.
   *
   * @returns `true` when the transition succeeded, `false` when blocked.
   */
  goNext: () => Promise<boolean>;
  /**
   * Go back one step. Does not run validation — pending steps between
   * the current and the target are marked pending again, but the
   * consumer's state (RHF values) is preserved.
   */
  goBack: () => void;
  /**
   * Jump directly to a step by name. Gated by `allowJumpTo`:
   *   - `'visited'` — allowed only if `visitedSteps.has(name)`.
   *   - `'none'`    — always rejected (silent no-op).
   * The Review-step error-routing pattern uses this to send the user
   * back to a failed step from the error summary.
   */
  goToStep: (name: string) => void;
  /**
   * Reset to `initialStep` (or the first visible step if `initialStep`
   * is unset). Clears `visitedSteps` and `errors`.
   */
  reset: () => void;
  /** `true` when the current step is the first in the visible sequence. */
  isFirstStep: boolean;
  /** `true` when the current step is the last in the visible sequence. */
  isLastStep: boolean;
  /**
   * `true` when `goNext()` would succeed as of this render. Consumers
   * can use this to render the Next button as `disabled`. Note this is
   * a SYNC readout (based on `bridge.getError(field)` for each `fields`
   * entry) — the `isValid` callback is NOT invoked here, since it may
   * be async and consumers wouldn't want a render-time promise.
   */
  canGoNext: boolean;
}

/**
 * Per-slot overrides — same shape as every other tw catalog entry.
 */
export interface StepperSlotProps {
  root?: { className?: string };
  strip?: { className?: string };
  step?: { className?: string };
  indicator?: { className?: string };
  labelGroup?: { className?: string };
  label?: { className?: string };
  helperText?: { className?: string };
  optionalTag?: { className?: string };
  connector?: { className?: string };
  content?: { className?: string };
  footer?: { className?: string };
}

/**
 * Subset of `<Stepper>` props theme-configurable via
 * `theme.components.Stepper.defaults` (Option C).
 */
export type StepperVariantProps = Pick<
  StepperVariants,
  'color' | 'size' | 'orientation' | 'labelPlacement'
>;

declare module '@dashforge/tw-tokens' {
  interface TWComponentDefaults {
    Stepper?: {
      defaults?: Partial<StepperVariantProps>;
      slotProps?: StepperSlotProps;
    };
  }
}

/**
 * Props for `<Step>` — a config-carrier child of `<Stepper>`.
 *
 * `<Step>` renders no DOM of its own; the parent `<Stepper>` walks the
 * children, reads each `<Step>`'s props, and drives rendering from
 * there. This mirrors the MUI / Chakra "compound children as config"
 * pattern (`<Tabs><Tab /><Tab /></Tabs>`).
 */
export interface StepProps {
  /**
   * Unique step key. Also used by `visitedSteps`, `goToStep`, `errors`,
   * and `initialStep`. Required — every step must have a distinct name.
   */
  name: string;

  /** Short label rendered next to (or below) the indicator dot. */
  label: ReactNode;

  /**
   * Secondary line rendered under the label. Optional.
   * Common uses: "2 min", "Enter card info", "Optional".
   */
  helperText?: ReactNode;

  /**
   * Custom icon rendered inside the indicator dot for the `pending` and
   * `current` states. Not shown when `completed` (a check mark takes
   * over) or `invalid` (an alert-triangle icon takes over).
   *
   * MUI-parity — an escape hatch for domain-specific dots
   * (`<Eye />` on a Review step, `<Cog />` on a Settings step).
   */
  icon?: ReactNode;

  /**
   * Marks the step as optional. `true` renders a default "Optional"
   * italic caption below the label; passing a ReactNode substitutes the
   * caption (`optional={<span>Skip if remote</span>}`). MUI-parity.
   *
   * NOTE: `optional` is display-only — it does NOT skip validation. A
   * step that should be skippable at the flow level should use
   * `visibleWhen` to hide itself, not `optional`.
   */
  optional?: boolean | ReactNode;

  /**
   * List of RHF field names to validate on `goNext()`. Runs
   * `bridge.trigger(fields)` and blocks the transition if any field
   * fails. Combined with `isValid` via **AND** semantics: both must
   * pass for the step to be considered valid.
   *
   * Requires a wrapping `<DashForm>` — outside a form context this prop
   * is a no-op (dev-warn).
   */
  fields?: string[];

  /**
   * Custom validation callback with AND-semantics against `fields`.
   * Runs AFTER `fields` (only if `fields` passes). Return `false` (sync
   * or async) to block the transition.
   *
   * Use for domain rules that can't be expressed as RHF field
   * validators (e.g., "at least one item in the cart", "the payment
   * gateway acknowledged the pre-auth").
   */
  isValid?: () => boolean | Promise<boolean>;

  /**
   * Reactive visibility predicate — catalog-uniform closure. Steps
   * whose predicate returns `false` are excluded from `visibleSteps`,
   * skipped by `goNext()` / `goBack()`, and hidden from the indicator
   * strip. This is the primary hook for dynamic step composition
   * (e.g., a "Legal address" step that only shows for EU customers).
   */
  visibleWhen?: (engine: Engine) => boolean;

  /** RBAC gate — hides or disables the step. */
  access?: AccessRequirement;

  /** The step's content — rendered inside the `content` slot when active. */
  children?: ReactNode;
}

/**
 * Props for `<Stepper>` — the compound parent.
 *
 * @example Linear wizard with form-driven validation
 * ```tsx
 * <DashForm defaultValues={{ email: '', card: '' }}>
 *   <Stepper name="cardActivation" onComplete={handleActivate}>
 *     <Step name="account" label="Account" fields={['email']}>
 *       <TextField name="email" label="Email" />
 *     </Step>
 *     <Step name="card" label="Card details" fields={['card']}>
 *       <TextField name="card" label="Card number" />
 *     </Step>
 *     <Step name="review" label="Review">
 *       <ReviewPanel />
 *     </Step>
 *   </Stepper>
 * </DashForm>
 * ```
 *
 * @example Dynamic step with `visibleWhen`
 * ```tsx
 * <Step
 *   name="contract"
 *   label="Contract"
 *   visibleWhen={(engine) => engine.get('activation') === 'deferred'}
 * >
 *   ...
 * </Step>
 * ```
 */
export interface StepperProps {
  /** Optional identifier — used for logging / test IDs. */
  name?: string;

  /**
   * `<Step>` children. Non-`<Step>` children are dev-warned and
   * ignored — the parent only recognizes its own compound child type.
   */
  children: ReactNode;

  /**
   * Name of the step to render on mount. Every step declared BEFORE
   * `initialStep` in the visible sequence is marked as visited (so
   * `allowJumpTo="visited"` allows the user to walk back through them).
   *
   * Common uses: resuming an interrupted wizard from persistent state,
   * deep-linking to a specific step from a URL query.
   *
   * If the name doesn't match any visible step, falls back to the first
   * visible step and dev-warns.
   */
  initialStep?: string;

  /**
   * Controls the `goToStep` (indicator-click) affordance:
   *   - `'visited'` (default) — the user can jump only to steps they've
   *                             already visited. Forward jumps are blocked
   *                             because they'd bypass validation.
   *   - `'none'`              — no jumping; navigation is strictly
   *                             `goNext` / `goBack`.
   *
   * @default 'visited'
   */
  allowJumpTo?: 'visited' | 'none';

  /**
   * Fires when the user advances past the LAST visible step via
   * `goNext()`. If this Stepper is wrapped in a `<DashForm>` and
   * `onComplete` is omitted, the DashForm's own submit handler runs
   * naturally on the consumer's Next button (typical pattern:
   * `<Button type="submit">Finish</Button>` on the last step). Optional.
   */
  onComplete?: () => void;

  /**
   * Fires on every successful transition — moving forward, moving back,
   * or jumping. Receives the previous step name, next step name, and
   * the direction.
   */
  onStepChange?: (
    prev: string,
    next: string,
    reason: 'next' | 'back' | 'jump'
  ) => void;

  /**
   * Fires when `goNext()` blocks because validation failed. Useful for
   * side-effects like scrolling the first invalid field into view or
   * emitting a Snackbar toast.
   */
  onStepInvalid?: (payload: OnStepInvalidPayload) => void;

  /** Colour intent applied to the indicator + connector fills. @default 'primary' */
  color?: StepperVariants['color'];
  /** Density knob (indicator diameter + label size). @default 'md' */
  size?: StepperVariants['size'];
  /** `horizontal` (default) or `vertical` strip layout. @default 'horizontal' */
  orientation?: StepperVariants['orientation'];
  /**
   * `end` (label next to indicator, default) or `below` (label under
   * the indicator, MUI `alternativeLabel` semantics). Horizontal only —
   * ignored on `orientation='vertical'`.
   * @default 'end'
   */
  labelPlacement?: StepperVariants['labelPlacement'];

  /** Reactive visibility predicate for the whole Stepper. */
  visibleWhen?: (engine: Engine) => boolean;
  /** RBAC gate for the whole Stepper. */
  access?: AccessRequirement;

  /** Utility-class shortcut for `slotProps.root.className`. */
  sx?: string;
  /** Per-slot overrides. */
  slotProps?: StepperSlotProps;
  /** `data-testid` on the root wrapper. */
  testId?: string;
}
