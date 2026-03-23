# Task

Implement Reactive V2 Step 03 by wiring real field value changes to the reaction engine and closing the end-to-end integration gap identified in Step 02.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Step 01 introduced the runtime store foundation.
Step 02 introduced the reaction engine foundation.

Step 02 was approved as an engine foundation, but NOT as fully end-to-end complete because some integration tests were skipped due to incomplete field-change wiring.

This step exists specifically to close that gap.

# Scope

## In scope

1. Wire real field value changes to reaction triggering
2. Ensure adapter sync events correctly notify the reaction engine
3. Validate incremental evaluation on real field updates
4. Close the skipped integration tests from Step 02
5. Prove end-to-end flow for:
   - initial evaluation
   - watched field change
   - reaction execution
   - runtime state update
   - async stale protection behavior in integration scenarios

## Out of scope

Do NOT implement in this task:

- final Select UI behavior
- unresolved value warning behavior
- reconciliation
- automatic value reset
- visibleWhen logic
- translation or user-facing runtime messages
- advanced business rules
- value healing
- Select option rendering behavior beyond what is strictly necessary for integration testing

# Goal

Close the real integration loop between:

- RHF values
- adapter sync flow
- reaction registry
- runtime store

At the end of this task, Reactive V2 should no longer rely on skipped tests for core field-change behavior.

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not introduce UI logic into the reaction engine.
5. Do not move visibleWhen into the form layer.
6. Keep the implementation surgical.
7. Do not refactor unrelated files.
8. All code comments and JSDoc must be in English.
9. The result must close the integration gap from Step 02 rather than redesigning Step 02.

# Constraints

## Architecture constraints

- Application name: `dashforge`
- Policy folder: `/dashforge/.opencode/policies/`
- Task folder: `/dashforge/.opencode/tasks/`
- Reports folder: `/dashforge/.opencode/reports/`

You must inspect the current implementation from:

- Step 01
- Step 02

At minimum, inspect:

- DashFormProvider
- FormEngineAdapter
- reaction registry / engine files introduced in Step 02
- runtime store from Step 01
- current field sync flow from bridge/register/onChange
- current TextField
- current Select
- skipped tests from Step 02

Do not assume behavior without reading the real implementation.

## Integration constraints

This step must prove the following real flow:

1. User changes a field value
2. RHF updates
3. adapter syncValueToEngine executes
4. reaction engine is notified
5. matching watched reactions are evaluated
6. when condition is checked
7. run executes
8. runtime store updates
9. subscribed consumers can observe updated runtime state

This must work for real field updates, not only isolated unit tests.

## Testing constraints

The skipped integration tests from Step 02 must be revisited in this step.

Goal:

- skipped tests related to the real reaction flow should become active and passing
- no silent dependency on future UI steps for core engine wiring

If some tests still must remain skipped, that must be justified explicitly and narrowly.

## Async constraints

Async behavior must remain mechanical:

- use beginAsync / isLatest
- no ordering guarantees between reactions
- no business semantics
- no reconciliation

# Output

Produce the following:

## 1. Implementation

Add only the wiring necessary to complete the real field-change reaction flow.

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
- previously skipped integration tests
- any new focused tests added

## 5. Notes

Explicitly confirm:

- no reconciliation logic was introduced
- no automatic value reset was introduced
- no UI logic was introduced
- no visibleWhen logic was moved
- whether Step 02 skipped tests were fully closed

# Suggested implementation sequence

1. Inspect Step 02 skipped tests and identify the exact missing wiring
2. Inspect current value sync flow from field components to adapter
3. Confirm current adapter notification path
4. Wire the reaction engine to real field change notifications
5. Activate and fix the skipped integration tests
6. Add focused tests if needed
7. Run validation
8. Produce final report

# Final instruction

Do not go beyond this step.

Do not implement final Select unresolved-value behavior yet.

Do not introduce UX policies that belong to later steps.

Build only the missing integration wiring required to make the Step 02 reaction engine work in real field-change scenarios, aligned with:

`/dashforge/.opencode/policies/reaction-v2.md`
