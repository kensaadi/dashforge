# Task

Create a new UI component following Dashforge UI Component Policy and Bridge Boundary Policy.
TDD-first is mandatory.

# Application

Dashforge – libs/dashforge/ui

# Component Name

<ComponentName>

# Target Directory

libs/dashforge/ui/src/components/<ComponentName>/

# Scope

The component must:

- Follow UI Component Policy
- Follow Bridge Boundary Policy (if form-connected)
- Support plain mode (outside DashForm)
- Support bound mode (inside DashForm) if applicable
- Forward MUI props correctly
- Respect prop precedence (explicit props override bridge values)

# Step 1 – Define Intents (Tests First)

Write unit tests first in:

libs/dashforge/ui/src/components/<ComponentName>/<ComponentName>.unit.test.tsx

Tests must cover:

## Intent A – Plain Mode

- Renders outside DashFormContext
- Props forwarded correctly
- No bridge usage

## Intent B – Bound Mode (if form-aware)

- Calls bridge.register(name, rules)
- Binds value from bridge.getValue(name)
- Calls bridge.setValue on change
- Error gating works
- Explicit props override bridge values

## Intent C – Visibility (if visibleWhen supported)

- Returns null when visibleWhen returns false

No implementation until unit tests exist.

# Step 2 – Implement Component

Create:

libs/dashforge/ui/src/components/<ComponentName>/<ComponentName>.tsx

Rules:

- No console.log
- No `as never`
- No cascading casts
- No `any` in runtime code
- No index signatures in public contracts
- Use explicit generic constraints if needed
- Avoid stale closures (always use latest bridge value)

# Step 3 – Minimal Integration (Optional)

If necessary, add 1–2 smoke tests using real react-hook-form.
No duplication of unit logic.

# Verification

Run:

npx nx run @dashforge/ui:typecheck
npx nx run @dashforge/ui:test

# Acceptance Criteria

- All tests pass
- 0 skipped tests
- Typecheck passes
- No unsafe casts
- Behavior documented via tests
- Summary of changes provided
