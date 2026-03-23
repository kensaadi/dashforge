# Task

Implement a focused follow-up fix for the MUI Select out-of-range warning in plain/controlled usage, extending the Step 05b display sanitization so it also covers non-RHF / non-bridge value paths.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 Step 05b already fixed MUI out-of-range warnings for unresolved values when the Select value comes from the DashForm bridge / RHF path.

However, warnings still occur in plain or controlled usage when:

- the Select receives `value` directly via props
- that value does not exist in the rendered option list

This task must extend the display sanitization logic to cover that path as well.

# Scope

## In scope

1. Extend display value sanitization to also handle plain/controlled `value` props
2. Keep RHF/bridge behavior unchanged
3. Preserve current unresolved-value policy
4. Add focused tests for controlled/plain unresolved scenarios
5. Eliminate the remaining MUI out-of-range warnings in those scenarios

## Out of scope

Do NOT implement in this task:

- reconciliation
- automatic value reset
- changes to unresolved-value warning policy
- changes to runtime reaction semantics
- new UI messaging
- broad Select refactors
- changes to visibleWhen
- changes to docs demo beyond what is required for validation

# Goal

Ensure that the display-layer sanitization works for both:

- RHF/bridge-driven value paths
- plain/controlled prop-driven value paths

so that MUI no longer emits out-of-range warnings when the displayed value is unresolved.

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not change the stored RHF value when unresolved.
5. Do not change the externally controlled value source.
6. Keep the Select visually empty when unresolved.
7. Do not introduce fake/hidden fallback options.
8. Do not silence console globally.
9. Keep the implementation surgical.
10. All code comments and JSDoc must be in English.

# Constraints

## Behavioral constraints

When the current displayed Select value does not match any rendered option:

- the actual underlying value source must remain unchanged
- the visual value passed to MUI must be sanitized to a safe empty value (`''`) or equivalent neutral display value
- the rendered Select must appear empty
- the MUI out-of-range warning must no longer occur

This must work for both:

1. bridge/RHF-driven values
2. direct prop-driven values

## Technical constraints

The fix must happen at the Select/TextField display/render layer.

Do NOT:

- mutate RHF value
- mutate externally controlled props
- inject synthetic hidden options
- change runtime option datasets
- weaken the unresolved-value policy

## Testing constraints

Add focused tests that prove:

1. controlled/plain resolved values still render normally
2. controlled/plain unresolved values render as empty selection
3. controlled/plain unresolved values do not mutate the supplied value source
4. MUI out-of-range warning is no longer triggered in controlled/plain unresolved scenarios
5. Step 05b behavior remains intact for RHF/bridge path

# Output

Produce the following:

## 1. Implementation

Add the minimal fix required to extend display sanitization to controlled/plain value usage.

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
- new focused tests for controlled/plain unresolved MUI warning behavior

## 5. Notes

Explicitly confirm:

- no reconciliation logic was introduced
- no automatic value reset was introduced
- RHF value remains unchanged
- controlled value source remains unchanged
- unresolved Select remains visually empty
- MUI out-of-range warning is eliminated for controlled/plain path

# Final instruction

Do not go beyond this step.

This is a focused warning-fix task only.
