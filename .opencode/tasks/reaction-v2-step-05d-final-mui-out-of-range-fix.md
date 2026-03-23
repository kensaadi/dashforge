# Task

Implement the final focused fix for remaining MUI Select out-of-range warnings by covering:

1. plain/uncontrolled Select usage without explicit value prop
2. runtime Select usage during loading state

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Previous fixes already covered:

- RHF/bridge unresolved path
- controlled/plain prop-driven unresolved path

However, warnings still occur in two remaining cases:

1. Plain/uncontrolled Select usage:

   - Select passes \_\_selectAvailableValues
   - TextField standalone sanitization only runs when 'value' in rest
   - docs/demo examples without explicit value/defaultValue still pass through unresolved/undefined display values to MUI

2. Runtime Select loading state:
   - Select only passes availableValues when runtime.status === 'ready'
   - during loading, display sanitization is skipped
   - MUI may still emit out-of-range warnings

This task must close those remaining gaps without changing the approved unresolved-value policy.

# Scope

## In scope

1. Fix standalone/plain Select sanitization when no explicit value prop is provided
2. Fix runtime Select sanitization during loading state
3. Preserve all previously approved unresolved-value behavior
4. Add focused tests for the remaining warning scenarios
5. Eliminate the remaining MUI out-of-range warnings in these cases

## Out of scope

Do NOT implement in this task:

- reconciliation
- automatic value reset
- changes to unresolved-value warning policy
- new UI messaging
- changes to runtime reaction semantics
- broad Select/TextField refactors
- visibleWhen changes
- docs redesign

# Goal

Ensure MUI Select no longer emits out-of-range warnings in the remaining unresolved cases, while preserving:

- RHF value unchanged
- controlled value source unchanged
- unresolved UI visually empty
- no reconciliation
- no automatic reset

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not mutate RHF value.
5. Do not mutate controlled prop value.
6. Keep Select visually empty when unresolved.
7. Do not inject fake/hidden options.
8. Do not silence console globally.
9. Keep the implementation surgical.
10. All code comments and JSDoc must be in English.

# Constraints

## Behavioral constraints

### Plain/uncontrolled standalone path

When Select is used without explicit value/defaultValue:

- the display layer must still provide MUI with a safe value
- avoid passing unresolved/undefined display value that triggers out-of-range warning
- preserve existing uncontrolled/plain behavior as much as possible

### Runtime loading path

During runtime loading:

- avoid passing unresolved raw value to MUI if it causes out-of-range warning
- keep current policy intact
- field may still be disabled during loading
- no new loading UI messaging

## Technical constraints

The fix must remain at the display/render layer.

Do NOT:

- mutate source values
- change runtime datasets
- alter reaction logic
- add broad abstractions

## Testing constraints

Add focused tests that prove:

1. plain/uncontrolled Select without explicit value no longer triggers MUI out-of-range warning
2. standalone Select still behaves correctly with explicit value/defaultValue
3. runtime loading path no longer triggers MUI out-of-range warning
4. previously fixed RHF/controlled unresolved behavior remains intact
5. no reconciliation or reset behavior is introduced

# Output

Produce the following:

## 1. Implementation

Add the minimal fix required to close the remaining MUI warning paths.

## 2. File-by-file report

At the end, provide a report with:

- application name
- folder name
- filename
- what changed
- why it changed

## 3. API summary

List any public/internal APIs changed or added in this step.

## 4. Validation

Run and report:

- typecheck
- relevant tests
- new focused tests for the remaining MUI warning cases

## 5. Notes

Explicitly confirm:

- no reconciliation logic was introduced
- no automatic value reset was introduced
- RHF value remains unchanged
- controlled value source remains unchanged
- unresolved Select remains visually empty
- remaining MUI out-of-range warnings are eliminated

# Final instruction

Do not go beyond this step.

This is a focused warning-fix task only.
