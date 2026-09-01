# @dashforge/forms

Declarative form bridge over `react-hook-form` for the Dashforge component
libraries (`@dashforge/ui`, `@dashforge/tw`) and any custom field that speaks
the `DashFormBridge` contract.

## Installation

```bash
npm install @dashforge/forms @dashforge/ui-core react-hook-form
```

## Peer Dependencies

- `react` `^18.0.0 || ^19.0.0`
- `react-hook-form` `^7.0.0`
- `@dashforge/ui-core` `^1.0.0`

Version compatibility with the visual editions:

| `@dashforge/forms` | `@dashforge/ui` | `@dashforge/tw` |
|---|---|---|
| `1.x` | `1.x` | `1.x` |

---

## The two API surfaces

`@dashforge/forms` intentionally exposes **two distinct surfaces**. Pick the
right one for the situation — mixing them is not required.

| Surface | What it is | When to use it |
|---|---|---|
| **`DashFormContext` / `DashFormBridge`** (declarative) | The primary API. Field components register with the bridge and get `getValue` / `setValue` / `getError` / `subscribeField` / access + visibility gates. Consumers write declarative schema: `defaultValues`, `reactions`, `access`, `visibleWhen`. | 99% of real-world usage. Everything expressible via schema, reactions, and access rules goes here. |
| **`useDashFormContext()`** (imperative escape hatch) | Explicit opt-in for imperative operations. Returns the raw `useForm()` return of react-hook-form (`rhf`), the Dashforge Engine instance, the adapter, and a debug flag. | Server-side validation errors, imperative reset, integration with external state machines, undo/redo, or any pattern that genuinely requires imperative control over form state. |

**The bridge does NOT expose `setError` / `clearErrors` / `setFocus` / `reset`
by design.** Those live on the escape hatch (`useDashFormContext().rhf.*`)
because they are imperative operations. The bridge is intentionally a
symmetric R/W surface for values, subscription hooks, and registration —
nothing else. Effects flow from user input through `wrappedOnChange` → engine
→ reactions; the bridge does not fire side effects on programmatic writes.

Everything else in this document breaks into either "declarative surface" or
"escape hatch" patterns.

---

## Quick start (declarative)

The recommended way to author a form is `<DashForm>`, which combines
`DashFormProvider` and a native `<form>` element. Wire fields with any
component from `@dashforge/ui` or `@dashforge/tw`.

```tsx
import { DashForm } from '@dashforge/forms';
import { TextField, Autocomplete, Button } from '@dashforge/tw';

export function SignupForm() {
  return (
    <DashForm
      defaultValues={{ email: '', plan: 'free' }}
      onSubmit={(data) => console.log('submit', data)}
    >
      <TextField name="email" rules={{ required: 'Email is required' }} />
      <Autocomplete
        name="plan"
        options={[
          { value: 'free', label: 'Free' },
          { value: 'pro', label: 'Pro' },
        ]}
      />
      <Button type="submit">Sign up</Button>
    </DashForm>
  );
}
```

`DashForm` accepts:

| Prop | Type | Notes |
|---|---|---|
| `defaultValues` | `DefaultValues<TFieldValues>` | Initial state. This is the correct place to seed values, including from server-loaded data (mount the form once the data is available). |
| `resolver` | RHF `Resolver` | Optional schema-validation resolver (Zod, Yup, Valibot, or custom). |
| `mode` | `'onChange' \| 'onBlur' \| 'onSubmit' \| ...` | RHF validation mode, default `'onChange'`. |
| `reactions` | `ReactionDefinition[]` | Declarative side effects (see below). |
| `engine` | `Engine` | Optional external Engine instance. Auto-created when omitted. |
| `debug` | `boolean` | Log adapter / reaction activity. |
| `onSubmit` | `SubmitHandler<TFieldValues>` | Standard RHF handler: `(data, event?) => any`. |
| `children` | `ReactNode` | Field components and any consumer UI. |

Note: `<DashForm>`'s `onSubmit` receives `(data)` only, matching the RHF
`SubmitHandler` signature. For server-side error injection, use the escape
hatch pattern below.

## Schema-based validation

Any react-hook-form resolver works out of the box.

```tsx
import { DashForm } from '@dashforge/forms';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be at least 18'),
});

export function SignupForm() {
  return (
    <DashForm
      resolver={zodResolver(schema)}
      defaultValues={{ email: '', age: 18 }}
      onSubmit={(data) => console.log(data)}
    >
      {/* fields */}
    </DashForm>
  );
}
```

## Reactions — declarative side effects

Reactions are the declarative way to express derived values, cross-field
effects, and data fetching triggered by field changes. A reaction watches one
or more fields and runs a callback when they change.

```tsx
import { DashForm } from '@dashforge/forms';
import { Autocomplete } from '@dashforge/tw';

const reactions = [
  {
    id: 'load-states',
    watch: ['country'],
    run: async (ctx) => {
      const country = ctx.getValue<string>('country');
      if (!country) {
        ctx.setRuntime('state', { options: [] });
        return;
      }
      ctx.setRuntime('state', { status: 'loading' });
      const states = await fetchStates(country);
      ctx.setRuntime('state', { options: states });
    },
  },
];

<DashForm
  defaultValues={{ country: null, state: null }}
  reactions={reactions}
>
  <Autocomplete name="country" options={countries} />
  <Autocomplete name="state" optionsFromFieldData />
</DashForm>;
```

`ReactionRunContext` provides:

- `getValue<T>(name)` — read a field value.
- `getRuntime<T>(name)` — read the runtime state (loading, error, data) for a field.
- `setRuntime<T>(name, state)` — write into a field's runtime state (populate options, mark loading, etc.).
- `beginAsync(key)` / `isLatest(key, id)` — stale-response guards for async work; discard results from superseded runs.

Reactions **do not receive a `setValue`**. This is intentional: reactions
express derived state (runtime data, loading indicators, dependent options),
not user-driven value changes. Values are owned by the user input flow; a
reaction that needed to change another field's *value* would be re-entering
the input pipeline and would introduce feedback loops. Rely on `defaultValues`
for initial state and on runtime state + `optionsFromFieldData` for dependent
data. If you truly need imperative writes (a genuine edge case), use the
escape hatch below.

## Access control (RBAC)

Every field component accepts an optional `access` prop enforced against the
`@dashforge/rbac` policy in scope:

```tsx
<TextField
  name="salary"
  access={{ action: 'read', resource: 'salary', onUnauthorized: 'hide' }}
/>
```

RBAC is declarative and evaluated per render. See `@dashforge/rbac` for
policy authoring; the field integration lives in `useAccessState` inside
`@dashforge/ui-core`.

## Conditional visibility

Fields also accept `visibleWhen` for reactive engine-driven visibility:

```tsx
<TextField
  name="company"
  visibleWhen={(engine) => engine.getNode('accountType').value === 'business'}
/>
```

`visibleWhen` subscribes to the Engine node state and re-evaluates on
changes — no `useEffect` needed.

## Field arrays

`useDashFieldArray` manages dynamic lists of fields (an unknown number of
line items on an invoice, a growing list of team members, phone numbers,
addresses, and so on). It hands back a `fields` list with stable ids for
React keys plus operations to mutate the list.

```tsx
import { DashForm, useDashFieldArray } from '@dashforge/forms';
import { TextField, Button } from '@dashforge/tw';

interface Skill { name: string; }
interface Values { skills: Skill[]; }

function SkillsForm() {
  const { fields, append, remove } = useDashFieldArray<Skill>('skills');
  return (
    <>
      {fields.map((field) => (
        <div key={field.id}>
          <TextField name={`${field.name}.name`} />
          <Button onClick={() => remove(field.index)}>Remove</Button>
        </div>
      ))}
      <Button onClick={() => append({ name: '' })}>Add skill</Button>
    </>
  );
}

<DashForm<Values> defaultValues={{ skills: [] }} onSubmit={(data) => save(data)}>
  <SkillsForm />
</DashForm>;
```

### Multi-step wizards, tabs, and conditional rendering

Array identity (the ordered ids exposed as `field.id`) is owned by the
Dashforge Engine, not by the hook instance. Every consumer of
`useDashFieldArray('skills')` in the same form reads the same engine
array node — so multiple instances mounted at different times, or in
different components (wizard steps, tab panels, conditionally rendered
regions), share the same ids for the same items.

Concretely: a wizard where Step 1 mounts a `useDashFieldArray('skills')`
and Step 2 mounts another `useDashFieldArray('skills')` — Step 2 sees
the exact ids Step 1 was working with, and mount / unmount cycles
between the two steps never remount surviving items or lose their
local input state.

```tsx
function Wizard() {
  const [step, setStep] = useState(1);
  return (
    <>
      {step === 1 && <StepOne />}
      {step === 2 && <StepTwo />}
      <Button onClick={() => setStep((s) => (s === 1 ? 2 : 1))}>
        {step === 1 ? 'Next' : 'Back'}
      </Button>
    </>
  );
}

function StepOne() {
  // First mount populates the engine array node from defaultValues.
  const { fields, append, remove } = useDashFieldArray<Skill>('skills');
  /* render skills; add / remove buttons */
}

function StepTwo() {
  // Later mount reads the SAME engine array node — identical ids.
  const { fields } = useDashFieldArray<Skill>('skills');
  /* render skills for review */
}
```

`useDashFieldArray` is not a wrapper around RHF's `useFieldArray`; the
two hooks address the same problem with a different architecture. RHF's
`useFieldArray` maintains one internal `fields` snapshot per hook
instance, so two hooks pointed at the same name do not observe each
other and lose their local state on remount — the fault-line documented
at [`/fault-lines/usefieldarray-multi-step-wizards`](https://dashforge-ui.com/fault-lines/usefieldarray-multi-step-wizards).
Dashforge moves array identity to the engine (schema layer) to make
this work by construction.

### Operations

| Method | Effect |
|---|---|
| `append(item)` | Add `item` to the end. Generates a fresh stable id. |
| `insert(index, item)` | Insert at `index` (clamped to `[0, fields.length]`). |
| `remove(index)` | Remove item at `index`. Out-of-range indexes are a no-op. Surviving items keep their ids (React key stability). |
| `move(from, to)` | Reorder. Moved item keeps its id. No-op on same-index or out-of-range. |
| `replace(items)` | Replace the whole array. Regenerates all ids — every rendered item remounts. |

### Consumer boundary

Prefer the hook's own operations over calling `rhf.setValue` on an
array root through `useDashFormContext().rhf`. Direct `rhf.setValue`
on an array root bypasses the engine — reactions won't fire on the
change and ids won't reconcile until the next hook operation on that
array. Use the escape hatch for scalar fields; use `useDashFieldArray`
methods for arrays.

`field.id` is opaque and session-local — it is stable for the lifetime
of the form but must not be serialised or sent to another session.

---

## The escape hatch — `useDashFormContext`

For patterns that genuinely require imperative control (server-side validation
errors, external state sync, custom submit orchestration), use
`useDashFormContext()`. It returns the raw `useForm()` result of
react-hook-form plus the Dashforge Engine + adapter.

**When to use it:** you have a specific imperative need that cannot be
expressed declaratively. Not as a default — as an opt-in.

### Server-side 422 error mapping

```tsx
import { DashFormProvider, useDashFormContext } from '@dashforge/forms';
import { TextField, Button } from '@dashforge/tw';

export function SignupForm() {
  return (
    <DashFormProvider defaultValues={{ email: '', name: '' }}>
      <Fields />
    </DashFormProvider>
  );
}

function Fields() {
  const { rhf } = useDashFormContext();

  const submit = rhf.handleSubmit(async (data) => {
    const res = await fetch('/api/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (res.status === 422) {
      const { errors } = await res.json();
      // Map server field errors onto RHF state.
      for (const [field, message] of Object.entries(errors)) {
        rhf.setError(field, { type: 'server', message: String(message) });
      }
      return;
    }
    // Handle success...
  });

  return (
    <form onSubmit={submit}>
      <TextField name="email" />
      <TextField name="name" />
      <Button type="submit">Sign up</Button>
    </form>
  );
}
```

Two things to note in this pattern:

1. `<DashFormProvider>` is used directly (not `<DashForm>`) because we need
   to own the `<form>` element and the submit orchestration.
2. `rhf.setError` is called from a component inside the provider tree, via
   the escape hatch. It writes into RHF's error state, which the bridge
   reads through `getError` — so the field UI updates automatically without
   any extra plumbing.

### Prefilling from server data

Load the data first, mount the form once. Declarative, no imperative writes.

```tsx
function EditUserForm({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setUser);
  }, [userId]);

  if (!user) return <Loading />;

  return (
    <DashForm
      defaultValues={user}
      onSubmit={(data) => saveUser(userId, data)}
    >
      <TextField name="name" />
      <TextField name="email" />
    </DashForm>
  );
}
```

Do NOT call `bridge.setValue` in a `useEffect` to prefill after mount —
that's the imperative pattern. Load first, mount once.

### Undo / reset / external integration

For any imperative operation RHF supports, reach for it via
`useDashFormContext().rhf`:

```tsx
function Fields() {
  const { rhf } = useDashFormContext();

  return (
    <>
      <TextField name="notes" />
      <Button onClick={() => rhf.reset()}>Reset form</Button>
      <Button onClick={() => rhf.setValue('notes', '')}>Clear notes</Button>
    </>
  );
}
```

These are legitimate uses of the escape hatch: consumer decides to run an
imperative operation deliberately, wired through the underlying RHF instance.

---

## Anti-patterns (do not do this)

Because `bridge.setValue` exists as a symmetric R/W primitive to `bridge.getValue`,
it is possible — but incorrect — to call it from consumer code. Doing so
bypasses the declarative input flow and does **not** trigger reactions
(reactions fire on the natural input pipeline, not on programmatic writes).

```tsx
// ❌ DO NOT do this.
function BadPattern() {
  const bridge = useContext(DashFormContext);
  return (
    <Button onClick={() => bridge?.setValue('country', 'IT')}>
      Set country
    </Button>
  );
}
```

For that pattern, use the escape hatch (`rhf.setValue`) — that at least
signals imperative intent explicitly.

Even better: rethink whether the imperative write is necessary. In most cases
it can be expressed via `defaultValues` (initial state), `reactions` (derived
state), or user input (via a real field bound to the value).

---

## API reference

### Components

| Symbol | Purpose |
|---|---|
| `<DashForm>` | Convenience: `<DashFormProvider>` + `<form>`. Use when you don't need custom submit orchestration. |
| `<DashFormProvider>` | The context provider. Use when you own the `<form>` element (e.g. to inject server errors, custom submit flow). |

### Hooks

| Hook | Returns | Purpose |
|---|---|---|
| `useDashFormContext()` | `{ engine, rhf, adapter, debug }` | Escape hatch. Access raw RHF, Engine, adapter. Throws if outside a provider. |
| `useDashRegister(name, options?)` | RHF registration + Engine metadata | Register a field with both RHF and the adapter. Called internally by field components. |
| `useDashFieldMeta(name)` | `{ error, isTouched, isDirty, allowAutoError }` | Granular per-field subscription to error / touched / dirty / submitCount. Silent no-op outside a provider. |
| `useDashFieldNode(name)` | Engine node handle + reactive value | Access an Engine node from inside a provider. Throws if outside. |
| `useFieldRuntime<T>(name)` | `FieldRuntimeState<T>` | Read runtime state (loading / options / error) for a field. Silent no-op outside a provider. |
| `useDashFieldArray(name)` | `{ fields, append, remove, move, insert, replace }` | Manage dynamic lists of fields with engine-owned stable ids that survive mount/unmount cycles (wizard steps, tabs). Throws if outside a provider. |

### Context

| Symbol | Purpose |
|---|---|
| `DashFormContext` | React context carrying the `DashFormBridge`. Re-exported from `@dashforge/ui-core`; field components read from it directly. |

### Types

- `DashFormBridge` — the bridge contract (from `@dashforge/ui-core`).
- `DashFormProps`, `DashFormProviderProps`, `DashFormContextValue`, `DashFormConfig` — component + context types.
- `ReactionDefinition`, `ReactionRunContext`, `ReactionWhenContext` — reaction authoring types.
- `FieldRuntimeState`, `SelectFieldRuntimeData`, `FieldFetchStatus` — runtime state types.
- `DashFieldMeta`, `UseDashRegisterResult`, `UseDashFieldArrayReturn`, `DashFieldArrayItem` — hook return types.

### Internal / advanced

Exported for advanced use (custom providers, test harnesses) but **not part
of the stable public surface** — may change between minor releases:

- `FormEngineAdapter` — the RHF ↔ Engine adapter class.
- `createRuntimeStore`, `DEFAULT_FIELD_RUNTIME`, `RuntimeStore` — runtime store factory.
- `createReactionRegistry`, `ReactionRegistry` — reaction registry primitive.
- `IFormEngineAdapter`, `FormEngineAdapterOptions` — adapter contract types.

Most consumers should not reach for these directly; use the hooks and
`<DashFormProvider>` instead.

---

## Design notes

- **Declarative by default, imperative by opt-in.** The bridge is a symmetric
  R/W primitive surface. Side effects (reactions) fire on user input flow.
  Imperative operations live behind `useDashFormContext` deliberately, so a
  reader can see when a consumer is stepping outside the declarative model.
- **Reactions write runtime, not values.** The unidirectional flow is
  user-input → engine → reaction → runtime. Reactions never write back into
  field values, avoiding feedback loops. Dependent-data patterns use
  `optionsFromFieldData` + `setRuntime`.
- **Bridge identity is stable.** The bridge object identity doesn't change
  across renders — consumers subscribe to per-field state via
  `useDashFieldMeta` (which uses `useSyncExternalStore` under the hood).
- **RHF is a full dependency, not hidden.** The escape hatch returns the
  raw `useForm()` result. Consumers who need RHF get all of RHF; consumers
  who don't never see it.

## License

MIT
