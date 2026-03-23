# Task

Implement Reactive V2 Step 05 by defining and integrating the unresolved-value behavior for Select fields using runtime-driven options.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 Step 01 introduced the runtime store foundation.
Reactive V2 Step 02 introduced the reaction engine foundation.
Reactive V2 Step 03 closed the real field-change wiring gap.
Reactive V2 Step 04 integrated Select with runtime-driven options.

Until now, unresolved-value behavior was intentionally deferred.

This step must finalize that behavior in a disciplined way, consistent with the approved policy and previous decisions.

# Scope

## In scope

1. Define unresolved-value behavior for Select in runtime mode
2. Detect when current form value cannot be resolved against loaded runtime options
3. Keep UI behavior neutral:
   - no selected option rendered
   - no automatic user-facing message
4. Emit a warning in development mode only
5. Keep production silent
6. Add focused tests for unresolved-value behavior

## Out of scope

Do NOT implement in this task:

- reconciliation
- automatic value reset
- visibleWhen changes
- translation or user-facing runtime messages
- helper text like "not found"
- loading/empty-state messaging
- business validation logic
- changes to reaction semantics
- runtime-driven form value healing

# Goal

Finalize the unresolved-value policy for Select fields using runtime-driven options, while preserving the strict architectural boundaries already established.

At the end of this task, Dashforge must support:

- value remains unchanged in RHF
- unresolved runtime value renders as empty selection
- developer warning only in development mode
- no warning in production
- no reconciliation
- no UI messaging

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not introduce user-facing helper text or translated messages.
5. Keep UI neutral.
6. Warning must be developer-oriented, not user-oriented.
7. Warning must be development-only.
8. Production console must remain clean.
9. Keep the implementation surgical.
10. Do not refactor unrelated files.
11. All code comments and JSDoc must be in English.

# Constraints

## Architecture constraints

- Application name: `dashforge`
- Policy folder: `/dashforge/.opencode/policies/`
- Task folder: `/dashforge/.opencode/tasks/`
- Reports folder: `/dashforge/.opencode/reports/`

Inspect the current implementation before proposing changes.

At minimum, inspect:

- current Select implementation from Step 04
- current runtime option normalization path
- current mapper behavior
- current value-to-option resolution logic
- runtime mode tests added in Step 04

Do not assume behavior without reading the real implementation.

## Behavioral constraints

### Unresolved value definition

A value is unresolved when:

- the field has a non-null current RHF value
- runtime options are loaded / ready
- no option matches the current value using the active value-mapper logic

### Required behavior

If unresolved:

- Select must render with no selected option shown
- RHF value must remain unchanged
- no automatic reset must occur
- no UI message must be displayed
- in development mode only, emit a warning

### Warning constraints

The warning must:

- be emitted only in development mode
- be deduplicated to avoid console spam
- not fire during loading
- only fire when runtime state is ready and matching failed
- be clearly developer-oriented

The warning must NOT:

- appear in production
- be translated
- be shown in the UI
- imply that the library will auto-fix the data

## Testing constraints

Add focused tests that prove:

1. unresolved value shows empty UI selection
2. unresolved value does not reset RHF value
3. warning is emitted in development mode only
4. warning is not emitted in production mode
5. warning is not emitted during loading
6. warning is deduplicated
7. resolved values continue to work normally

# Output

Produce the following:

## 1. Implementation

Add the unresolved-value behavior in the minimal correct way.

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
- new unresolved-value tests

## 5. Notes

Explicitly confirm:

- no reconciliation logic was introduced
- no automatic value reset was introduced
- no UI messaging was introduced
- warning is dev-only
- production remains silent

# Suggested implementation sequence

1. Inspect current Select runtime behavior
2. Identify current selected-option resolution point
3. Add unresolved detection
4. Add dev-only warning policy with deduplication
5. Keep rendering neutral
6. Add focused tests
7. Run validation
8. Produce final report

# Final instruction

Do not go beyond this step.

Do not introduce reconciliation.

Do not introduce automatic reset.

Do not introduce user-facing messaging.

Build only the unresolved-value policy required to complete the Select runtime behavior, aligned with:

`/dashforge/.opencode/policies/reaction-v2.md`
