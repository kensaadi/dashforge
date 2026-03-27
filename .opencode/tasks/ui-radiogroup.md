# Task

Create a new RadioGroup component in @dashforge/ui following the UI Component Policy and Bridge Boundary Policy.
TDD-first is mandatory.

# Application / Package

Dashforge - libs/dashforge/ui

# Component Name

RadioGroup

# Target Directory

libs/dashforge/ui/src/components/RadioGroup/

# Files to create

- Component:
  - libs/dashforge/ui/src/components/RadioGroup/RadioGroup.tsx
- Unit tests:
  - libs/dashforge/ui/src/components/RadioGroup/RadioGroup.unit.test.tsx

(Optional, only if needed)

- Integration smoke tests:
  - libs/dashforge/ui/src/components/RadioGroup/RadioGroup.test.tsx

# Component API

- name: string (required)
- options: Array<{ value: string; label: React.ReactNode; disabled?: boolean }> (required)
- rules?: unknown
- visibleWhen?: (engine: Engine) => boolean
- label?: React.ReactNode (optional group label)
- helperText?: string
- error?: boolean
- Forward remaining props to MUI RadioGroup / FormControlLabel / Radio as appropriate.
- Prop precedence:
  - Explicit props override bridge-derived state (value, error, helperText).

# Scope

The component must:

- Follow UI Component Policy
- Follow Bridge Boundary Policy (form-connected)
- Support plain mode (outside DashForm)
- Support bound mode (inside DashForm)
- Forward MUI props correctly
- Respect prop precedence (explicit props override bridge values)
- Implement Form Closure v1 error gating (touched OR submitCount > 0), same behavior as Switch/Checkbox
- Support visibleWhen via useEngineVisibility (plain mode predicate must work)

# Step 1 – Define Intents (Tests First)

Write unit tests first in:

libs/dashforge/ui/src/components/RadioGroup/RadioGroup.unit.test.tsx

Tests must cover:

## Intent A — Plain mode

1. Renders outside DashFormContext.
2. Renders provided options and allows selecting an option.
3. Forwards `value` and `onChange` correctly to MUI RadioGroup.
4. No bridge usage (no register/getValue/setValue).
5. If `helperText` is provided, it renders FormHelperText (and respects `error` prop).

## Intent B — Bound mode

1. Calls bridge.register(name, rules).
2. `value` binds from bridge.getValue(name) (default '' if undefined).
3. Selecting an option calls bridge.setValue(name, nextValue).
4. Calls registration.onChange with an event-like shape including:
   - target.name
   - target.value (string)
5. Prop precedence:
   - explicit `value` prop overrides bridge.getValue(name)

## Intent C — Error gating (Form Closure v1)

1. Bridge error message shows only when touched OR submitCount > 0.
2. Explicit `error` / `helperText` props override bridge-derived state.

## Intent D — Visibility

1. visibleWhen false => renders null in plain mode:
   - visibleWhen={() => false} must render null.

No implementation until unit tests exist.

# Step 2 – Implement Component

Create:

libs/dashforge/ui/src/components/RadioGroup/RadioGroup.tsx

Rules:

- No console.log
- No `as never`
- No cascading casts
- No `any` in runtime code
- No index signatures in public contracts
- Avoid stale closures (always use latest bridge value)
- Bound mode must be immediate (no delayed UI updates)

Implementation outline (follow Switch/Checkbox patterns):

- Read bridge from DashFormContext.
- Subscribe to bridge versions (error/touched/values/submitCount) as needed.
- Compute isVisible via useEngineVisibility(engine, visibleWhen); return null early.
- Bound mode:
  - registration = bridge.register(name, rules)
  - autoValue = bridge.getValue(name) ?? ''
  - resolvedValue = props.value ?? autoValue
  - compute gated error/helperText (touched || submitCount > 0)
  - onChange:
    - update bridge.setValue(name, nextValue) first
    - call registration.onChange(syntheticEvent with target.name/target.value)
    - call user onChange last
  - onBlur: call registration.onBlur with event-like shape
- Plain mode:
  - render MUI RadioGroup with forwarded props
  - render helperText if provided (FormHelperText)

# Step 3 – Minimal Integration (Optional)

If needed, add 1–2 smoke tests. No duplication of unit logic.

# Verification

Run and report:

npx nx run @dashforge/ui:typecheck
npx nx run @dashforge/ui:test

# Acceptance Criteria

- RadioGroup component exists and matches architecture of Switch/Checkbox
- Unit tests cover all intents and pass
- Typecheck passes with zero errors
- 0 skipped tests
- No unsafe casts
- Behavior documented via tests
- Summary of changes provided
