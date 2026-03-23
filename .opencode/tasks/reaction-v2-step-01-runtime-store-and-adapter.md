Task

Implement the first foundational slice of Reactive V2 by introducing the runtime field state layer and the adapter APIs required to read, write, and subscribe to runtime state.

Context

Before implementing any code, you MUST read and comply with:

/dashforge/.opencode/policies/reaction-v2.md

This policy is mandatory.
If any part of this task appears to conflict with the policy, the policy takes precedence.

Reactive V2 must be implemented as a mechanical, condition-driven runtime layer.
Do not introduce business semantics, reconciliation, or UI logic.

This step is intentionally narrow.
Do not implement the full reaction engine yet.
Do not implement automatic value resets.
Do not implement UI messaging for unresolved values.

This step is only about creating the runtime state foundation and exposing it through the adapter in a clean and stable way.

Scope
In scope
Introduce a field runtime state model for Reactive V2
Add an internal atomic runtime store
Extend the adapter with APIs to:
read runtime state
patch runtime state
subscribe to runtime state changes
Add a minimal hook to consume runtime state from components
Keep the design compatible with the existing Dashforge form architecture
Preserve current behavior of existing components unless required for type-safe integration
Out of scope

Do NOT implement in this task:

reaction registration
reaction execution
watch / when / run
bootstrap evaluation
async orchestration beyond the primitives needed later
unresolved value warnings
Select component behavior changes
value reconciliation
automatic resets
visibility logic
provider-level React state that causes fan-out re-renders
Goal

Create the lowest-level runtime infrastructure required by Reactive V2 so that later tasks can implement reactions and Select integration without redesigning the adapter again.

At the end of this task, Dashforge must have:

a runtime state shape for fields
an atomic store for runtime field state
adapter APIs to read / patch / subscribe
a hook usable by components to read only their own runtime state slice
Rules
Read and follow /dashforge/.opencode/policies/reaction-v2.md before making changes.
Do not introduce business semantics.
Do not add reconciliation logic.
Do not add automatic field value resets.
Do not move visibleWhen into the form layer.
Do not use React Context mutable state for runtime updates.
The runtime layer must be designed for atomic per-field updates.
RHF must remain the source of truth for field values.
The runtime store is only for runtime metadata such as:
loading
fetch/runtime error
runtime data
Keep the implementation surgical and minimal.
Do not refactor unrelated files.
All code comments and JSDoc must be in English.
Constraints
Architecture constraints
Application name: dashforge
Policy folder: /dashforge/.opencode/policies/
Task folder: /dashforge/.opencode/tasks/

You must inspect the current implementation and extend the existing architecture instead of inventing a parallel system.

Relevant areas to inspect first

You must inspect the existing files responsible for:

form provider
form adapter
form context
current field/component integration

At minimum, inspect the current files that correspond to:

DashFormProvider
FormEngineAdapter
DashFormContext
existing hooks used by form components
current TextField
current Select

Do not assume names or behavior without reading them first.

State model constraints

Introduce the following conceptual model:

type FieldFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

interface FieldRuntimeState<TData = unknown> {
status: FieldFetchStatus;
error: string | null;
data: TData | null;
}

For select-oriented runtime data, support this shape:

interface SelectFieldRuntimeData<TOption = unknown> {
options: TOption[];
}

You may refine exact placement and generics to match the codebase, but the semantics must remain the same.

Store constraints

The runtime store must support:

per-field runtime state storage
per-field subscriptions
atomic updates
future compatibility with Valtio-based consumption

If Valtio is already appropriate and clean to integrate at this stage, use it.
If introducing Valtio right now would create unstable or unnecessary churn, create the runtime abstraction in a way that is explicitly Valtio-ready.

Do not create a solution that depends on provider re-renders.

Adapter constraints

Extend the adapter with APIs equivalent in behavior to:

getFieldRuntime(name)
setFieldRuntime(name, patch)
subscribeFieldRuntime(name, listener)

Exact names may vary only if strongly justified by existing naming conventions.
Prefer explicit naming over clever naming.

Hook constraints

Add a minimal component-facing hook, conceptually equivalent to:

useFieldRuntime(name)

Requirements:

it must subscribe only to the requested field
it must not cause full form re-renders
it must return a stable runtime shape
it must be designed for later use by Select
Initial runtime shape constraints

Each field runtime state must be safely readable even before any async work happens.

Avoid undefined-chaos.
The consuming side should not need excessive defensive checks.

A clean default runtime state is expected.

Output

Produce the following:

1. Implementation

Add the runtime infrastructure in the appropriate existing files.

2. File-by-file report

At the end, provide a report with:

application name
folder name
filename
what changed
why it changed 3. API summary

List the final public/internal APIs introduced in this step.

4. Validation

Run and report:

typecheck
relevant tests if they already exist
any new focused tests you add 5. Notes

Explicitly confirm:

no reconciliation logic was introduced
no automatic value reset was introduced
no visibleWhen logic was moved
no provider fan-out state was introduced
Suggested implementation sequence
Inspect existing form core files
Define FieldRuntimeState and related runtime types
Add the internal runtime store
Add adapter runtime APIs
Add the runtime subscription hook
Wire the hook into the existing form infrastructure
Add focused tests for runtime read / patch / subscribe behavior
Run validation
Final instruction

Do not go beyond this step.

Do not implement reactions yet.

Do not implement Select runtime resolution yet.

Build only the runtime foundation required for the next Reactive V2 step, and keep every decision aligned with:

/dashforge/.opencode/policies/reaction-v2.md
