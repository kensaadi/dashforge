# Task

Create a new Switch component in @dashforge/ui following the UI Component Policy and Bridge Boundary Policy.
TDD-first is mandatory.

# Application / Package

Dashforge - libs/dashforge/ui

# Component Name

Switch

# Target Directory

libs/dashforge/ui/src/components/Switch/

# Files to create

- Component:
  - libs/dashforge/ui/src/components/Switch/Switch.tsx
- Unit tests:
  - libs/dashforge/ui/src/components/Switch/Switch.unit.test.tsx

(Optional, only if needed)

- Integration smoke tests:
  - libs/dashforge/ui/src/components/Switch/Switch.test.tsx

# Component API

- name: string (required)
- rules?: unknown
- visibleWhen?: (engine: Engine) => boolean
- label?: React.ReactNode
- Forward remaining props to MUI Switch / FormControlLabel as appropriate.
- Prop precedence rule:
  - Explicit props override bridge-derived state (checked, error, helperText, etc.) when provided.

# Scope

The component must:

- Follow UI Component Policy
- Follow Bridge Boundary Policy (form-connected)
- Support plain mode (outside DashForm)
- Support bound mode (inside DashForm)
- Forward MUI props correctly
- Respect prop precedence (explicit props override bridge values)

# Step 1 – Define Intents (Tests First)

Write unit tests first in:

libs/dashforge/ui/src/components/Switch/Switch.unit.test.tsx

Tests must cover:

## Intent A — Plain mode

1. Renders outside DashFormContext.
2. Accepts `checked` and fires `onChange` when toggled.
3. Forwards props correctly to MUI Switch / FormControlLabel.
4. Does not call any bridge methods.

## Intent B — Bound mode

1. Calls bridge.register(name, rules).
2. `checked` binds from bridge.getValue(name) (default false if undefined).
3. Toggling updates bridge.setValue(name, checked).
4. Calls registration.onChange with an event-like shape including:
   - target.name
   - target.checked
   - (and target.value as boolean if your existing convention expects it)

## Intent C — Error gating (Form Closure v1)

1. Bridge errors show only when touched OR submitCount > 0.
2. Explicit props override bridge-derived error state:
   - If `error` / `helperText` props are provided, they win over bridge errors.

## Intent D — Visibility

1. visibleWhen false => renders null.

No implementation until unit tests exist.

# Step 2 – Implement Component

Create:

libs/dashforge/ui/src/components/Switch/Switch.tsx

Rules:

- No console.log
- No `as never`
- No cascading casts
- No `any` in runtime code
- No index signatures in public contracts
- Use explicit generic constraints if needed
- Avoid stale closures (always use latest bridge value)
- Bound mode behavior must be immediate (no delayed UI updates)

# Step 3 – Minimal Integration (Optional)

If necessary, add 1–2 smoke tests using real react-hook-form.
No duplication of unit logic.

# Verification

Run and report:

npx nx run @dashforge/ui:typecheck
npx nx run @dashforge/ui:test

# Acceptance Criteria

- Switch component exists and follows the architecture used by Checkbox/TextField/Select
- Unit tests cover all intents and pass
- Typecheck passes with zero errors
- 0 skipped tests
- No unsafe casts
- Behavior documented via tests
- Summary of changes provided
