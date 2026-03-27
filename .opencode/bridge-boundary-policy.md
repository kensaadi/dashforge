# Dashforge Bridge Boundary Policy

## Scope

Applies to:

- DashFormBridge
- DashFormProvider
- FieldRegistration
- All form-connected UI components

The bridge is the most critical boundary in Dashforge.
No unsafe patterns are allowed here.

---

# 1. Architectural Principle

HTTP = state  
Bridge = orchestration  
UI = rendering

The bridge must:

- Never leak react-hook-form internals
- Never expose raw RHF types
- Never propagate unsafe casts
- Never return `as never`
- Never use cascading type assertions

---

# 2. Type Safety Rules (Non-Negotiable)

Forbidden patterns:

- `as never`
- `as any`
- `Record<string, any>` in public contracts
- index signatures like `[key: string]: any`
- cascading cast on return values

Allowed:

- Narrowing unknown via runtime type guards
- Explicit interfaces
- Explicit generic constraints

All boundary types must be explicit.

---

# 3. Event Handling Contract

All synthetic events passed to registration must:

- Match minimal event-like shape
- Contain:
  - target.name
  - target.value
- Avoid relying on DOM constructors when possible

Prefer:

{
target: {
name,
value
},
type: 'change'
}

Over:

new FocusEvent(...)

Synthetic events must be runtime-safe.

---

# 4. Registration Contract Rules

FieldRegistration must:

- Explicitly list all allowed properties
- Not include index signatures
- Not allow unknown props

Example:

interface FieldRegistration {
name: string;
onChange: (event: EventLike) => void;
onBlur?: (event: EventLike) => void;
ref?: (element: unknown) => void;
}

No permissive typing allowed.

---

# 5. Touch Tracking Rules

Touch logic must:

- Work for MUI components
- Work for native HTML elements
- Always use latest value from bridge
- Avoid stale closures

If component supports both MUI and native modes,
handlers must branch safely and explicitly.

---

# 6. Value Source of Truth

The bridge is the source of truth for:

- current value
- touched state
- error state

Components must not store duplicated state.

Always prefer:

bridge.getValue(name)

over captured variables.

---

# 7. Refactor Discipline

When modifying bridge logic:

1. Add characterization tests first.
2. Verify typecheck.
3. Verify all form components.
4. Ensure no behavior drift.

Bridge refactors require explicit approval.

---

# 8. Stability Rule

The bridge is considered "core infrastructure".

Changes here must be:

- Minimal
- Fully tested
- Behavior preserving
- Explicitly justified

---

# Golden Rule

If the bridge becomes unsafe, the entire framework becomes unsafe.
