# Task

Implement the second foundational slice of Reactive V2 by introducing the reaction engine primitives:

- reaction registration
- watch support
- optional when condition
- run execution
- initial evaluation cycle
- async staleness primitives

# Context

Before implementing any code, you MUST read and comply with:

- /dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 must remain a mechanical, condition-driven runtime layer.
Do not introduce business semantics.
Do not introduce reconciliation.
Do not introduce automatic value reset.
Do not introduce UI logic.

Step 01 is already implemented and approved.
This step must build on top of the existing runtime store and runtime APIs without redesigning them.

# Scope

## In scope

1. Introduce reaction definition types
2. Introduce reaction registration
3. Implement watch-based triggering
4. Implement optional when condition
5. Implement run execution (sync and async)
6. Implement initial evaluation cycle using initial RHF values already synced into the engine
7. Introduce async staleness helpers for future fetch reactions
8. Keep the implementation compatible with the existing Dashforge architecture and with Step 01

## Out of scope

Do NOT implement in this task:

- Select component integration
- unresolved value warnings
- value reconciliation
- automatic value reset
- visibleWhen logic
- UI rendering behavior
- translation or user-facing runtime messages
- advanced dependency graph semantics (parent/child meaning)
- DSL abstractions like dependsOn
- provider React state fan-out
- business validation logic

# Goal

Create the minimum correct reaction engine required for Reactive V2 so that later steps can connect Select runtime data loading to field changes in a centralized and testable way.

At the end of this task, Dashforge must have:

- a reaction definition model
- a way to register reactions
- execution when watched fields change
- support for when conditions
- support for sync and async run handlers
- an initial evaluation cycle on startup
- async staleness protection primitives

# Rules

1. Read and follow `/dashforge/.opencode/policies/reaction-v2.md` before making changes.
2. Reactions are mechanical only.
3. Do not introduce business semantics.
4. Do not introduce reconciliation logic.
5. Do not introduce automatic value reset.
6. Do not move visibleWhen into the form layer.
7. Do not introduce UI logic into runtime or reaction engine.
8. RHF remains the source of truth for form values.
9. Runtime state remains separate from form values.
10. Keep the implementation surgical and minimal.
11. Do not refactor unrelated files.
12. All code comments and JSDoc must be in English.

# Constraints

## Architecture constraints

- Application name: `dashforge`
- Policy folder: `/dashforge/.opencode/policies/`
- Task folder: `/dashforge/.opencode/tasks/`
- Reports folder: `/dashforge/.opencode/reports/`

You must inspect the existing implementation created in Step 01 and extend it without redesigning the runtime store layer.

At minimum, inspect the current files that correspond to:

- DashFormProvider
- DashFormBridge
- runtime store implementation
- useFieldRuntime
- current engine sync flow from RHF to engine
- current FormEngineAdapter
- existing engine/store utilities

Do not assume file names or behavior without reading them first.

## Reaction model constraints

Introduce a reaction model conceptually equivalent to:

```ts
type ReactionDefinition<TFieldValues> = {
  id: string;
  watch: string[];
  when?: (ctx: { getValue: <T = unknown>(name: string) => T }) => boolean;
  run: (ctx: ReactionRunContext<TFieldValues>) => void | Promise<void>;
};

Introduce a run context conceptually equivalent to:

type ReactionRunContext<TFieldValues> = {
  getValue: <T = unknown>(name: string) => T;
  getRuntime: <TData = unknown>(name: string) => FieldRuntimeState<TData>;
  setRuntime: <TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ) => void;
  beginAsync: (key: string) => number;
  isLatest: (key: string, requestId: number) => boolean;
};

Exact naming may vary only if strongly justified by the existing codebase.
Prefer explicit naming over clever naming.

Registration constraints

The system must support registering multiple reactions centrally.
Registration must be explicit and testable.

Do not hide reaction registration inside UI components.

Execution constraints
Field change execution

When a watched field changes:

affected reactions must be evaluated
if when is absent, run directly
if when exists and returns true, run
if when returns false, do nothing
Initial evaluation

On startup, the engine must perform an initial evaluation pass using the already-known initial values.

Important:

no parent/child semantics
no root field semantics
no reconciliation pass
no data healing
just evaluate conditions and execute matching reactions
Async constraints

Add staleness primitives for async reactions.

Conceptually support:

beginAsync(key): number
isLatest(key, requestId): boolean

This is required for future async fetch reactions.

Do not add more orchestration semantics than necessary.

Value mutation constraints

In this step, reactions MUST NOT introduce automatic reset behavior.

If value mutation helpers are considered, they must not be used for reconciliation or auto-healing.
Prefer to defer value mutation helpers unless strictly required by the existing architecture.

Provider constraints

Do not introduce provider React state that causes render fan-out.
Provider may act as composition/wiring point only.

Output

Produce the following:

1. Implementation

Add the reaction engine primitives in the appropriate existing files.

2. File-by-file report

At the end, provide a report with:

application name
folder name
filename
what changed
why it changed
3. API summary

List the final public/internal APIs introduced in this step.

4. Validation

Run and report:

typecheck
relevant tests
new focused tests you add
5. Notes

Explicitly confirm:

no reconciliation logic was introduced
no automatic value reset was introduced
no UI logic was introduced
no visibleWhen logic was moved
no provider fan-out state was introduced
Suggested implementation sequence
Inspect Step 01 implementation
Define reaction types
Define reaction registry
Add watch-to-reaction mapping
Add execution pipeline for watched field changes
Add optional when evaluation
Add async staleness helpers
Add initial evaluation cycle
Add focused tests
Run validation
Final instruction

Do not go beyond this step.

Do not implement Select runtime integration yet.

Do not implement unresolved value behavior yet.

Build only the reaction engine foundation required for the next Reactive V2 step, and keep every decision aligned with:

/dashforge/.opencode/policies/reaction-v2.md
```
