# Task

Create a new NumberField component in @dashforge/ui following the UI Component Policy and Bridge Boundary Policy.
TDD-first is mandatory.

# Application / Package

Dashforge - libs/dashforge/ui

# Component Name

NumberField

# Target Directory

libs/dashforge/ui/src/components/NumberField/

# Files to create

- Component:
  - libs/dashforge/ui/src/components/NumberField/NumberField.tsx
- Unit tests:
  - libs/dashforge/ui/src/components/NumberField/NumberField.unit.test.tsx

(Optional, only if needed)

- Integration smoke tests:
  - libs/dashforge/ui/src/components/NumberField/NumberField.test.tsx

# Component API

- name: string (required)
- rules?: unknown
- visibleWhen?: (engine: Engine) => boolean
- helperText?: string
- error?: boolean
- label?: React.ReactNode (optional)
- Forward remaining props to MUI TextField (type="number") or MUI OutlinedInput-based TextField.
- Prop precedence:
  - Explicit props override bridge-derived state (value, error, helperText).

Value policy (MUST be explicit and tested):

- Bound-mode storage type: number | null
- UI input display:
  - number -> String(number)
  - null/undefined -> '' (empty string)
- On user input:
  - '' -> setValue(name, null)
  - valid number -> setValue(name, parsedNumber)
- Parsing:
  - Use Number(...) and Number.isFinite(...) (no locale parsing)
  - Do not allow NaN into the bridge.

# Scope

The component must:

- Follow UI Component Policy
- Follow Bridge Boundary Policy (form-connected)
- Support plain mode (outside DashForm)
- Support bound mode (inside DashForm)
- Forward MUI props correctly
- Respect prop precedence (explicit props override bridge values)
- Implement Form Closure v1 error gating (touched OR submitCount > 0)
- Support visibleWhen via useEngineVisibility (plain mode predicate must work)
- Avoid delayed UI updates and stale closures

# Step 1 – Define Intents (Tests First)

Write unit tests first in:

libs/dashforge/ui/src/components/NumberField/NumberField.unit.test.tsx

Tests must cover:

## Intent A — Plain mode

1. Renders outside DashFormContext as a number input.
2. Forwards `value` and `onChange` correctly.
3. visibleWhen false => renders null (plain mode).
4. Renders helperText and respects explicit error prop.

## Intent B — Bound mode

1. Calls bridge.register(name, rules).
2. Binds value from bridge.getValue(name):
   - number => input.value is the number string
   - null/undefined => input.value is ''
3. On change:
   - typing "12" => bridge.setValue(name, 12)
   - clearing input to '' => bridge.setValue(name, null)
4. Calls registration.onChange with event-like shape including:
   - target.name
   - target.value (string from the input, i.e. '12' or '')
5. Prop precedence:
   - explicit `value` prop overrides bridge value (even in bound mode)

## Intent C — Error gating (Form Closure v1)

1. Bridge error message shows only when touched OR submitCount > 0.
2. Explicit `error` / `helperText` props override bridge-derived state.

## Intent D — Touch tracking

1. onBlur marks touched via registration.onBlur (event-like shape with target.name + target.value string)

No implementation until unit tests exist.

# Step 2 – Implement Component

Create:

libs/dashforge/ui/src/components/NumberField/NumberField.tsx

Rules:

- No console.log
- No `as never`
- No cascading casts
- No `any` in runtime code
- No index signatures in public contracts
- Avoid stale closures (always use latest bridge value)
- Update bridge first in onChange

Implementation outline (follow TextField/Switch/RadioGroup patterns):

- Read bridge from DashFormContext.
- Subscribe to bridge versions (error/touched/values/submitCount).
- Compute isVisible via useEngineVisibility(engine, visibleWhen); return null early.
- Use MUI TextField (recommended) with inputProps for min/max/step if provided.
- Bound mode:
  - registration = bridge.register(name, rules)
  - autoValue = bridge.getValue(name) -> number | null | undefined
  - autoInputValue = autoValue == null ? '' : String(autoValue)
  - resolvedInputValue = props.value ?? autoInputValue
    - If props.value is a number: String(props.value)
    - If props.value is '' (string) allow it (controlled empty)
  - onChange:
    - read raw = event.target.value (string)
    - if raw === '' => bridge.setValue(name, null)
    - else parse = Number(raw); if finite => bridge.setValue(name, parse) else do not write to bridge
    - call registration.onChange with synthetic event containing target.name + target.value = raw
    - call user onChange last
  - onBlur:
    - call registration.onBlur with synthetic event containing target.name + target.value = current raw string
- Plain mode: forward props as standard MUI TextField number input.

# Step 3 – Export

Update:

libs/dashforge/ui/src/index.ts

Export:

- NumberField
- NumberFieldProps

# Verification

Run and report:

npx nx run @dashforge/ui:typecheck
npx nx run @dashforge/ui:test

# Acceptance Criteria

- NumberField component exists and matches architecture of Switch/RadioGroup
- Unit tests cover all intents and pass
- Typecheck passes with zero errors
- 0 skipped tests
- No unsafe casts
- Behavior documented via tests
- Summary of changes provided
