# Task

Implement Reactive V2 Step 04 by integrating the existing Select component with the Reactive V2 runtime state layer.

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 Step 01 introduced the runtime store foundation.
Reactive V2 Step 02 introduced the reaction engine foundation.
Reactive V2 Step 03 closed the real field-change wiring gap.

This step is the first UI-facing integration step:
the existing Select component must be able to consume runtime-provided options in a clean and compatible way.

This step must remain narrow and disciplined.
Do NOT introduce unresolved value UX policies yet.
Do NOT introduce reconciliation.
Do NOT introduce automatic resets.

# Scope

## In scope

1. Integrate the existing Select component with `useFieldRuntime`
2. Support runtime-driven options for Select fields
3. Introduce and support `optionsFromFieldData`
4. Keep support for existing static `options`
5. Support generic option shapes with mapping functions if required by the current architecture
6. Preserve compatibility with current Select/TextField structure as much as possible
7. Add focused tests for runtime option consumption

## Out of scope

Do NOT implement in this task:

- unresolved value warnings
- reconciliation logic
- automatic value reset
- visibleWhen logic changes
- translation or user-facing runtime messages
- business validation logic
- runtime-driven UI error messaging beyond existing component behavior
- final UX policies for missing selected values
- broad refactors of TextField unless strictly required for Select integration

# Goal

Allow the existing Select component to consume options from Reactive V2 runtime state, while preserving current static-option behavior and keeping the architecture aligned with the approved policy.

At the end of this task, Dashforge must support:

- Select with static options (existing behavior preserved)
- Select with runtime options from field runtime state
- real integration with `useFieldRuntime`
- no business healing
- no unresolved-value UI policy yet

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md`.
2. Do not introduce reconciliation.
3. Do not introduce automatic value reset.
4. Do not introduce unresolved-value warnings yet.
5. Do not introduce UI business messaging.
6. Do not move visibleWhen into the form layer.
7. Keep the implementation surgical.
8. Preserve existing Select usage wherever possible.
9. Avoid unnecessary refactors in TextField.
10. All code comments and JSDoc must be in English.

# Constraints

## Architecture constraints

- Application name: `dashforge`
- Policy folder: `/dashforge/.opencode/policies/`
- Task folder: `/dashforge/.opencode/tasks/`
- Reports folder: `/dashforge/.opencode/reports/`

You must inspect the real current implementation before proposing changes.

At minimum, inspect:

- current Select implementation
- current TextField implementation
- current bridge/runtime hook usage
- Step 01 runtime store
- Step 03 validated flow
- current Select props and typing
- current option rendering path

Do not assume anything without reading the implementation.

## Select integration constraints

This step must support two modes:

### 1. Static mode

Current behavior must continue to work:

- Select receives `options` directly
- current static usage should not break

### 2. Runtime mode

If `optionsFromFieldData` is enabled:

- Select must read runtime state using `useFieldRuntime(name)`
- options must come from runtime data
- the expected runtime shape remains compatible with Reactive V2 policy

## Runtime data constraints

Use the runtime shape already approved in previous steps.

Conceptually, Select runtime data remains:

```ts
interface SelectFieldRuntimeData<TOption = unknown> {
  options: TOption[];
}
```

Option typing constraints

Do not force the reaction engine or runtime layer to transform data into { label, value }.

The component layer is responsible for interpreting options.

If needed, support a generic option model with mapping functions such as:

getOptionLabel
getOptionValue
getOptionDisabled

But inspect the current Select implementation first before deciding the final shape.

Preserve existing DX for the simple static { label, value } case.

Unresolved value constraints

This step MUST NOT finalize unresolved value behavior.

Specifically:

do not add warning logic yet
do not add reset logic
do not add user-facing “not found” behavior
do not introduce reconciliation

If unresolved-value handling is encountered, keep the behavior neutral and aligned with current component behavior.

Testing constraints

Add focused tests that prove:

static options still work
runtime options can be consumed
Select updates when runtime options change
integration works with the approved Reactive V2 runtime flow
no reconciliation or reset behavior is introduced
Output

Produce the following:

1. Implementation

Integrate Select with runtime field data in the minimal correct way.

2. File-by-file report

At the end, provide a report with:

application name
folder name
filename
what changed
why it changed 3. API summary

List any public/internal APIs changed or added in this step.

4. Validation

Run and report:

typecheck
relevant tests
new focused Select/runtime integration tests 5. Notes

Explicitly confirm:

no reconciliation logic was introduced
no automatic value reset was introduced
unresolved value policy was not finalized in this step
no visibleWhen logic was moved
Suggested implementation sequence
Inspect current Select and TextField implementations
Decide the smallest compatible extension strategy
Add runtime option consumption path
Preserve static option path
Add/update typings only as needed
Add focused tests
Run validation
Produce final report
Final instruction

Do not go beyond this step.

Do not implement unresolved-value warnings yet.

Do not implement final UX policy for missing selected values yet.

Build only the Select/runtime integration required to make Reactive V2 usable with runtime-driven options, aligned with:

/dashforge/.opencode/policies/reaction-v2.md
