import FormGroup from '@mui/material/FormGroup';
import type { FormGroupProps as MuiFormGroupProps } from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import Checkbox from '@mui/material/Checkbox';
import { useContext, useEffect, useRef } from 'react';
import type { AccessRequirement } from '@dashforge/rbac';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import { useDashFieldMeta } from '@dashforge/forms';
import type { FieldRegistration, Engine } from '@dashforge/ui-core';
import { useAccessState, useAccessStates } from '../../hooks/useAccessState';
import { renderLabelWithTooltip } from '../_internal/fieldTooltip';
import type { FieldTooltipProp } from '../_internal/fieldTooltip';

export interface CheckboxGroupOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  /**
   * RBAC access control requirement for this specific option.
   *
   * - `onUnauthorized: 'hide'` → hidden, UNLESS it is currently checked
   *   (hiding a checked box would leave a value in the payload the user
   *   cannot see or remove)
   * - `onUnauthorized: 'disable'` → visible but not toggleable
   * - `onUnauthorized: 'readonly'` → disabled; a checkbox has no true
   *   readonly state, so this is the honest fallback
   *
   * Group-level access takes precedence over option-level access.
   */
  access?: AccessRequirement;
}

export interface CheckboxGroupProps
  extends Omit<MuiFormGroupProps, 'name' | 'onChange' | 'children'> {
  name: string;
  options: CheckboxGroupOption[];
  label?: React.ReactNode;
  rules?: unknown;
  helperText?: string;
  error?: boolean;
  /**
   * Marks the group as required in the UI. Passes through to the wrapping
   * `<FormControl required>`, which renders the asterisk and sets
   * `aria-required` on the group. Presentational only: enforcement at
   * submit time still needs `rules={{ required: … }}`, same as
   * `<RadioGroup>`. See README-BUG.md § BUG 20.
   */
  required?: boolean;
  /** Controlled value. The field stores an array; `[]` means nothing checked. */
  value?: string[];
  /** Fires with the NEXT array, not with the toggled option. */
  onChange?: (value: string[]) => void;
  visibleWhen?: ((engine: Engine) => boolean) | undefined;
  /**
   * RBAC access control requirement for the whole group.
   *
   * - `onUnauthorized: 'hide'` → the group returns null
   * - `onUnauthorized: 'disable'` → visible, nothing toggleable
   * - `onUnauthorized: 'readonly'` → disabled, same fallback as the options
   *
   * Combines with an explicit `disabled` via OR.
   */
  access?: AccessRequirement;
  /** Disables every option in the group. */
  disabled?: boolean;
  /** Optional label-help tooltip (ⓘ in the label row). */
  tooltip?: FieldTooltipProp;
}

/**
 * `<CheckboxGroup>` — several checkboxes bound to ONE field that stores a
 * `string[]`.
 *
 * The third piece of README-BUG § BUG 19. `<Autocomplete multiple>` and
 * `<Select multiple>` cover the long-list cases; this is the small-set
 * case, where showing every option at once beats hiding them behind a
 * popover.
 *
 * It is `<RadioGroup>` with array storage, and deliberately so: same bridge
 * wiring, same RBAC model, same visibility and unregister semantics, so
 * there is one shape to learn and one place where the family's behaviour
 * lives.
 *
 * Two behaviours worth knowing:
 *
 * - The field stores `[]` when nothing is checked, never `null` or `''`.
 *   A consumer reading the payload can always `.map` over it.
 * - An option gated to `hide` stays VISIBLE while it is checked, and is
 *   disabled instead. Hiding it would strand a value in the payload that
 *   the user can neither see nor clear.
 *
 * @example
 * ```tsx
 * <CheckboxGroup
 *   name="permissions"
 *   label="Permissions"
 *   options={[
 *     { value: 'read', label: 'Read' },
 *     { value: 'write', label: 'Write' },
 *     { value: 'admin', label: 'Admin', access: { resource: 'acl', action: 'grant', onUnauthorized: 'disable' } },
 *   ]}
 *   rules={{ required: 'Pick at least one' }}
 * />
 * ```
 */
export function CheckboxGroup(props: CheckboxGroupProps) {
  const {
    name,
    options,
    label,
    tooltip,
    rules,
    helperText: explicitHelperText,
    error: explicitError,
    required,
    visibleWhen,
    value: explicitValue,
    onChange: explicitOnChange,
    access,
    disabled: explicitDisabled,
    ...muiProps
  } = props;

  const bridge = useContext(DashFormContext);
  const engine = bridge?.engine;

  // Granular per-field subscription, same as the rest of the family.
  useDashFieldMeta(name);

  const groupAccessState = useAccessState(access);

  // ONE hook for every option. `options.map(useAccessState)` would tie
  // React's hook count to `options.length`, which is unsound as soon as the
  // options load async. See README-BUG.md § BUG 16.
  const optionAccessStates = useAccessStates(
    options.map((option) => option.access)
  );

  const isVisible = useEngineVisibility(engine, visibleWhen);

  // Release engine/RHF state on REAL unmount, and only when the form asked
  // to forget unmounted fields. See README-BUG.md § BUG 22.
  const unregisterRef = useRef({ bridge, name });
  unregisterRef.current = { bridge, name };
  const isMountedRef = useRef(false);
   
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      const { bridge: capturedBridge, name: capturedName } =
        unregisterRef.current;
      if (!capturedBridge?.shouldUnregister) return;
      queueMicrotask(() => {
        if (!isMountedRef.current) {
          capturedBridge?.unregister?.(capturedName);
        }
      });
    };
  }, []);

  // Every hook above, every early return below. Reordering breaks the rules
  // of hooks the moment `visibleWhen` or group access flips.
  if (!isVisible) return null;
  if (!groupAccessState.visible) return null;

  const groupEffectiveDisabled =
    Boolean(explicitDisabled) ||
    groupAccessState.disabled ||
    groupAccessState.readonly;

  /** Coerce whatever the field holds into the array this component owns. */
  const toArray = (raw: unknown): string[] =>
    Array.isArray(raw) ? (raw as string[]) : [];

  const processOptions = (currentValues: string[]) =>
    options
      .map((option, index) => {
        const optionAccessState = optionAccessStates[index];
        const isChecked = currentValues.includes(option.value);

        // A checked box stays on screen even when access says hide, or the
        // user is left with a value they cannot reach.
        if (!optionAccessState.visible && !isChecked) return null;

        const optionEffectiveDisabled =
          groupEffectiveDisabled ||
          Boolean(option.disabled) ||
          optionAccessState.disabled ||
          optionAccessState.readonly ||
          (!optionAccessState.visible && isChecked);

        return { ...option, effectiveDisabled: optionEffectiveDisabled, isChecked };
      })
      .filter((opt): opt is NonNullable<typeof opt> => opt !== null);

  /**
   * Toggle one option.
   *
   * Known values come out in the order the options were DECLARED, so the
   * payload does not drift with the clicking. Values the form holds that
   * are not in `options` are preserved and placed first, in the order they
   * were stored.
   *
   * That second half is not decoration. Rebuilding purely from `options`
   * reads naturally and silently drops anything the options list does not
   * know about: a value from a previous scope, or one stored before the
   * options finished loading. The user checks an unrelated box and a value
   * they never touched disappears from the payload. Worse, the UNCHECK
   * path is a plain filter and preserves it, so the two paths disagreed.
   *
   * Their position is unknowable — they have no seat in the declared order
   * — so they go in front rather than being interleaved on a guess.
   */
  const nextValues = (current: string[], value: string): string[] => {
    if (current.includes(value)) return current.filter((v) => v !== value);

    const declared = options.map((o) => o.value);
    const next = [...current, value];
    const unknown = next.filter((v) => !declared.includes(v));
    const known = declared.filter((v) => next.includes(v));
    return [...unknown, ...known];
  };

  const renderGroup = (
    processed: ReturnType<typeof processOptions>,
    onToggle: (value: string) => void,
    onBlur?: (event: React.FocusEvent<HTMLElement>) => void
  ) => (
    <FormGroup {...muiProps}>
      {processed.map((option) => (
        <FormControlLabel
          key={option.value}
          label={option.label}
          disabled={option.effectiveDisabled}
          control={
            <Checkbox
              name={name}
              value={option.value}
              checked={option.isChecked}
              onChange={() => onToggle(option.value)}
              onBlur={onBlur}
            />
          }
        />
      ))}
    </FormGroup>
  );

  // ─── Plain mode (no provider, or a bridge without `register`) ───────
  if (!bridge || !bridge.register) {
    const current = toArray(explicitValue);
    return (
      <FormControl error={explicitError} required={required}>
        {label && (
          <FormLabel>{renderLabelWithTooltip(label, tooltip)}</FormLabel>
        )}
        {renderGroup(processOptions(current), (value) =>
          explicitOnChange?.(nextValues(current, value))
        )}
        {explicitHelperText && (
          <FormHelperText>{explicitHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // ─── Bound mode ────────────────────────────────────────────────────
  const registration: FieldRegistration = bridge.register(name, rules);

  const autoValue = toArray(bridge.getValue(name));
  const resolvedValue =
    explicitValue !== undefined ? toArray(explicitValue) : autoValue;

  const autoErr = bridge.getError(name) ?? null;
  const autoTouched = bridge.isTouched(name) ?? false;
  const submitCount = bridge.submitCount ?? 0;

  // Form Closure v1: an error shows once the field was touched or the form
  // was submitted.
  const allowAutoError = autoTouched || submitCount > 0;

  const resolvedError =
    explicitError !== undefined
      ? explicitError
      : Boolean(autoErr) && allowAutoError;

  // BUG 17: while a validation message is showing it wins over the explicit
  // hint; the hint is the fallback for the no-error state.
  const autoMessage = allowAutoError ? autoErr?.message : undefined;
  const resolvedHelperText = autoMessage ?? explicitHelperText;

  const handleToggle = (value: string) => {
    const next = nextValues(resolvedValue, value);

    if (bridge.setValue) {
      bridge.setValue(name, next);
    }
    if (registration.onChange) {
      registration.onChange({
        target: { name, value: next },
        type: 'change',
      });
    }
    if (explicitOnChange) {
      explicitOnChange(next);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLElement>) => {
    if (registration.onBlur) {
      registration.onBlur({
        target: { name, value: toArray(bridge.getValue(name)) },
        type: 'blur',
      });
    }
    (muiProps as { onBlur?: (e: React.FocusEvent<HTMLElement>) => void })
      .onBlur?.(event);
  };

  return (
    <FormControl error={resolvedError} required={required}>
      {label && (
        // The tooltip is rendered in bound mode too. `<RadioGroup>` drops it
        // here and only honours it in plain mode, which is a wart worth not
        // copying.
        <FormLabel>{renderLabelWithTooltip(label, tooltip)}</FormLabel>
      )}
      {renderGroup(processOptions(resolvedValue), handleToggle, handleBlur)}
      {resolvedHelperText && (
        <FormHelperText>{resolvedHelperText}</FormHelperText>
      )}
    </FormControl>
  );
}
