# Dashforge UI Component Policy

## Scope

This policy applies to all components inside:

libs/dashforge/ui

Especially components that:

- integrate with DashFormContext
- interact with DashFormBridge
- expose controlled value/onChange contracts

---

# 1. Mandatory Development Process (TDD First)

Every new component MUST follow this sequence:

1. Define intents (desired behaviors).
2. Write unit tests FIRST (TDD).
3. Implement the component.
4. Run typecheck + tests.
5. Only then refactor (if needed).

A component is NOT considered complete without unit tests.

---

# 2. Test Requirements

## 2.1 Unit Tests (Mandatory)

Every component must have a `*.unit.test.tsx` file.

Unit tests must:

- Use `renderWithBridge` + `createMockBridge` for form-bound components.
- NOT depend on react-hook-form unless explicitly an integration test.
- Cover all behavior branches.

Minimum required coverage:

### Plain Mode

- Component renders outside DashFormContext.
- Props are forwarded correctly.

### Bound Mode (if form-aware)

- Calls bridge.register(name, rules).
- Correctly binds value and onChange.
- Error gating logic works.
- Explicit props override bridge-derived state.

### Visibility (if applicable)

- visibleWhen returning false renders null.

---

## 2.2 Integration Tests (Minimal)

If needed, keep 1–2 integration tests:

- End-to-end behavior with real react-hook-form.
- Smoke only. No duplication of unit logic.

---

## 2.3 Characterization Tests

Allowed but optional.
Used to lock behavior that must never regress.

---

# 3. Type Safety Rules

Strict requirements:

- No `any` in runtime component code.
- No `as never`.
- No `@ts-expect-error` for subscription hacks.
- If a cast is unavoidable, it must:
  - Be local
  - Be documented
  - Not cascade

Generic constraints must be explicit (e.g. `T extends string | number`).

---

# 4. Hygiene Rules

Components must:

- Contain no console.log.
- Not rely on stale closures (always use latest value from bridge when needed).
- Not mutate props.
- Keep behavior identical when refactoring.

---

# 5. Acceptance Criteria Before Merge

Before merging any component:

- `npx nx run @dashforge/ui:typecheck` → 0 errors
- `npx nx run @dashforge/ui:test` → all tests pass
- 0 skipped tests
- No console.log
- No unsafe casts

---

# 6. Form-Connected Component Rules

For components connected to DashForm:

- Error display must follow Form Closure v1 rules:
  - Show errors only if touched OR submitCount > 0
  - Explicit props override bridge values
- Touch tracking must work for:
  - MUI components
  - Native HTML inputs
- Synthetic events must be shape-compatible with registration contract.

---

# 7. Refactor Discipline

When refactoring:

- Add or update tests FIRST.
- Never change behavior without updating tests.
- Do not refactor architecture unless explicitly requested.

---

# 8. Golden Rule

If tests do not exist, the component does not exist.
