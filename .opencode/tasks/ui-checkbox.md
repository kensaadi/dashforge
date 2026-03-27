# Task

Create a new Checkbox component in @dashforge/ui following the UI Component Policy and Bridge Boundary Policy.
TDD-first is mandatory.

# Application / Package

Dashforge - libs/dashforge/ui

# Files to create

- Component:
  - libs/dashforge/ui/src/components/Checkbox/Checkbox.tsx
- Unit tests:
  - libs/dashforge/ui/src/components/Checkbox/Checkbox.unit.test.tsx

(Optional, only if needed)

- Integration smoke tests:
  - libs/dashforge/ui/src/components/Checkbox/Checkbox.test.tsx

# Component API

- name: string (required)
- rules?: unknown
- visibleWhen?: (engine: Engine) => boolean
- label?: React.ReactNode
- Forward remaining props to MUI Checkbox / FormControlLabel as appropriate.

# Intents (write unit tests FIRST)

## Intent A — Plain mode

1. Renders outside DashFormContext.
2. Accepts `checked` and fires `onChange` when toggled.

## Intent B — Bound mode

1. Calls bridge.register(name, rules).
2. `checked` binds from bridge.getValue(name) (default false if undefined).
3. Toggling updates bridge.setValue(name, checked).
4. Calls registration.onChange with an event-like shape including target.name and target.checked (and/or target.value as boolean).

## Intent C — Error gating (Form Closure v1)

1. Bridge errors show only when touched OR submitCount > 0.
2. Explicit props override bridge-derived state (helperText/error).

## Intent D — Visibility

1. visibleWhen false => renders null.

# Rules / Constraints

- No console.log
- No `any` in runtime code
- No `as never`
- No ts-expect-error hacks
- 0 skipped tests

# Verification

Run and report:

- npx nx run @dashforge/ui:typecheck
- npx nx run @dashforge/ui:test

# Acceptance Criteria

- Checkbox component exists and follows architecture of TextField/Select
- Unit tests cover all intents and pass
- Typecheck passes with zero errors
- 0 skipped tests
