# Dashforge — Reactive V2 Policy

## Purpose

This document defines the **strict architectural rules and constraints** for implementing Reactive V2 in Dashforge.

All implementations MUST follow these rules.
No deviation is allowed unless explicitly approved.

---

# 1. Core Principles

## 1.1 Reactions are mechanical (NOT semantic)

Reactions MUST NOT encode business meaning.

A reaction is strictly defined by:

- `watch`: fields to observe
- `when`: condition (optional)
- `run`: effect (sync or async)

Reactions MUST NOT:

- assume parent/child relationships
- infer domain semantics
- perform data correction or healing

---

## 1.2 RHF remains the source of truth for form values

React Hook Form (RHF) is responsible for:

- field values
- validation
- touched / dirty
- submission lifecycle

Reactive V2 MUST NOT replace or duplicate RHF responsibilities.

---

## 1.3 Runtime state is separate from form values

Reactive V2 introduces a **field runtime state layer**.

This layer is used for:

- async data (e.g. options)
- loading state
- runtime errors

This state MUST NOT be stored in RHF.

---

## 1.4 Runtime state must be atomic

Runtime state MUST NOT be stored in React Context state.

Instead, it MUST use an atomic store (Valtio or equivalent).

Goal:

- avoid unnecessary re-renders
- isolate updates per field

---

## 1.5 No automatic reconciliation (CRITICAL)

Reactive V2 MUST NOT:

- reset field values automatically
- fix inconsistent data
- enforce value validity against fetched options

If a value is inconsistent with fetched data:
→ it is considered a **business data issue**, NOT a system issue

---

## 1.6 No UI responsibility in reactions

Reactions MUST NOT:

- control visibility
- control layout
- render UI state

`visibleWhen` remains fully inside components.

---

# 2. Lifecycle

## 2.1 Construction phase

The system initializes:

- RHF form
- engine
- adapter
- runtime store
- reaction registry

No reactions are executed yet.

---

## 2.2 Initial value sync

RHF `defaultValues` are synchronized into the engine.

These values are the input for the first evaluation cycle.

---

## 2.3 Initial evaluation cycle

The engine performs a full evaluation of all reactions.

For each reaction:

- check `watch`
- evaluate `when` (if present)
- if condition is true → execute `run`

There is:

- NO concept of root fields
- NO dependency hierarchy
- ONLY condition evaluation

---

## 2.4 Reaction execution

A reaction MAY:

- update runtime state
- trigger async operations
- update runtime loading/error/data

A reaction MUST NOT:

- mutate UI state
- reset form values (unless explicitly coded for a specific use case)

---

## 2.5 Async completion

After async operations complete:

- runtime state is updated
- options/data become available

---

## 2.6 UI resolution

Components resolve their display state based on:

- RHF value
- runtime options/data

---

# 3. Select Component Behavior

## 3.1 Value resolution

The Select component MUST resolve the current value as:

```ts
selectedOption = options.find(
  (option) => getOptionValue(option) === fieldValue
);
```

---

## 3.2 Unresolved value (CRITICAL)

If:

- a field has a value
- runtime options are loaded
- no matching option is found

Then:

- UI MUST display **no selected value**
- form value MUST remain unchanged
- NO automatic reset must occur

---

## 3.3 Developer warning (DEV ONLY)

In development mode ONLY:

If a value cannot be resolved:

- emit a console warning

Conditions:

- value is not null
- runtime status is `ready`
- no matching option exists

Requirements:

- warning must be deduplicated
- warning must NOT fire during loading
- warning must NEVER appear in production

---

## 3.4 No UI messaging for unresolved values

The component MUST NOT:

- display "not found"
- display automatic error messages
- perform translations

UI messaging is NOT the responsibility of the component.

---

# 4. Runtime State Shape

## 4.1 Base structure

```ts
type FieldFetchStatus = 'idle' | 'loading' | 'ready' | 'error';

interface FieldRuntimeState<TData = unknown> {
  status: FieldFetchStatus;
  error: string | null;
  data: TData | null;
}
```

---

## 4.2 Select runtime data

```ts
interface SelectFieldRuntimeData<TOption = unknown> {
  options: TOption[];
}
```

---

# 5. Reaction Definition

## 5.1 Structure

```ts
type ReactionDefinition<TFieldValues> = {
  id: string;
  watch: string[];
  when?: (ctx: { getValue: (name: string) => unknown }) => boolean;
  run: (ctx: ReactionRunContext<TFieldValues>) => void | Promise<void>;
};
```

---

## 5.2 Context

```ts
type ReactionRunContext<TFieldValues> = {
  getValue: <T = unknown>(name: string) => T;

  getRuntime: <TData = unknown>(
    name: string
  ) => FieldRuntimeState<TData> | undefined;

  setRuntime: <TData = unknown>(
    name: string,
    patch: Partial<FieldRuntimeState<TData>>
  ) => void;

  beginAsync: (key: string) => number;
  isLatest: (key: string, requestId: number) => boolean;
};
```

---

# 6. Out of Scope (MUST NOT be implemented in V2)

Reactive V2 MUST NOT include:

- automatic value reconciliation
- value reset policies
- dependency graph semantics (parent/child)
- UI visibility control
- UI translation logic
- business validation logic
- DSL abstractions like `dependsOn`

---

# 7. Final Definition

Reactive V2 is:

- a **condition-driven execution system**
- powered by **initial values**
- producing **runtime data**
- without modifying business data integrity

---

# 8. Golden Rule

Reactive V2 does NOT fix your data.

It only:

- observes
- executes
- exposes runtime state

Everything else is outside its responsibility.

### Display Behavior During Loading

During runtime loading/idle/error states:

- Select display value MUST be sanitized to empty if it does not match available options
- This prevents MUI out-of-range warnings
- The underlying form value MUST remain unchanged
- The field may be disabled during loading

This is a display-layer behavior only and does NOT imply value reset or reconciliation
