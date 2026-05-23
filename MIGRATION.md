# Dashforge migration guides

This file collects the breaking-change upgrade guides for each Dashforge
release that introduces an incompatible API change. The full release
history (including non-breaking releases) lives in the
[top-level CHANGELOG](./CHANGELOG.md).

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) for
the broader history; this file focuses strictly on the **upgrade work** a
consumer has to do to move between specific versions.

---

## `0.x-beta` → `1.0.0`

**No code changes required.** The `1.0.0` release is functionally
identical to the last beta tarball of each package — what changes is
the **stability commitment**: from this point onwards the public API
is governed by semver, and breaking changes require a major bump.

### What to update in your `package.json`

Bump every `@dashforge/*` range from `^0.x.y-beta` to `^1.0.0`:

```diff
 {
   "dependencies": {
-    "@dashforge/ui": "^0.4.0-beta",
-    "@dashforge/forms": "^0.2.3-beta",
-    "@dashforge/rbac": "^0.2.3-beta",
-    "@dashforge/theme-mui": "^0.2.3-beta",
-    "@dashforge/theme-core": "^0.2.3-beta",
-    "@dashforge/tokens": "^0.2.3-beta",
-    "@dashforge/ui-core": "^0.2.3-beta"
+    "@dashforge/ui": "^1.0.0",
+    "@dashforge/forms": "^1.0.0",
+    "@dashforge/rbac": "^1.0.0",
+    "@dashforge/theme-mui": "^1.0.0",
+    "@dashforge/theme-core": "^1.0.0",
+    "@dashforge/tokens": "^1.0.0",
+    "@dashforge/ui-core": "^1.0.0"
   }
 }
```

For the Tailwind edition the analogous bump applies to `@dashforge/tw`,
`@dashforge/tw-theme`, `@dashforge/tw-tokens`, and the shared bridge
packages (`@dashforge/forms`, `@dashforge/rbac`).

Run `pnpm install` (or `npm install` / `yarn install`) — no other
changes needed.

### What changes for you going forward

- **Stability**: from `1.0.0` you get a real semver guarantee. Patch
  releases are bug-fix-only; minor releases add features without
  breaking; majors are the only place breaking changes can land.
- **Independent versioning**: post-`1.0.0` each package versions
  independently. Compatibility ranges in `peerDependencies` reflect
  the matrix.
- **Tag scheme**: GitHub release tags are now per-package —
  `@dashforge/<pkg>@<version>` (the legacy `v<version>` monorepo-wide
  tag is retired).

### What does NOT change

- Component APIs (props, types, exports) — identical to the last beta.
- Form bridge contract (`DashForm`, hooks, runtime data).
- RBAC engine (policies, subjects, `<Can>`, per-field `access`).
- Theme tokens, presets, modes.
- Test setup and consumer integration patterns.

---

## `0.1.9-alpha` → `0.2.0-beta`

> **Release theme.** Public-API freeze across `@dashforge/*`. The
> `DashFormBridge` interface is split into a stable **required core** and
> a smaller **optional runtime** tier; the four `@deprecated` "version
> string" fields are removed. Implementation details that leaked into the
> public `src/index.ts` of each package are flagged `@internal` (still
> exported for now, but they may be moved out of the public surface in
> `0.3.0-beta`).

### What changes for consumers

For **application code** that uses `@dashforge/ui` components inside a
`<DashFormProvider>` — i.e. the standard usage of Dashforge — **nothing
breaks**. The UI components were the only call site of the version-string
subscribe trick, and they were rewired to `useDashFieldMeta` (per-field
`subscribeField`) in `0.1.6-alpha`. Application code did not depend on
the deprecated fields directly.

For **custom bridge implementations** (anyone who builds their own
`DashFormBridge` outside of `DashFormProvider` — e.g. tests, custom
adapters, alternative form libraries) there are three concrete actions:

1. **Stop emitting the deprecated `errorVersion` / `touchedVersion` /
   `dirtyVersion` / `valuesVersion` fields**. TypeScript will fail at
   build time on the unknown property names.
2. **Implement (or stub) the now-required core methods**: `register`,
   `unregister`, `getValue`, `setValue`, `getError`, `isTouched`,
   `isDirty`, `submitCount`, `subscribeField`. Previously these were
   optional `?:` on the interface; consumers had to defensively
   `bridge?.method?.(...)`. They are now plain required members.
3. **Reactivity is driven by `subscribeField(name, listener)` calls
   from the bridge** — consumers subscribe via `useDashFieldMeta`
   (`useSyncExternalStore` under the hood). A bridge that fails to wire
   listeners will simply not re-render UI components; this is a
   correctness contract, not a typecheck error.

### Cheat sheet — bridge contract diff

| Field | `0.1.x` (alpha) | `0.2.0-beta` | Migration note |
|---|---|---|---|
| `engine` | required | required | — |
| `register` | optional `?:` | **required** | drop the `?:` on your implementation; drop `?.` at every call site |
| `unregister` | optional `?:` | **required** | added in `0.1.6-alpha`, now required |
| `getValue` | optional `?:` | **required** | — |
| `setValue` | optional `?:` | **required** | — |
| `getError` | optional `?:` | **required** | — |
| `isTouched` | optional `?:` | **required** | — |
| `isDirty` | optional `?:` | **required** | — |
| `submitCount` | optional `?:` (`number \| undefined`) | **required** (`number`) | always emit a number, default `0` |
| `subscribeField` | optional `?:` | **required** | added in `0.1.6-alpha`, now required |
| `getFieldRuntime` | optional `?:` | **optional `?:`** | unchanged — runtime API stays opt-in |
| `setFieldRuntime` | optional `?:` | **optional `?:`** | unchanged |
| `subscribeFieldRuntime` | optional `?:` | **optional `?:`** | unchanged |
| `debug` | optional `?:` | **optional `?:`** | unchanged |
| `errorVersion` | optional `?:` `@deprecated` | **REMOVED** | use `subscribeField` + `getError` |
| `touchedVersion` | optional `?:` `@deprecated` | **REMOVED** | use `subscribeField` + `isTouched` |
| `dirtyVersion` | optional `?:` `@deprecated` | **REMOVED** | use `subscribeField` + `isDirty` |
| `valuesVersion` | optional `?:` `@deprecated` | **REMOVED** | use `subscribeField` + `getValue` |

### Pattern migration — version-string subscribe → per-field subscribe

**Before (0.1.x)** — a component subscribed by reading the version string
during render. RHF re-rendered the provider; the provider rebuilt the
bridge; the bridge had a new `errorVersion` string; every consumer
re-rendered:

```tsx
function MyTextField({ name }: { name: string }) {
  const bridge = useContext(DashFormContext);
  void bridge?.errorVersion;       // global subscribe (every consumer)
  const error = bridge?.getError?.(name);
  // ...
}
```

**After (0.2.0-beta)** — the consumer subscribes to ONLY its field via
`useDashFieldMeta`. Re-renders are scoped to the field whose state
changed:

```tsx
function MyTextField({ name }: { name: string }) {
  const { value, error, touched, allowAutoError } = useDashFieldMeta(name);
  // re-renders ONLY when this field's value/error/touched/dirty changes
  // ...
}
```

This is also dramatically faster: a 30-field form no longer re-renders
all 30 inputs on every keystroke — only the input being edited.

### Pattern migration — drop the double optional chain

**Before (0.1.x)** — both `bridge` and each method were potentially
undefined, so call sites needed two `?.`:

```ts
const value = bridge?.getValue?.(name);
const err   = bridge?.getError?.(name);
const touched = bridge?.isTouched?.(name) ?? false;
```

**After (0.2.0-beta)** — methods are required when `bridge` exists, so
only the bridge itself needs an optional chain (or an upstream
`if (!bridge) return ...` guard):

```ts
if (!bridge) return /* standalone fallback */;
const value = bridge.getValue(name);
const err   = bridge.getError(name);
const touched = bridge.isTouched(name);
```

### Pattern migration — mock bridges in tests

If you wrote a `DashFormBridge` mock for unit tests, you now need to
implement (or stub) the required methods. The simplest pattern is a
helper that fills in no-ops and accepts overrides:

```ts
function createTestBridge(overrides: Partial<DashFormBridge>): DashFormBridge {
  return {
    engine: {} as DashFormBridge['engine'],
    register: () => ({ name: '' }),
    unregister: () => undefined,
    getValue: () => undefined,
    setValue: () => undefined,
    getError: () => null,
    isTouched: () => false,
    isDirty: () => false,
    submitCount: 0,
    subscribeField: () => () => undefined,
    ...overrides,
  };
}
```

`@dashforge/ui` ships an updated `createMockBridge` (in
`test-utils/mockBridge.ts`) that already implements the new contract,
including a broadcast-style `subscribeField` for tests that care about
reactivity.

### What `@internal` means in this release

`0.2.0-beta` tags a number of low-level symbols with the JSDoc
`@internal` marker:

- `@dashforge/forms` — `FormEngineAdapter`, `IFormEngineAdapter`,
  `FormEngineAdapterOptions`, `createRuntimeStore`,
  `DEFAULT_FIELD_RUNTIME`, `RuntimeStore`, `createReactionRegistry`,
  `ReactionRegistry`.
- `@dashforge/ui-core` — `DependencyTracker`, `RuleEvaluator`,
  `DependencyGraph`, `DependencyTrackerConfig`, `RuleEvaluatorConfig`,
  `EvaluationStats`, the entire low-level store API (`createStore`,
  `resetStore`, the evaluation-depth helpers, `Store`, `StoreConfig`,
  `StoreMetadata`), and the test-only `createMockRHFResult`.

These symbols are **still exported** from each package's
`src/index.ts` — i.e. your existing imports keep compiling — but they
are flagged as not part of the stable contract. The intent is:

- If you depend on them, expect them to move or change shape in a
  future minor release.
- Tooling that respects `@internal` (TypeDoc, `api-extractor`) will
  hide them from generated docs.
- In `0.3.0-beta` or `1.0.0` we may move these to subpaths
  (`@dashforge/ui-core/internal`, etc.) or drop them from the entry
  point entirely.

### What did NOT change

- Peer dependency on `@mui/material@^9.0.0` (set in `0.1.7-alpha`).
- Peer dependency on `react@^18.0.0 || ^19.0.0`.
- The `useDashFieldMeta` / `useDashFieldNode` / `useDashRegister` hooks
  and their semantics — see the JSDoc decision tree (introduced in
  `0.1.9-alpha`) for picking the right one.
- The `useDashFieldArray` hook (added in earlier alphas; semantics
  unchanged).
- `DashFormProvider` props (`defaultValues`, `resolver`, `mode`,
  `reactions`, etc.).
- The `Engine` API in `@dashforge/ui-core` (`createEngine`,
  `useEngineNode`, etc.).
- Component prop signatures on every `@dashforge/ui` form input.
- Standalone (no-provider) mode of the UI components — when rendered
  outside a `DashFormProvider`, they still fall back to controlled
  mode via `value` + `onChange` props.

### Test totals after migration

For the record (your CI / smoke check baseline):

- `@dashforge/forms`: 133 / 133 passing.
- `@dashforge/ui`: 484 / 485 passing, 1 skipped.
- `@dashforge/rbac`: 264 / 264 passing.

---

## Future migration guides

Each future breaking release will get its own section here, in reverse
chronological order. The general rule: if a release bumps the **minor**
component of a pre-1.0 version (e.g. `0.2.0` → `0.3.0`) it may contain
breaking changes — see this file. If only the patch / pre-release tag
moves (e.g. `0.2.0-beta` → `0.2.1-beta`), no migration is needed.
