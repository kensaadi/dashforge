# Task

Implement Autocomplete (freeSolo) component for @dashforge/ui with full TDD coverage and bridge integration.

# Context

We are completing the "form essential" component set in Dashforge UI. Autocomplete must follow the same architecture and policies as Switch / RadioGroup / NumberField / Textarea:

- Dual mode: plain mode (no DashFormContext) + bound mode (with DashFormContext bridge)
- Form Closure v1: error gating (show errors only when touched OR submitCount > 0)
- Visibility: visibleWhen predicate must work in plain mode too (use useEngineVisibility)
- Bridge is the source of truth in bound mode (unless explicit props override)

We want the Autocomplete in freeSolo mode.

# Scope

Create:

1. Component

- libs/dashforge/ui/src/components/Autocomplete/Autocomplete.tsx

2. Unit tests

- libs/dashforge/ui/src/components/Autocomplete/Autocomplete.unit.test.tsx

3. Exports

- libs/dashforge/ui/src/index.ts (export Autocomplete + AutocompleteProps)

# Goal

A production-ready Autocomplete component with:

- freeSolo enabled
- storage policy: bridge stores `string | null` (NEVER object)
- selecting an option stores `option.value`
- free typing stores the typed string
- clearing stores null
- prop precedence: explicit `value` / `error` / `helperText` override bridge-derived values
- strict policy compliance: no console.log, no skipped tests, no unsafe casts (no `as any`, no `as never`, no cascading casts)
- full suite passes: `nx run @dashforge/ui:test --run` and `nx run @dashforge/ui:typecheck`

# Rules

Follow Dashforge UI Component Policy + Bridge Boundary Policy:

- TDD-first: write tests before implementation
- No react-hook-form in tests; use renderWithBridge utilities
- Hooks always called unconditionally at top-level
- Ensure immediate UI updates by subscribing to bridge versions:
  - void bridge?.errorVersion
  - void bridge?.touchedVersion
  - void bridge?.dirtyVersion
  - void bridge?.submitCount
  - void bridge?.valuesVersion

Event handling order in bound mode (MUST):

1. registration.onChange(syntheticEvent)
2. bridge.setValue(name, nextValue)
3. user onChange callback (if provided)

Blur handling order (MUST):

1. registration.onBlur(syntheticEvent)
2. user onBlur (if provided)

# Constraints

Autocomplete requirements:

- MUI base component: @mui/material/Autocomplete + TextField for renderInput
- freeSolo = true
- options are objects: `{ value: string; label: React.ReactNode; disabled?: boolean }`
- Bridge stored value = `string | null`:
  - If stored string matches an option.value -> show that option
  - Else show the string as freeSolo input
- Support disabled options via MUI getOptionDisabled

API:
export interface AutocompleteOption {
value: string;
label: React.ReactNode;
disabled?: boolean;
}

export interface AutocompleteProps extends ... {
name: string;
options: AutocompleteOption[];
rules?: unknown;
visibleWhen?: (engine: Engine) => boolean;
label?: React.ReactNode;
helperText?: React.ReactNode;
error?: boolean;

// controlled storage value (string|null), explicit overrides bridge value
value?: string | null;

// provide a simplified callback
onChange?: (value: string | null) => void;
}

Error gating (Form Closure v1):

- Allow auto error ONLY if (isTouched(name) || submitCount > 0)
- resolvedError:
  - if explicit error prop present -> use it
  - else Boolean(autoErr) && allowAutoError
- resolvedHelperText:
  - if explicit helperText present -> use it
  - else if explicit error === false -> undefined (suppress bridge message)
  - else if allowAutoError -> autoErr?.message
  - else undefined

Visibility:

- const isVisible = useEngineVisibility(engine, visibleWhen)
- if !isVisible return null
- Must work in plain mode: visibleWhen={() => false} => renders null

# Output

Deliver:

1. Autocomplete.tsx implemented
2. Autocomplete.unit.test.tsx with comprehensive coverage (target ~18–24 tests)
3. index.ts export updated
4. Proof commands + results included in final message:
   - npx nx run @dashforge/ui:typecheck
   - npx nx run @dashforge/ui:test --run
     Include totals: passed tests, skipped tests (must be 0)

Test plan (minimum):
Intent A: Plain mode

- renders input with label
- selecting an option calls onChange with option.value
- freeSolo typing + Enter calls onChange with typed string
- clear sets value null (if controllable via onChange)
- respects helperText/error explicit
- visibleWhen false => null (plain mode)

Intent B: Bound mode

- registers and binds to bridge value (option.value)
- binds to unknown string as freeSolo text
- selecting option updates bridge value
- freeSolo typing + Enter updates bridge value
- clearing sets bridge value null
- prop precedence: explicit value overrides bridge
- touched on blur sets touched true

Intent C: Error gating

- no error shown when not touched and submitCount=0
- error shown when touched=true
- error shown when submitCount>0 even if touched=false
- explicit error=false suppresses bridge error message
- explicit helperText overrides bridge error text

Intent D: Visibility

- visibleWhen undefined => renders
- visibleWhen false in plain mode => null
  (Engine-reactive visibility is covered by integration tests, not unit tests)

Save this task file at:

- /dashforge/.opencode/task-autocomplete-freesolo.md
