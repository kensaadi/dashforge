# Task

Implement a focused fix for the MUI Select "out-of-range value" warning in unresolved-value scenarios, while preserving the approved Reactive V2 unresolved-value policy.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 unresolved-value behavior is already approved:

- RHF value remains unchanged
- unresolved Select renders visually empty
- no reconciliation
- no automatic reset
- no user-facing unresolved message
- dev-only Dashforge warning may still exist

However, MUI currently emits "out-of-range value" warnings because the Select receives a raw value that is not present in the rendered option list.

This fix must remove the MUI warning without changing the approved unresolved-value semantics.

# Scope

## In scope

1. Fix the MUI Select display value in unresolved scenarios
2. Preserve the underlying RHF value unchanged
3. Keep unresolved UI visually empty
4. Keep current Dashforge unresolved policy intact
5. Add focused tests for the warning-free unresolved case

## Out of scope

Do NOT implement in this task:

- reconciliation
- automatic value reset
- changes to unresolved warning policy
- changes to runtime reaction semantics
- new UI messaging
- changes to visibleWhen
- broad Select refactors

# Goal

Remove the MUI out-of-range warning by ensuring that the value passed to the MUI Select is safe for rendering, while the actual RHF value remains unchanged.

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not change the stored RHF value when unresolved.
5. Keep the Select visually empty when unresolved.
6. Do not introduce fake/hidden fallback options.
7. Do not silence console globally.
8. Keep the implementation surgical.
9. All code comments and JSDoc must be in English.

# Constraints

## Behavioral constraints

When the current RHF value does not match any rendered option:

- the real RHF value must remain unchanged
- the visual value passed to MUI must be a safe empty value (`''`) or equivalent neutral display value
- the rendered Select must appear empty
- the MUI out-of-range warning must no longer occur

When the value is resolved normally:

- the real value must continue to be passed through normally
- no regression in existing Select behavior is allowed

## Technical constraints

The fix must happen at the Select display/render layer.

Do NOT:

- mutate RHF value
- inject synthetic hidden options
- change runtime option datasets
- weaken the current unresolved detection semantics

## Testing constraints

Add focused tests that prove:

1. resolved values still render normally
2. unresolved values render as empty selection
3. unresolved values do not reset RHF value
4. MUI out-of-range warning is no longer triggered in the unresolved case
5. static mode still works
6. runtime mode still works

# Output

Produce the following:

## 1. Implementation

Add the minimal Select fix required to eliminate the MUI warning.

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
- new focused tests for unresolved MUI warning behavior

## 5. Notes

Explicitly confirm:

- no reconciliation logic was introduced
- no automatic value reset was introduced
- RHF value remains unchanged
- unresolved Select remains visually empty
- MUI out-of-range warning is eliminated

# Final instruction

Do not go beyond this step.

This is a focused warning-fix task only.
