# Task

Implement `Textarea` component for Dashforge UI with full policy compliance (TDD-first).

# Context

We are in Dashforge Nx monorepo.
Package: `@dashforge/ui`
We already implemented and stabilized these components with the standard patterns:

- TextField, Checkbox, Switch, RadioGroup, NumberField
  Policies to respect:
- UI Component Policy (no skipped tests, no console.log, TDD-first)
- Bridge Boundary Policy (no unsafe casts, no `as any`, no `as never`, no cascading casts)
- Form Closure v1 error gating: show auto errors only when field touched OR submitCount > 0
- Prop precedence: explicit props override bridge-derived values
  Visibility:
- `visibleWhen` supported via `useEngineVisibility(engine, visibleWhen)`
- Plain mode must support `visibleWhen={() => false}` rendering `null` (engine can be missing)

Textarea should be basically a `TextField` with `multiline` and `minRows` default.

# Scope

Create the component + unit tests + export.
No storybook required.
No integration tests required.

# Goal

Add a production-ready `Textarea` component that works in:

1. Plain mode (outside DashFormContext): behaves like MUI TextField multiline.
2. Bound mode (inside DashFormContext): uses bridge.register/getValue/setValue and subscriptions for reactive updates.

# Rules

- Application name: `@dashforge/ui`
- Folder name: `libs/dashforge/ui/src/components/Textarea/`
- Filenames:
  - `libs/dashforge/ui/src/components/Textarea/Textarea.tsx`
  - `libs/dashforge/ui/src/components/Textarea/Textarea.unit.test.tsx`
- Export from: `libs/dashforge/ui/src/index.ts`
- Must follow the same approach used in `TextField`, `NumberField`, `Switch`.
- Must not introduce new dependencies.
- Must keep `visibleWhen` in unit tests only for plain mode (no engine reactivity tests).

# Constraints

- 0 skipped tests.
- Typecheck must pass.
- No console.log.
- No unsafe casts.
- Event handling must be safe (extract target.value via guarded checks where necessary).
- In bound mode: call order for change should be:
  1. `registration.onChange(syntheticEvent)`
  2. `bridge.setValue(name, newValue)`
  3. call user `onChange` if provided
- Touch tracking: on blur call `registration.onBlur(syntheticEvent)` and then user `onBlur`.

# Output

1. Implement `Textarea` component:

   - Props:
     - `name: string` required
     - `rules?: unknown`
     - `visibleWhen?: (engine: Engine) => boolean`
     - Inherit from MUI TextField props but omit `name` (and do NOT force type)
   - Behavior:
     - Always `multiline`
     - Default `minRows={3}` (but allow override via props)
   - Plain mode:
     - Uses `TextField` directly
     - Uses explicit `value`/`onChange` if provided
     - `visibleWhen={() => false}` returns null
   - Bound mode:
     - `bridge.register(name, rules)`
     - value binding from `bridge.getValue(name)` (string | undefined | null -> '')
     - Prop precedence: explicit `value` overrides bridge value (including empty string)
     - Error gating:
       - `autoErr = bridge.getError(name)`
       - `autoTouched = bridge.isTouched(name)`
       - `submitCount = bridge.submitCount`
       - show autoErr message only if touched OR submitCount > 0
       - explicit `error` / `helperText` override auto
       - if explicit `error === false`, suppress auto error message
     - subscriptions: access (void) `bridge.errorVersion`, `bridge.touchedVersion`, `bridge.dirtyVersion`, `bridge.submitCount`, `bridge.valuesVersion`

2. Unit tests (Vitest + RTL) in `Textarea.unit.test.tsx`:

   - Intent A: Plain mode
     - renders multiline input
     - forwards value/onChange
     - renders helperText
     - respects error prop (helper text has Mui-error)
     - visibleWhen false renders null (plain mode)
   - Intent B: Bound mode
     - binds to bridge value
     - defaults '' when bridge value undefined/null
     - user typing updates bridge value (string)
     - calls touched on blur (tab away)
     - prop precedence: explicit value overrides bridge value
   - Intent C: Error gating
     - no error when not touched & submitCount 0
     - error when touched
     - error when submitCount > 0
     - explicit error overrides bridge error (error={false} hides it)
     - explicit helperText overrides bridge error message

3. Ensure exports updated in `libs/dashforge/ui/src/index.ts`:

   - `export { Textarea } from './components/Textarea/Textarea';`
   - `export type { TextareaProps } from './components/Textarea/Textarea';`

4. Provide final verification notes:
   - `pnpm nx test @dashforge/ui`
   - `pnpm nx typecheck @dashforge/ui`
