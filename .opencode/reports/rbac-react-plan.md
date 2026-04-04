# RBAC React V1 — Architectural Plan

**Status**: Planning Phase (Revised)  
**Scope**: React Layer Only  
**Target**: libs/dashforge/rbac/src/react  
**Date**: 2026-04-04  
**Policy Reference**: .opencode/policies/rbac-v1.md  
**Foundation**: RBAC Core V1 (completed)  
**Last Revision**: 2026-04-04

---

## Revision Summary

This plan has been surgically revised to address 7 critical architectural issues:

1. **Context Value Reduced**: Removed `policy` from `RbacContextValue` - context now stores only `engine` and `subject`
2. **useRbac() API Tightened**: Removed raw `engine` from `UseRbacResult` in V1 - exposes only bound helpers (`can`, `evaluate`) and `subject`
3. **Null Subject Handling Revised**: Provider now normalizes `null`/`undefined` subject to anonymous subject with empty roles instead of throwing
4. **Request Object Stability Documented**: Explicitly documented that `useCan(request)` does NOT memoize the request object - caller must memoize if needed
5. **Can Component Request Construction Documented**: Explicitly documented that `<Can />` constructs request object during render (acceptable for V1, no memoization)
6. **useRbac() Memoization Made Explicit**: Added explicit requirement to use `useCallback` for bound helpers and `useMemo` for result object
7. **Error Philosophy Clarified**: Preserved fail-fast approach but added recommendation for app-level error boundaries, no local recovery in V1

---

## 1. File Structure

```
libs/dashforge/rbac/src/react/
├── index.ts                    # Public API exports
├── RbacContext.ts              # Context definition
├── RbacProvider.tsx            # Provider component
├── useRbac.ts                  # Core hook (engine access)
├── useCan.ts                   # Permission check hook
└── Can.tsx                     # Declarative permission component
```

### File Responsibilities

#### `index.ts`

- Re-exports all React layer public APIs
- No implementation code
- Clean separation from core exports

#### `RbacContext.ts`

- Defines `RbacContext` with React.createContext
- Defines context value type
- No provider implementation (lives in RbacProvider.tsx)

#### `RbacProvider.tsx`

- Implements provider component
- Manages engine lifecycle
- Handles subject/policy changes
- Minimal logic (delegates to core)

#### `useRbac.ts`

- Hook to access RBAC engine from context
- Returns subject-aware bound helpers
- Throws if used outside provider

#### `useCan.ts`

- Convenience hook for permission checks
- Returns boolean result
- Internally uses `useRbac()`

#### `Can.tsx`

- Declarative component for conditional rendering
- Uses `useCan()` internally
- Supports children and fallback

---

## 2. Core Design Decisions

### Decision 1: What is stored in context?

**Answer**: Store a **stable context value object** containing:

```typescript
interface RbacContextValue {
  engine: RbacEngine; // Core engine instance
  subject: Subject; // Current subject
}
```

**Rationale**:

- `engine`: Needed for all permission evaluations
- `subject`: Needed for bound helpers and to avoid prop drilling
- `policy` NOT included: Provider manages policy internally, context consumers don't need it

**Why policy is excluded**:

- Policy is only needed for engine recreation (internal provider concern)
- Consumers never read policy directly from context
- Including policy would cause unnecessary re-renders when policy changes
- Smaller context value = better performance

**Alternative considered**: Store only `engine`

- Rejected: Would require subject to be passed to every hook call, defeating convenience purpose

**Alternative considered**: Store bound `can()` function

- Rejected: Less flexible, harder to extend, loses access to `evaluate()` and other methods

**Alternative considered**: Include `policy` in context

- Rejected (V1 revision): Consumers don't need policy, creates unnecessary coupling

### Decision 2: How is engine lifecycle handled?

**Answer**: **Recreate engine when policy changes, keep stable when only subject changes**

**Strategy**:

1. Create engine once during initial mount using `createRbacEngine(policy)`
2. If `policy` reference changes → recreate engine (validates new policy)
3. If only `subject` changes → keep same engine instance
4. Use `useMemo` with `policy` as dependency

**Rationale**:

- Policy changes are rare (typically once at app boot)
- Subject changes are common (user login/logout, role changes)
- Engine creation validates policy (circular roles, malformed permissions)
- Avoids unnecessary validation on every subject change
- Minimizes re-renders

**Code pattern** (conceptual, not implementation):

```typescript
const engine = useMemo(() => createRbacEngine(policy), [policy]);
```

### Decision 3: What is the API of `RbacProvider`?

**Answer**:

```typescript
interface RbacProviderProps {
  policy: RbacPolicy;
  subject: Subject;
  children: React.ReactNode;
}
```

**Required props**:

- `policy`: RBAC policy (roles, permissions, inheritance)
- `subject`: Current authenticated subject (user)
- `children`: React children

**No optional props in V1**:

- No `engine` prop (provider creates it)
- No `onError` callback (errors throw)
- No `fallback` (provider has no loading state)

**Rationale**:

- Simple, predictable API
- Policy and subject are essential for all RBAC operations
- Provider is thin wrapper around core engine
- No async operations = no loading states
- Errors during engine creation should crash (fail-fast)

### Decision 4: What is the API of `useRbac()`?

**Answer**: Return **subject-aware bound helpers** (V1 scope)

```typescript
interface UseRbacResult {
  can: (request: AccessRequest) => boolean;
  evaluate: (request: AccessRequest) => AccessDecision;
  subject: Subject;
}
```

**Methods**:

- `can(request)`: Check permission (subject automatically bound)
- `evaluate(request)`: Get detailed decision (subject automatically bound)
- `subject`: Current subject (for reference)

**Rationale**:

- `can()` and `evaluate()` pre-bind subject, reducing boilerplate
- User doesn't need to pass subject on every call
- `subject` exposed for conditional logic based on user attributes
- Raw `engine` NOT exposed in V1 (keeps API surface minimal and focused)

**Memoization requirements** (explicit):

- Bound helpers MUST be memoized with `useCallback`
- Result object MUST be memoized with `useMemo`
- Dependencies: `[engine, subject]`

**Usage pattern**:

```typescript
const { can } = useRbac();
const canDelete = can({ action: 'delete', resource: 'booking' });
```

**Alternative considered**: Return only raw engine

- Rejected: Too verbose, defeats convenience purpose

**Alternative considered**: Return only `can()` function

- Rejected: Less discoverable, loses access to `evaluate()` and `subject`

**Alternative considered**: Expose raw `engine` in return value

- Rejected for V1: Keeps API minimal, avoids exposing internal core engine to consumers (can be added in V2 if needed for advanced use cases)

### Decision 5: What is the API of `useCan()`?

**Answer**: **Object input, returns primitive boolean**

```typescript
function useCan(request: AccessRequest): boolean;
```

**Input**: `AccessRequest` object

```typescript
{
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
}
```

**Output**: `boolean` (granted or denied)

**Rationale**:

- Object input is more extensible than positional args
- Matches core `AccessRequest` type exactly
- Returns primitive boolean (stable, no re-render issues)
- Simple mental model: "Can subject perform this request?"

**Request object stability** (explicit):

- `useCan()` does NOT memoize or stabilize the request object
- If request is constructed inline, it creates a new object every render
- Caller is responsible for memoizing request if needed
- Use `useMemo` to memoize request for performance-critical cases

**Usage pattern**:

```typescript
const canEdit = useCan({ action: 'edit', resource: 'booking' });
const canDelete = useCan({
  action: 'delete',
  resource: 'booking',
  resourceData: { ownerId: user.id },
});

// For performance-critical cases with dynamic data, memoize request:
const deleteRequest = useMemo(
  () => ({
    action: 'delete',
    resource: 'booking',
    resourceData: { ownerId: user.id },
  }),
  [user.id]
);
const canDelete = useCan(deleteRequest);
```

**Alternative considered**: Positional arguments `(action, resource, options?)`

- Rejected: Less extensible, doesn't match core types

**Alternative considered**: Return `AccessDecision` object

- Rejected: More re-renders (object identity changes), V1 doesn't need `reason` in UI

**How it accesses subject**: Internally calls `useRbac()` to get bound `can()`

### Decision 6: What is the API of `<Can />`?

**Answer**: **Action/resource props with children render**

```typescript
interface CanProps {
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}
```

**Props**:

- `action`: Required action string
- `resource`: Required resource string
- `resourceData`: Optional resource data (for conditions)
- `environment`: Optional environment context (for conditions)
- `fallback`: Optional fallback when denied (default: null)
- `children`: Content to render when granted

**Behavior**:

- If `can()` returns `true` → render `children`
- If `can()` returns `false` → render `fallback` (or null)
- Always renders synchronously (no Suspense)

**Request construction behavior** (explicit):

- `<Can />` constructs `AccessRequest` object during render from props
- New request object created on every render (no internal memoization in V1)
- This is acceptable for V1 - permission checks are fast (<1ms)
- Component re-renders trigger re-evaluation (desired behavior for props changes)
- No performance issues expected in typical usage

**Usage patterns**:

```typescript
// Simple case
<Can action="delete" resource="booking">
  <DeleteButton />
</Can>

// With fallback
<Can
  action="edit"
  resource="booking"
  fallback={<DisabledEditButton />}
>
  <EditButton />
</Can>

// With resource data
<Can
  action="delete"
  resource="booking"
  resourceData={{ ownerId: booking.ownerId }}
>
  <DeleteButton />
</Can>
```

**Rationale**:

- Simple, declarative API
- Matches React component patterns
- Props match `AccessRequest` exactly
- No render props complexity in V1
- Fallback covers common UX need (show disabled state)

**Alternative considered**: `request` object prop

- Rejected: Less declarative, harder to read in JSX

**Alternative considered**: Children as render function

- Rejected: Over-engineered for V1, adds complexity

**Alternative considered**: Multiple render modes (hidden/disabled/readonly)

- Rejected: Out of scope (belongs in Dashforge integration layer)

### Decision 7: How do we minimize re-renders?

**Strategy**: **Stable context value + primitive returns + memoization**

#### 7.1 Provider Level

- Memoize engine creation: `useMemo(() => createRbacEngine(policy), [policy])`
- Memoize context value: `useMemo(() => ({ engine, subject, policy }), [engine, subject, policy])`
- Only recreate when dependencies actually change

#### 7.2 Hook Level

- `useCan()` returns **primitive boolean** (stable by value)
- `useRbac()` returns **memoized object** with stable bound functions
- Use `useCallback` for bound `can()` and `evaluate()` helpers

#### 7.3 Component Level

- `<Can />` uses `useCan()` hook (already optimized)
- No internal state in `<Can />`
- React.memo not needed (renders are already controlled by permission check)

#### 7.4 What NOT to do

- ❌ Don't create new engine on every render
- ❌ Don't create new context value object on every render
- ❌ Don't return new objects from hooks unnecessarily
- ❌ Don't use React.memo prematurely (measure first)

**Expected re-render triggers**:

1. Subject changes (login/logout, role change) → context updates → consumers re-render
2. Policy changes (rare, typically app boot only) → engine recreates → consumers re-render
3. Parent component re-renders → `<Can />` re-evaluates permission

**Acceptable**: Re-renders when subject/policy change (necessary)
**Unacceptable**: Re-renders when unrelated context updates

### Decision 8: What are the expected edge cases?

#### Edge Case 1: No Provider (Missing Context)

**Scenario**: Hook called outside `<RbacProvider>`

**Behavior**: Throw helpful error

```typescript
if (!contextValue) {
  throw new Error(
    'useRbac must be used within RbacProvider. ' +
      'Wrap your component tree with <RbacProvider>.'
  );
}
```

**Rationale**: Fail-fast with clear message

#### Edge Case 2: Null Subject

**Scenario**: `subject={null}` or `subject={undefined}` passed to provider

**Behavior**: Normalize to anonymous subject with empty roles

```typescript
// Provider normalizes null/undefined to:
const normalizedSubject = subject ?? { id: 'anonymous', roles: [] };
```

**Rationale**:

- Supports unauthenticated/guest users at provider boundary
- Core engine handles empty roles correctly (denies all permissions)
- Simplifies app code (no need to conditionally render provider)
- Fail-fast only for truly invalid subjects (after normalization)

**Example usage**:

```typescript
// Before user login, subject can be null
<RbacProvider policy={policy} subject={currentUser}>
  {/* Works even when currentUser is null - treated as anonymous */}
  <App />
</RbacProvider>
```

#### Edge Case 3: Empty Roles

**Scenario**: `subject={{ id: '1', roles: [] }}`

**Behavior**: Allow (core handles correctly, denies all permissions)

**Rationale**: Valid state, core engine handles gracefully

#### Edge Case 4: Invalid Request Object

**Scenario**: `useCan({ action: '', resource: 'booking' })`

**Behavior**: Core engine throws (validation in `can()`)

**Rationale**: Let core handle validation, don't duplicate

#### Edge Case 5: Policy Validation Errors

**Scenario**: Policy has circular roles or malformed permissions

**Behavior**: Throw during engine creation (provider mount)

**Rationale**: Fail-fast, policy errors are configuration bugs

#### Edge Case 6: Subject Changes During Render

**Scenario**: Subject updated while component tree is rendering

**Behavior**: React batches state updates, re-renders with new subject

**Rationale**: Standard React behavior, no special handling needed

#### Edge Case 7: Unmounted Component Using Hook

**Scenario**: Component unmounts, cleanup needed?

**Behavior**: No cleanup needed (no subscriptions, no side effects)

**Rationale**: Hooks are pure, engine is stateless

---

## 3. Public API Specification

### 3.1 RbacProvider

```typescript
interface RbacProviderProps {
  policy: RbacPolicy;
  subject: Subject | null | undefined;
  children: React.ReactNode;
}

function RbacProvider(props: RbacProviderProps): JSX.Element;
```

**Requirements**:

- Create engine on mount using `createRbacEngine(policy)`
- Recreate engine when `policy` changes
- Update context when `subject` changes (without recreating engine)
- Normalize `null`/`undefined` subject to `{ id: 'anonymous', roles: [] }`
- Throw if `policy` is null/undefined
- Propagate core engine errors (validation)

### 3.2 useRbac

```typescript
interface UseRbacResult {
  can: (request: AccessRequest) => boolean;
  evaluate: (request: AccessRequest) => AccessDecision;
  subject: Subject;
}

function useRbac(): UseRbacResult;
```

**Requirements**:

- Throw if called outside `RbacProvider`
- Return bound `can()` that automatically passes subject
- Return bound `evaluate()` that automatically passes subject
- Return current `subject` for reference
- Memoize bound helpers with `useCallback`
- Memoize returned object with `useMemo` to avoid unnecessary re-renders
- Dependencies: `[engine, subject]`

### 3.3 useCan

```typescript
function useCan(request: AccessRequest): boolean;
```

**Requirements**:

- Accept `AccessRequest` object
- Return primitive boolean
- Internally use `useRbac()` to get bound `can()`
- Throw if called outside `RbacProvider` (via `useRbac()`)
- No memoization needed (returns primitive)

### 3.4 Can Component

```typescript
interface CanProps {
  action: string;
  resource: string;
  resourceData?: unknown;
  environment?: Record<string, unknown>;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

function Can(props: CanProps): JSX.Element | null;
```

**Requirements**:

- Construct `AccessRequest` from props during render
- Call `useCan()` with request
- If `true` → render `children`
- If `false` → render `fallback` or `null`
- No internal state
- No effects
- Synchronous rendering only
- No request memoization in V1 (acceptable, checks are fast)

---

## 4. Provider & Context Lifecycle Design

### 4.1 Initial Mount

```
1. RbacProvider receives props: { policy, subject, children }
2. Normalize subject: subject ?? { id: 'anonymous', roles: [] }
3. Create engine: createRbacEngine(policy)
   - This validates policy (circular roles, malformed permissions)
   - If validation fails, error propagates (component crashes)
4. Create context value: { engine, subject: normalizedSubject }
5. Render children with context
```

### 4.2 Subject Change

```
1. Provider receives new subject prop
2. Normalize subject: subject ?? { id: 'anonymous', roles: [] }
3. Engine instance remains the same (no recreation)
4. Create new context value: { engine, subject: normalizedSubject }
5. Context consumers re-render with new subject
6. Permission checks use new subject automatically
```

### 4.3 Policy Change

```
1. Provider receives new policy prop
2. Recreate engine: createRbacEngine(newPolicy)
   - Validates new policy
   - If validation fails, error propagates
3. Create new context value: { engine, subject: normalizedSubject }
4. Context consumers re-render with new engine
5. Permission checks use new policy
```

### 4.4 Unmount

```
1. Provider unmounts
2. No cleanup needed (engine is stateless, no subscriptions)
3. Context consumers unmount naturally
```

### 4.5 Memoization Strategy

**Engine**:

```typescript
const engine = useMemo(() => createRbacEngine(policy), [policy]);
```

**Context Value**:

```typescript
const contextValue = useMemo(
  () => ({ engine, subject: normalizedSubject }),
  [engine, normalizedSubject]
);
```

**Why separate memos**:

- Engine creation is expensive (validation)
- Context value is cheap (object creation)
- Different dependency arrays (engine only depends on policy)
- Subject normalization happens before context value creation

---

## 5. Hook Contract Details

### 5.1 useRbac() Implementation Contract

**Inputs**: None (reads from context)

**Outputs**:

```typescript
{
  can: (request: AccessRequest) => boolean,
  evaluate: (request: AccessRequest) => AccessDecision,
  subject: Subject
}
```

**Behavior**:

1. Call `useContext(RbacContext)`
2. If context is `null` → throw error
3. Extract `{ engine, subject }` from context
4. Create bound helpers using `useCallback`:
   - `can: (request) => engine.can(subject, request)`
   - `evaluate: (request) => engine.evaluate(subject, request)`
5. Memoize result object with `useMemo` and dependencies `[can, evaluate, subject]`
6. Return memoized object

**Error cases**:

- No provider → throw `'useRbac must be used within RbacProvider'`

**Re-render behavior**:

- Re-renders when `engine` or `subject` changes (via context)
- Does not re-render when unrelated context updates

### 5.2 useCan() Implementation Contract

**Inputs**: `AccessRequest` object

**Outputs**: `boolean`

**Behavior**:

1. Call `useRbac()` to get bound `can()`
2. Call `can(request)`
3. Return boolean result

**Error cases**:

- No provider → propagates error from `useRbac()`
- Invalid request → propagates error from core engine

**Re-render behavior**:

- Re-renders when `useRbac()` result changes
- Returns primitive boolean (stable by value)

**Dependencies**: Result depends on `[engine, subject, request]`

**Note**: No memoization needed since it returns a primitive

---

## 6. Can Component Contract Details

### 6.1 Props Contract

```typescript
interface CanProps {
  action: string; // Required
  resource: string; // Required
  resourceData?: unknown; // Optional
  environment?: Record<string, unknown>; // Optional
  fallback?: React.ReactNode; // Optional (default: null)
  children: React.ReactNode; // Required
}
```

### 6.2 Behavior Contract

**Evaluation**:

1. Construct request: `{ action, resource, resourceData, environment }`
2. Call `useCan(request)` → boolean
3. If `true` → render `children`
4. If `false` → render `fallback ?? null`

**Rendering**:

- Always synchronous (no Suspense)
- No loading states
- No error boundaries needed (errors throw)

**Children handling**:

- V1: Children must be `ReactNode` (simple rendering)
- V1: No render prop pattern
- V1: No function-as-child

**Fallback handling**:

- Default: `null` (nothing rendered)
- If provided: Render `fallback` when denied
- Fallback can be any `ReactNode`

### 6.3 Example Behaviors

```typescript
// Granted → render button
<Can action="delete" resource="booking">
  <button>Delete</button>
</Can>
// Result: <button>Delete</button>

// Denied, no fallback → render null
<Can action="admin" resource="settings">
  <button>Admin</button>
</Can>
// Result: null

// Denied, with fallback → render fallback
<Can action="edit" resource="booking" fallback={<span>No access</span>}>
  <button>Edit</button>
</Can>
// Result: <span>No access</span>

// With condition via resourceData
<Can
  action="delete"
  resource="booking"
  resourceData={{ ownerId: currentUser.id }}
>
  <button>Delete Own Booking</button>
</Can>
// Result: Depends on condition evaluation
```

---

## 7. Re-render Minimization Strategy

### 7.1 Provider Optimizations

**Engine Stability**:

- ✅ Create engine once with `useMemo(() => createRbacEngine(policy), [policy])`
- ✅ Only recreate when policy reference changes
- ✅ Policy changes should be rare (typically once at boot)

**Context Value Stability**:

- ✅ Memoize context value with `useMemo(() => ({ engine, subject: normalizedSubject }), [engine, normalizedSubject])`
- ✅ Only update when actual dependencies change
- ✅ Avoid inline object creation in render

**What to Avoid**:

- ❌ Don't recreate engine on every render
- ❌ Don't create new context value object on every render
- ❌ Don't pass inline objects/functions as context value

### 7.2 Hook Optimizations

**useRbac() Optimizations** (explicit requirements):

- ✅ MUST memoize bound helper functions with `useCallback`
- ✅ MUST memoize result object with `useMemo`
- ✅ Dependencies for callbacks: `[engine, subject]`
- ✅ Dependencies for result object: `[can, evaluate, subject]`

**Example implementation pattern** (conceptual):

```typescript
const can = useCallback(
  (request: AccessRequest) => engine.can(subject, request),
  [engine, subject]
);

const evaluate = useCallback(
  (request: AccessRequest) => engine.evaluate(subject, request),
  [engine, subject]
);

return useMemo(() => ({ can, evaluate, subject }), [can, evaluate, subject]);
```

**useCan() Optimizations**:

- ✅ Returns primitive boolean (inherently stable)
- ✅ No memoization needed for primitive return values
- ✅ Component re-renders only when result changes

**What to Avoid**:

- ❌ Don't return new objects from hooks unnecessarily
- ❌ Don't use `useMemo` for primitives (no benefit)
- ❌ Don't over-memoize (measure first)

### 7.3 Component Optimizations

**Can Component**:

- ✅ No internal state (stateless functional component)
- ✅ Uses `useCan()` hook (already optimized)
- ✅ React.memo NOT needed initially (measure first)

**Why React.memo may not be needed**:

- Component already only re-renders when permission result changes
- Parent re-renders will trigger re-evaluation anyway (desired behavior)
- Premature optimization adds complexity

**When to add React.memo**:

- If profiling shows unnecessary re-renders
- If children are expensive to render
- If permission check is constant across re-renders

### 7.4 Expected Re-render Patterns

**Scenario 1: Subject changes (login/logout)**

```
Subject changes → Provider updates → Context updates → All consumers re-render
Expected: YES (necessary, permission results may change)
```

**Scenario 2: Policy changes (rare)**

```
Policy changes → Engine recreates → Context updates → All consumers re-render
Expected: YES (necessary, permissions changed)
```

**Scenario 3: Parent component re-renders**

```
Parent re-renders → <Can /> re-renders → useCan() re-evaluates
Expected: YES (acceptable, permission result is memoized)
```

**Scenario 4: Unrelated context updates**

```
Some other context updates → RBAC consumers should NOT re-render
Expected: NO (context value is stable)
```

### 7.5 Performance Targets

- Provider re-renders only when `policy` or `subject` change
- Hook consumers re-render only when their permission results change
- No re-renders from object identity changes
- Evaluation performance: <1ms per permission check (inherited from core)

---

## 8. Error & Failure Behavior

### 8.1 Provider Errors

**Error 1: Missing subject** (revised behavior)

```typescript
<RbacProvider policy={policy} subject={null}>
```

**Behavior**: Normalize to anonymous subject `{ id: 'anonymous', roles: [] }`
**Message**: No error thrown (valid use case for unauthenticated users)
**Recovery**: Not needed (normalized automatically)

**Error 2: Missing policy**

```typescript
<RbacProvider subject={subject} policy={null}>
```

**Behavior**: Throw error at provider mount
**Message**: TypeScript error (policy is required)
**Recovery**: None (crash, fix at call site)

**Error 3: Invalid policy (circular roles)**

```typescript
<RbacProvider policy={policyWithCircularRoles} subject={subject}>
```

**Behavior**: Throw `CircularRoleError` during engine creation
**Message**: `'Circular role inheritance detected: ...'`
**Recovery**: None (crash, fix policy)

**Error 4: Invalid policy (malformed permissions)**

```typescript
<RbacProvider policy={policyWithEmptyAction} subject={subject}>
```

**Behavior**: Throw `InvalidPermissionError` during engine creation
**Message**: `'Invalid permission: action must be a non-empty string'`
**Recovery**: None (crash, fix policy)

### 8.2 Hook Errors

**Error 1: useRbac() outside provider**

```typescript
// No <RbacProvider> in tree
const { can } = useRbac();
```

**Behavior**: Throw `Error`
**Message**: `'useRbac must be used within RbacProvider. Wrap your component tree with <RbacProvider>.'`
**Recovery**: None (crash, add provider)

**Error 2: useCan() outside provider**

```typescript
// No <RbacProvider> in tree
const canEdit = useCan({ action: 'edit', resource: 'booking' });
```

**Behavior**: Throw `Error` (propagated from `useRbac()`)
**Message**: Same as Error 1
**Recovery**: None (crash, add provider)

**Error 3: Invalid request in useCan()**

```typescript
const canEdit = useCan({ action: '', resource: 'booking' });
```

**Behavior**: Throw `RbacError` from core engine
**Message**: `'Request.action must be a string'`
**Recovery**: None (crash, fix request)

### 8.3 Component Errors

**Error 1: <Can /> outside provider**

```typescript
// No <RbacProvider> in tree
<Can action="edit" resource="booking">
  <button>Edit</button>
</Can>
```

**Behavior**: Throw `Error` (propagated from `useCan()`)
**Message**: `'useRbac must be used within RbacProvider...'`
**Recovery**: None (crash, add provider)

**Error 2: Missing required props**

```typescript
<Can resource="booking">
  <button>Edit</button>
</Can>
```

**Behavior**: TypeScript error (action is required)
**Message**: Compile-time error
**Recovery**: Fix at compile time

### 8.4 Error Handling Philosophy

**Fail-Fast**:

- All configuration errors throw immediately
- No silent failures
- No fallback behaviors for invalid configuration
- Clear error messages

**Error Boundaries** (V1 recommendation):

- React layer does not provide error boundaries
- Errors propagate to app-level boundary
- **Recommended**: Wrap `<RbacProvider>` in app-level error boundary
- **Reason**: Policy validation errors, circular roles, etc. should be caught at app level
- Users can implement custom error recovery if needed

**Example recommended pattern**:

```typescript
<AppErrorBoundary>
  <RbacProvider policy={policy} subject={subject}>
    <App />
  </RbacProvider>
</AppErrorBoundary>
```

**No Retry Logic**:

- Errors are configuration bugs (policy, invalid requests)
- Retrying won't fix them
- User must fix at source

**Validation Timing**:

- Policy validated at provider mount (engine creation)
- Subject normalized at provider mount (null → anonymous)
- Request validated at evaluation time (core engine)

**No Local Recovery in V1**:

- Components don't catch or recover from RBAC errors
- All errors throw and propagate
- Recovery is app-level concern, not library concern

---

## 9. What is Excluded from V1 React Layer

### 9.1 Advanced Features (V2 Candidates)

**NOT Included**:

- ❌ Render props pattern for `<Can />`
- ❌ Function-as-child for `<Can />`
- ❌ Selector system for granular subscriptions
- ❌ `usePermissions()` hook returning all effective permissions
- ❌ `useRoles()` hook returning subject roles
- ❌ `useSubject()` hook returning current subject
- ❌ Multiple simultaneous subjects
- ❌ Subject switching utilities
- ❌ Permission caching beyond engine instance stability
- ❌ Debug mode or dev tools
- ❌ Permission change subscriptions
- ❌ Optimistic permission updates
- ❌ SSR-specific APIs
- ❌ Concurrent React features (Suspense, transitions)

**Rationale**: V1 focuses on core functionality. These can be added in V2 if needed.

### 9.2 Async Features

**NOT Included**:

- ❌ Async permission checks
- ❌ Suspense integration
- ❌ Loading states
- ❌ Async policy loading
- ❌ Async subject fetching

**Rationale**: RBAC V1 is synchronous by policy. Async is V2+.

### 9.3 UI/UX Features

**NOT Included**:

- ❌ Permission debug panel
- ❌ Visual permission viewer
- ❌ Role inspector
- ❌ Permission tree visualization
- ❌ Access denied toast/modal
- ❌ Redirect on denied

**Rationale**: These belong in Dashforge integration layer, not React layer.

### 9.4 Optimization Theater

**NOT Included**:

- ❌ Automatic permission result caching
- ❌ Request deduplication
- ❌ Batch permission checks
- ❌ Worker thread evaluation
- ❌ Virtualization support

**Rationale**: Core engine is already fast (<1ms). Premature optimization.

### 9.5 Developer Experience

**NOT Included in V1**:

- ❌ DevTools integration
- ❌ Time-travel debugging
- ❌ Permission usage analytics
- ❌ Hot reloading support
- ❌ Error recovery suggestions

**Rationale**: Nice-to-have, not essential for V1.

### 9.6 Integration Features

**NOT Included** (these belong in Dashforge layer):

- ❌ Route protection HOC/component
- ❌ Navigation item filtering
- ❌ Button/TextField integration
- ❌ Form field access control
- ❌ Action menu filtering

**Rationale**: React layer is framework-agnostic. Dashforge integration is separate layer.

---

## 10. Testing Strategy

### 10.1 Test Files Structure

```
libs/dashforge/rbac/src/react/__tests__/
├── RbacProvider.test.tsx       # Provider lifecycle, errors
├── useRbac.test.tsx            # Hook behavior, errors
├── useCan.test.tsx             # Permission check hook
├── Can.test.tsx                # Component rendering
└── integration.test.tsx        # Full React layer integration
```

### 10.2 RbacProvider Tests

**Test Categories**:

1. **Basic rendering**

   - Renders children when valid props provided
   - Provides context to children

2. **Engine lifecycle**

   - Creates engine on mount
   - Recreates engine when policy changes
   - Does NOT recreate engine when only subject changes
   - Engine is memoized correctly

3. **Context value**

   - Context value contains engine and subject (not policy)
   - Context value is stable when dependencies don't change
   - Context value updates when dependencies change

4. **Subject normalization**

   - Normalizes null to anonymous subject `{ id: 'anonymous', roles: [] }`
   - Normalizes undefined to anonymous subject
   - Passes through valid subject unchanged

5. **Error handling**

   - Throws when policy is null
   - Throws when policy is invalid (circular roles)
   - Throws when policy is invalid (malformed permissions)

6. **Props updates**
   - Updates context when subject changes
   - Updates context when policy changes
   - Children re-render with new context

**Test Count Estimate**: ~18 tests

### 10.3 useRbac Tests

**Test Categories**:

1. **Basic usage**

   - Returns bound can() function
   - Returns bound evaluate() function
   - Returns current subject
   - Does NOT return raw engine (V1 scope)

2. **Bound helpers**

   - can() automatically passes subject
   - evaluate() automatically passes subject
   - can() returns correct boolean
   - evaluate() returns correct decision

3. **Memoization**

   - Bound helpers are memoized with useCallback
   - Result object is memoized with useMemo
   - Result is stable when dependencies don't change

4. **Error handling**

   - Throws when used outside provider
   - Error message is helpful

5. **Re-render behavior**

   - Result is stable when dependencies don't change
   - Result updates when subject changes
   - Result updates when engine changes

6. **Integration with core**
   - can() delegates to engine.can()
   - evaluate() delegates to engine.evaluate()

**Test Count Estimate**: ~14 tests

### 10.4 useCan Tests

**Test Categories**:

1. **Basic usage**

   - Returns true when permission granted
   - Returns false when permission denied
   - Accepts full AccessRequest object

2. **Request variations**

   - Works with action and resource only
   - Works with resourceData
   - Works with environment
   - Works with all fields

3. **Request object handling**

   - Does NOT memoize request internally
   - Re-evaluates on every call with new request object
   - Caller can memoize request for performance

4. **Error handling**

   - Throws when used outside provider
   - Throws when request is invalid

5. **Subject binding**

   - Automatically uses subject from context
   - Updates result when subject changes

6. **Integration**
   - Works with complex policies
   - Works with conditions
   - Works with role inheritance

**Test Count Estimate**: ~12 tests

### 10.5 Can Component Tests

**Test Categories**:

1. **Basic rendering**

   - Renders children when permission granted
   - Renders null when permission denied (no fallback)
   - Renders fallback when permission denied (with fallback)

2. **Props handling**

   - Accepts action and resource
   - Accepts resourceData
   - Accepts environment
   - Accepts fallback

3. **Request construction**

   - Constructs request from props during render
   - Does NOT memoize request internally (V1)
   - Re-constructs request on every render

4. **Error handling**

   - Throws when used outside provider
   - Throws when action is missing
   - Throws when resource is missing

5. **Re-render behavior**

   - Re-evaluates permission on props change
   - Re-evaluates permission on subject change
   - Does not re-render unnecessarily

6. **Edge cases**
   - Works with null children (when granted)
   - Works with fragment children
   - Works with multiple children
   - Works with nested Can components

**Test Count Estimate**: ~14 tests

### 10.6 Integration Tests

**Test Categories**:

1. **Full flow**

   - Provider → useRbac → permission check
   - Provider → useCan → boolean result
   - Provider → Can component → conditional render

2. **Subject changes**

   - Login/logout flow
   - Role changes propagate
   - All consumers update correctly

3. **Policy changes**

   - Policy update recreates engine
   - All consumers update correctly

4. **Complex scenarios**

   - Multiple Can components with different permissions
   - Nested Can components
   - Can component with useCan hook in same tree

5. **Real-world patterns**
   - Admin vs user permissions
   - Ownership-based permissions (conditions)
   - Wildcard permissions

**Test Count Estimate**: ~10 tests

### 10.7 Testing Utilities Needed

**Helpers to create**:

1. `renderWithRbac(component, { policy, subject })` - Wrapper for tests
2. `createTestPolicy()` - Factory for test policies
3. `createTestSubject()` - Factory for test subjects

**Example**:

```typescript
function renderWithRbac(
  ui: React.ReactElement,
  options: { policy: RbacPolicy; subject: Subject }
) {
  return render(
    <RbacProvider policy={options.policy} subject={options.subject}>
      {ui}
    </RbacProvider>
  );
}
```

### 10.8 Coverage Requirements

**Target Coverage**:

- Statement coverage: >95%
- Branch coverage: >90%
- Function coverage: 100%

**Critical paths to cover**:

- ✅ All error cases
- ✅ All prop combinations for Can component
- ✅ Subject/policy change scenarios
- ✅ Engine lifecycle transitions
- ✅ Hook usage outside provider
- ✅ Integration with core engine

### 10.9 Test Execution Strategy

**Order**:

1. Write RbacProvider tests first (foundation)
2. Write useRbac tests second (core hook)
3. Write useCan tests third (convenience hook)
4. Write Can component tests fourth (UI layer)
5. Write integration tests last (full stack)

**TDD discipline**:

- Tests MUST be written before implementation
- All tests must pass before moving to next component
- 0 skipped tests allowed

**Total Estimated Tests**: ~68 tests (revised after detailed categorization)

---

## 11. Implementation Checklist

Before implementation begins:

### 11.1 Prerequisites

- [x] RBAC Core V1 completed and tested
- [ ] Review this plan with stakeholders
- [ ] Confirm API design is acceptable
- [ ] Confirm error handling strategy is acceptable

### 11.2 Dependencies

- React (peer dependency, version TBD)
- @dashforge/rbac (core, already built)

### 11.3 Implementation Order

**Phase 1: Foundation**

1. [ ] Create react/ directory structure
2. [ ] Implement RbacContext.ts (types only)
3. [ ] Write RbacProvider tests
4. [ ] Implement RbacProvider.tsx

**Phase 2: Hooks** 5. [ ] Write useRbac tests 6. [ ] Implement useRbac.ts 7. [ ] Write useCan tests 8. [ ] Implement useCan.ts

**Phase 3: Component** 9. [ ] Write Can component tests 10. [ ] Implement Can.tsx

**Phase 4: Integration** 11. [ ] Write integration tests 12. [ ] Implement react/index.ts (exports) 13. [ ] Update main index.ts to export React layer

**Phase 5: Verification** 14. [ ] Run full typecheck: 0 errors 15. [ ] Run full test suite: all pass, 0 skipped 16. [ ] Verify coverage targets met 17. [ ] Manual smoke test with example app

---

## 12. API Summary

### 12.1 Exports from `@dashforge/rbac/react`

```typescript
// Provider
export { RbacProvider } from './react/RbacProvider';

// Hooks
export { useRbac } from './react/useRbac';
export { useCan } from './react/useCan';

// Component
export { Can } from './react/Can';

// Types (for advanced usage)
export type { RbacContextValue } from './react/RbacContext';
export type { RbacProviderProps } from './react/RbacProvider';
export type { UseRbacResult } from './react/useRbac';
export type { CanProps } from './react/Can';
```

### 12.2 Complete Usage Example

```typescript
import { createRbacEngine } from '@dashforge/rbac';
import { RbacProvider, useRbac, useCan, Can } from '@dashforge/rbac/react';

// Define policy
const policy = {
  roles: [
    {
      name: 'admin',
      permissions: [{ action: '*', resource: '*' }],
    },
    {
      name: 'user',
      permissions: [
        { action: 'read', resource: 'booking' },
        {
          action: 'delete',
          resource: 'booking',
          condition: (ctx) => {
            const data = ctx.resourceData as { ownerId: string };
            return data.ownerId === ctx.subject.id;
          },
        },
      ],
    },
  ],
};

// App setup
function App() {
  const [currentUser] = useState({
    id: 'user-1',
    roles: ['user'],
  });

  return (
    <RbacProvider policy={policy} subject={currentUser}>
      <Dashboard />
    </RbacProvider>
  );
}

// Component using useRbac
function Dashboard() {
  const { can, subject } = useRbac();

  return (
    <div>
      <h1>Welcome, {subject.id}</h1>
      {can({ action: 'read', resource: 'booking' }) && <BookingList />}
    </div>
  );
}

// Component using useCan
function BookingItem({ booking }) {
  const canDelete = useCan({
    action: 'delete',
    resource: 'booking',
    resourceData: { ownerId: booking.ownerId },
  });

  return (
    <div>
      <h3>{booking.name}</h3>
      {canDelete && <button>Delete</button>}
    </div>
  );
}

// Component using Can
function BookingActions({ booking }) {
  return (
    <>
      <Can action="read" resource="booking">
        <button>View</button>
      </Can>

      <Can
        action="edit"
        resource="booking"
        resourceData={{ ownerId: booking.ownerId }}
        fallback={<button disabled>Edit (No Access)</button>}
      >
        <button>Edit</button>
      </Can>

      <Can
        action="delete"
        resource="booking"
        resourceData={{ ownerId: booking.ownerId }}
      >
        <button>Delete</button>
      </Can>
    </>
  );
}
```

---

## 13. Design Principles Summary

### 13.1 Core Principles

1. **Thin Wrapper**: React layer is a thin adapter over core engine
2. **No Logic Duplication**: All permission logic stays in core
3. **Fail-Fast**: Configuration errors throw immediately with clear messages
4. **Synchronous Only**: No async, no Suspense, no loading states
5. **Stable References**: Minimize re-renders through explicit memoization
6. **Framework Agnostic**: No Dashforge coupling in React layer
7. **Minimal API Surface** (V1): Expose only essential methods, raw engine access deferred to V2

### 13.2 Key Constraints

- ✅ Provider creates and manages engine lifecycle
- ✅ Provider normalizes null/undefined subject to anonymous with empty roles
- ✅ Context stores only engine and subject (not policy)
- ✅ Hooks bind subject automatically (convenience)
- ✅ useRbac() exposes bound helpers only (no raw engine in V1)
- ✅ useRbac() MUST use useCallback and useMemo explicitly
- ✅ useCan() does NOT memoize request object (caller's responsibility)
- ✅ Can component constructs request during render (no internal memoization)
- ✅ Component renders synchronously (no Suspense)
- ✅ Engine recreated only when policy changes
- ✅ Context value stable when dependencies stable
- ✅ Primitive returns for hooks (avoid re-render issues)
- ✅ App-level error boundaries recommended (no local recovery)

### 13.3 Non-Goals for V1

- ❌ No render props complexity
- ❌ No async permission loading
- ❌ No debug panel
- ❌ No Dashforge integration
- ❌ No optimization theater
- ❌ No speculative abstractions

---

## 14. Success Criteria

### 14.1 Functional Requirements

- ✅ Provider manages engine lifecycle correctly
- ✅ Hooks provide convenient access to permissions
- ✅ Can component renders conditionally based on permissions
- ✅ Subject changes propagate to all consumers
- ✅ Policy changes recreate engine and propagate
- ✅ All errors fail fast with clear messages

### 14.2 Performance Requirements

- ✅ Provider re-renders only when policy or subject change
- ✅ Hooks return stable references when possible
- ✅ No unnecessary re-renders from object identity changes
- ✅ Permission checks remain <1ms (inherited from core)

### 14.3 Code Quality Requirements

- ✅ TypeScript strict mode with 0 errors
- ✅ Test coverage >95% statements, >90% branches
- ✅ All tests pass, 0 skipped
- ✅ No `any` types
- ✅ No `as` casts
- ✅ No console.log statements

### 14.4 Documentation Requirements

- ✅ All public APIs have JSDoc comments
- ✅ Props have clear descriptions
- ✅ Error messages are actionable
- ✅ Examples in this plan are accurate

---

**END OF PLAN**

---

**Next Steps:**

1. Review this plan
2. Get approval
3. Begin TDD implementation following Phase order
4. Create React layer following this architectural design

**Estimated Implementation Time:** 3-4 hours (React layer only, excluding Dashforge integration)
