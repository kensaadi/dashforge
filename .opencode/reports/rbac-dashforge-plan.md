# RBAC Dashforge Integration Layer V1 — Architectural Plan (REVISED)

**Status**: Planning Phase (Revised)  
**Scope**: Dashforge Integration Layer Only  
**Target**: libs/dashforge/rbac/src/dashforge  
**Date**: 2026-04-04 (Revised: 2026-04-04)  
**Policy Reference**: .opencode/policies/rbac-v1.md  
**Foundation**: RBAC Core V1 (complete), RBAC React V1 (complete)

---

## Revision Summary

This plan has been surgically revised to address critical architectural issues:

1. **Removed duplicated unauthorized behavior ownership** - `UnauthorizedBehavior` now has single source of truth inside `AccessRequirement` only. No component-level `onUnauthorized` props.

2. **Removed 'show' from UnauthorizedBehavior** - V1 supports only `hide`, `disable`, and `readonly`. The `show` mode created semantic ambiguity and is removed.

3. **Decoupled route guard from router-specific redirect** - Route guard now accepts only `ReactNode` fallback. No built-in redirect implementation. Redirect is app/router responsibility.

4. **Removed automatic navigation child promotion** - If parent access fails, entire subtree is removed. No magical child promotion in V1.

5. **Clarified filterActions behavior** - Explicitly documented that `filterActions()` is hide-only. Disable/readonly modes are ignored by this utility in V1.

6. **Aligned action naming with core semantics** - Examples now use canonical actions (`read`, `create`, `update`, `delete`, `manage`) instead of UI synonyms like `view`/`edit`.

7. **Renamed route guard API** - Changed from `createRouteGuard` to `createAccessGuard` for clearer RBAC semantics.

All changes preserve the core principle: **RBAC core decides, Dashforge executes.**

---

## Executive Summary

This plan defines the Dashforge integration layer for RBAC V1. This layer connects the standalone RBAC core/react layers to Dashforge-specific frontend concerns (routing, navigation, actions, component access).

**Core Principle**: The RBAC core/react layers remain framework-agnostic. The Dashforge layer consumes them and provides integration utilities specific to Dashforge's architecture.

**Key Design Decisions**:

1. Access states (visible/hidden/disabled/readonly) are resolved centrally
2. Navigation and action filtering are declarative utilities
3. Route guards are React-oriented but not framework-locked
4. Component integration is prop-based, not wrapped
5. RBAC and visibleWhen remain strictly separate concerns

---

## 1. File Structure

### Proposed Files

```
libs/dashforge/rbac/src/dashforge/
├── index.ts                        # Public API exports
├── types.ts                        # Dashforge-specific types
├── resolve-access-state.ts         # Central access state resolver
├── filter-navigation-items.ts      # Navigation filtering utility
├── filter-actions.ts               # Action filtering utility
├── create-access-guard.tsx         # Access guard factory (route protection)
└── __tests__/
    ├── resolve-access-state.spec.ts
    ├── filter-navigation-items.spec.ts
    ├── filter-actions.spec.ts
    └── create-access-guard.spec.tsx
```

### File Responsibilities

#### `index.ts`

- Re-exports all public APIs from Dashforge integration layer
- No implementation code
- Clean separation from core/react exports

#### `types.ts`

- Defines `AccessRequirement` type
- Defines `AccessState` type
- Defines `UnauthorizedBehavior` type
- Defines `NavigationItem` type (Dashforge-specific shape)
- Defines `ActionItem` type (Dashforge-specific shape)
- Defines `AccessGuardConfig` type
- All types are Dashforge-specific, not RBAC core types

#### `resolve-access-state.ts`

- Single responsibility: Map RBAC decision to UI access state
- Pure function, no side effects
- Deterministic output for given input
- Exported: `resolveAccessState(requirement, canCheck)`

#### `filter-navigation-items.ts`

- Single responsibility: Filter navigation items by access
- Handles nested items recursively
- Removes entire subtree if parent access fails (no child promotion)
- Exported: `filterNavigationItems(items, canCheck)`

#### `filter-actions.ts`

- Single responsibility: Filter action items by access
- Flat list filtering (actions don't nest)
- Hide-only in V1 (ignores disable/readonly modes)
- Exported: `filterActions(actions, canCheck)`

#### `create-access-guard.tsx`

- Single responsibility: Create route/page protection component
- React-oriented but not tied to specific routing library
- ReactNode fallback only (no built-in redirect)
- Exported: `createAccessGuard(config)` → returns guard component

---

## 2. Access Model

### 2.1 AccessRequirement Type

```typescript
/**
 * AccessRequirement defines what permission is needed for a UI element.
 *
 * This is Dashforge's extension of the core AccessRequest type.
 *
 * IMPORTANT: onUnauthorized is the SINGLE source of truth for
 * unauthorized behavior. Components must NOT introduce duplicate
 * unauthorized behavior props.
 */
interface AccessRequirement {
  /**
   * Action required (e.g., 'read', 'create', 'update', 'delete', 'manage')
   */
  action: string;

  /**
   * Resource being accessed (e.g., 'booking', 'user', 'settings')
   */
  resource: string;

  /**
   * Optional resource-specific data for conditions
   */
  resourceData?: unknown;

  /**
   * Optional environment context for conditions
   */
  environment?: Record<string, unknown>;

  /**
   * What to do when access is denied
   * Default: 'hide'
   *
   * This is the ONLY place unauthorized behavior is defined.
   * Components consume this value; they do NOT override it.
   */
  onUnauthorized?: UnauthorizedBehavior;
}
```

**Rationale**:

- `action` and `resource` match core RBAC `AccessRequest`
- `resourceData` and `environment` match core for condition support
- `onUnauthorized` is Dashforge-specific (UI concern)
- Single source of truth for unauthorized behavior (no component-level overrides)

### 2.2 UnauthorizedBehavior Type

```typescript
/**
 * UnauthorizedBehavior defines what happens when access is denied.
 *
 * V1 supports three modes only. The 'show' mode is excluded because
 * it creates semantic ambiguity (access denied but rendered normally).
 */
type UnauthorizedBehavior =
  | 'hide' // Element not rendered (default, secure by default)
  | 'disable' // Element rendered but disabled (if applicable)
  | 'readonly'; // Element rendered but read-only (if applicable)
```

**Rationale**:

- `hide`: Most common case - don't show unauthorized elements (default)
- `disable`: For cases where user should see option but can't use it
- `readonly`: For form fields where user can see value but not edit
- **Removed `show`**: Creates ambiguity; access is denied but element appears normal. If custom unauthorized UX is needed, use explicit access checks, not 'show' mode.

### 2.3 AccessState Type

```typescript
/**
 * AccessState is the resolved UI state for a component.
 */
interface AccessState {
  /**
   * Whether the element should be visible
   */
  visible: boolean;

  /**
   * Whether the element should be disabled (if visible)
   */
  disabled: boolean;

  /**
   * Whether the element should be read-only (if visible)
   */
  readonly: boolean;

  /**
   * The original access decision from RBAC
   */
  granted: boolean;
}
```

**Rationale**:

- `visible`: Controls rendering (most critical)
- `disabled`: Controls interactivity (for buttons, inputs)
- `readonly`: Controls editability (for form fields)
- `granted`: Original RBAC decision (for debugging/custom logic)

---

## 3. Access State Resolution Algorithm

### 3.1 Central Resolution Function

```typescript
/**
 * Resolves RBAC permission decision to UI access state.
 *
 * This is the single source of truth for mapping RBAC decisions
 * to Dashforge UI states.
 */
function resolveAccessState(
  requirement: AccessRequirement,
  canCheck: (request: AccessRequest) => boolean
): AccessState;
```

### 3.2 Resolution Algorithm

**Inputs**:

1. `requirement: AccessRequirement` - what access is needed
2. `canCheck: (request) => boolean` - RBAC permission checker

**Algorithm**:

```
Step 1: Check RBAC permission
  granted = canCheck({
    action: requirement.action,
    resource: requirement.resource,
    resourceData: requirement.resourceData,
    environment: requirement.environment
  })

Step 2: Determine behavior
  behavior = requirement.onUnauthorized ?? 'hide'

Step 3: Resolve states
  if granted:
    return {
      visible: true,
      disabled: false,
      readonly: false,
      granted: true
    }

  if behavior === 'hide':
    return {
      visible: false,
      disabled: false,
      readonly: false,
      granted: false
    }

  if behavior === 'disable':
    return {
      visible: true,
      disabled: true,
      readonly: false,
      granted: false
    }

  if behavior === 'readonly':
    return {
      visible: true,
      disabled: false,
      readonly: true,
      granted: false
    }
```

**Note**: The `'show'` mode has been removed from V1. If it were included, it would have returned `{ visible: true, disabled: false, readonly: false, granted: false }`, which creates semantic ambiguity.

### 3.3 Precedence Rules

**Rule 1**: RBAC decision is final

- If `granted: true`, element is always fully accessible
- No UI state can override an RBAC grant

**Rule 2**: `onUnauthorized` controls denial behavior

- Default is `'hide'` (secure by default)
- Other behaviors are opt-in

**Rule 3**: States are mutually exclusive for denial

- Only ONE of `visible: false`, `disabled: true`, or `readonly: true` applies
- Never `disabled: true` AND `readonly: true` simultaneously

### 3.4 Separation from visibleWhen

**Critical**: `resolveAccessState` does NOT consider `visibleWhen` conditions.

**Separation Strategy**:

```typescript
// RBAC access state (security concern)
const accessState = resolveAccessState(requirement, can);

// visibleWhen condition (business logic concern)
const visibleByCondition = evaluateVisibleWhen(props.visibleWhen);

// Final visibility (intersection of both)
const finalVisible = accessState.visible && visibleByCondition;
```

**Rationale**:

- RBAC = "Can user do this?" (security)
- visibleWhen = "Should we show this?" (business logic)
- Component combines both
- Integration layer only handles RBAC

---

## 4. Navigation Filtering

### 4.1 NavigationItem Type

```typescript
/**
 * NavigationItem represents a Dashforge navigation menu item.
 */
interface NavigationItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Navigation path (if applicable)
   */
  path?: string;

  /**
   * Icon (if applicable)
   */
  icon?: string;

  /**
   * Access requirement for this item
   * If undefined, item is always visible
   */
  access?: AccessRequirement;

  /**
   * Nested navigation items
   */
  children?: NavigationItem[];

  /**
   * Additional metadata (badges, tooltips, etc.)
   */
  metadata?: Record<string, unknown>;
}
```

**Rationale**:

- Matches Dashforge LeftNav structure
- `access` is optional (backward compatible)
- Supports nesting (common in Dashforge)
- Extensible via `metadata`

### 4.2 Navigation Filtering Algorithm

```typescript
/**
 * Filters navigation items based on access permissions.
 *
 * V1 BEHAVIOR: If parent is hidden, entire subtree is removed.
 * No automatic child promotion (too magical for V1).
 */
function filterNavigationItems(
  items: NavigationItem[],
  canCheck: (request: AccessRequest) => boolean
): NavigationItem[];
```

**Algorithm**:

```
function filterNavigationItems(items, canCheck):
  result = []

  for each item in items:
    // Step 1: Check item access
    if item.access is defined:
      state = resolveAccessState(item.access, canCheck)
      itemVisible = state.visible
    else:
      itemVisible = true  // No access requirement = always visible

    // Step 2: Only process if item is visible
    if NOT itemVisible:
      // Item hidden → skip entire subtree (no child promotion)
      continue

    // Step 3: Recursively filter children
    if item.children is defined:
      filteredChildren = filterNavigationItems(item.children, canCheck)
    else:
      filteredChildren = []

    // Step 4: Include item with filtered children
    result.push({
      ...item,
      children: filteredChildren
    })

  return result
```

**Key Change from Original Plan**: No child promotion when parent is hidden. If parent access fails, the entire branch (parent + all children) is removed. This keeps V1 predictable and non-magical.

### 4.3 Edge Cases

**Case 1: Parent hidden, all children hidden**

- Result: Nothing rendered (entire branch removed)

**Case 2: Parent hidden, some children visible**

- Result: **Entire branch removed** (no child promotion in V1)

**Case 3: Parent visible, all children hidden**

- Result: Parent rendered without children (becomes leaf item)

**Case 4: Parent visible, some children visible**

- Result: Parent rendered with filtered children (normal case)

**Case 5: No access requirement on item**

- Result: Item always visible, children still filtered

### 4.4 Structural Invariants

**Invariant 1**: Filtered list is always properly nested (no orphans, no promoted children)

**Invariant 2**: Original order is preserved within each level

**Invariant 3**: If parent is hidden, entire subtree is removed (V1 predictability rule)

---

## 5. Action Filtering

### 5.1 ActionItem Type

```typescript
/**
 * ActionItem represents a Dashforge action (button, menu item, etc.).
 */
interface ActionItem {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Display label
   */
  label: string;

  /**
   * Icon (if applicable)
   */
  icon?: string;

  /**
   * Action handler
   */
  onClick: () => void;

  /**
   * Access requirement for this action
   * If undefined, action is always available
   */
  access?: AccessRequirement;

  /**
   * Additional metadata (color, variant, tooltip, etc.)
   */
  metadata?: Record<string, unknown>;
}
```

**Rationale**:

- Flat structure (actions don't nest)
- `access` is optional (backward compatible)
- Preserves `onClick` handler
- Extensible via `metadata`

### 5.2 Action Filtering Algorithm

```typescript
/**
 * Filters actions based on access permissions.
 *
 * V1: Hide-only filtering.
 *
 * IMPORTANT: This utility ONLY decides visibility.
 * If an action has onUnauthorized='disable' or 'readonly',
 * those modes are IGNORED by filterActions().
 *
 * For disable/readonly support, use resolveAccessState() directly.
 */
function filterActions(
  actions: ActionItem[],
  canCheck: (request: AccessRequest) => boolean
): ActionItem[];
```

**Algorithm**:

```
function filterActions(actions, canCheck):
  result = []

  for each action in actions:
    // Step 1: Check action access
    if action.access is defined:
      state = resolveAccessState(action.access, canCheck)

      // V1: Only respect visibility
      // Ignore disable/readonly modes (not supported in filterActions)
      if state.visible:
        result.push(action)
    else:
      // No access requirement = always include
      result.push(action)

  return result
```

**Explicit V1 Limitation**: This utility filters based on `visible` property only. The `disabled` and `readonly` properties from `AccessState` are ignored. If an action has `onUnauthorized: 'disable'`, the action will still be **visible** in the filtered list (because `resolveAccessState` sets `visible: true` for disable mode), but the **disabled state is not propagated** by `filterActions`.

### 5.3 V1 Limitation: Hide-Only Filtering

**Rationale for V1**:

- Most common case: hide unauthorized actions
- Simpler to implement and test
- Disabled actions create UX confusion ("Why is this button here if I can't use it?")
- `filterActions` is a convenience utility for the 90% case

**Explicit Behavior**:

If you need disable/readonly state for actions, do NOT use `filterActions`. Instead, map actions and resolve access state directly:

```typescript
// V1: Simple hide-only filtering
const visibleActions = filterActions(allActions, can);

// V1: Advanced - get access state per action (for disable/readonly)
const actionsWithState = allActions
  .map((action) => {
    const accessState = action.access
      ? resolveAccessState(action.access, can)
      : { visible: true, disabled: false, readonly: false, granted: true };

    return {
      ...action,
      accessState,
    };
  })
  .filter((a) => a.accessState.visible);
```

**V2 Consideration**:

- Change `filterActions` return type to include access state
- Return `{ action: ActionItem, accessState: AccessState }[]`
- Let consuming component handle disabled rendering

### 5.4 Action Filtering vs Access State

**Important**: `filterActions` is a convenience for hide-only filtering.

For more complex access behavior (disable, readonly, custom), use `resolveAccessState` directly:

```typescript
// V1: Simple hide-only filtering (convenience utility)
const visibleActions = filterActions(allActions, can);

// V1: Full access state per action (for disable/readonly support)
const actionsWithState = allActions.map((action) => ({
  ...action,
  accessState: action.access
    ? resolveAccessState(action.access, can)
    : { visible: true, disabled: false, readonly: false, granted: true },
}));

// Filter out hidden actions, but keep disabled state available
const processedActions = actionsWithState.filter((a) => a.accessState.visible);
```

**Why this separation**:

- `filterActions` is optimized for the common case (hide unauthorized)
- Components that need disable/readonly state use `resolveAccessState` directly
- No need to propagate state through filtering utility when only visibility matters

---

## 6. Route Protection

### 6.1 AccessGuardConfig Type

```typescript
/**
 * AccessGuardConfig defines route/page protection behavior.
 *
 * V1 DOES NOT include built-in redirect support.
 * Redirect is the app/router's responsibility, not the library's.
 */
interface AccessGuardConfig {
  /**
   * Access requirement for the route/page
   */
  access: AccessRequirement;

  /**
   * What to render when access is denied
   *
   * ReactNode only (custom fallback component).
   * For redirects, handle at app/router level.
   *
   * If undefined, renders null (blank page).
   */
  fallback?: React.ReactNode;

  /**
   * Optional loading state while checking access
   * (useful if RBAC data loads async, though V1 is sync-only)
   */
  loading?: React.ReactNode;
}
```

**Key Change from Original Plan**: Removed string redirect support. `fallback` accepts only `ReactNode`. This keeps the guard router-agnostic and decouples it from router-specific redirect mechanisms.

### 6.2 Access Guard API

```typescript
/**
 * Creates an access guard component for route/page protection.
 *
 * The guard wraps route content and enforces access.
 *
 * Router-agnostic: Does NOT handle redirects internally.
 * App code must handle redirect logic at router level.
 */
function createAccessGuard(
  config: AccessGuardConfig
): React.ComponentType<AccessGuardProps>;

interface AccessGuardProps {
  /**
   * Content to render if access is granted
   */
  children: React.ReactNode;

  /**
   * Optional override for access requirement
   * (allows reusing same guard with different requirements)
   */
  access?: AccessRequirement;

  /**
   * Optional override for fallback
   * Must be ReactNode (not string redirect)
   */
  fallback?: React.ReactNode;
}
```

**Rationale for Naming**: Changed from `createRouteGuard` to `createAccessGuard` because:

- More accurately reflects RBAC semantics (access control, not routing)
- Guards can protect any page/component, not just routes
- Avoids implying router-specific functionality

### 6.3 Access Guard Behavior

**Algorithm**:

```
function AccessGuard(props):
  // Step 1: Get RBAC checker
  const { can } = useRbac()

  // Step 2: Determine requirement
  const requirement = props.access ?? config.access

  // Step 3: Resolve access state
  const state = resolveAccessState(requirement, can)

  // Step 4: Handle granted
  if state.granted:
    return props.children

  // Step 5: Handle denied
  const fallback = props.fallback ?? config.fallback

  if fallback is ReactNode:
    return fallback

  return null  // Blank page (no fallback provided)
```

**Key Change from Original Plan**: Removed string redirect handling. If access is denied, guard renders `fallback` (ReactNode) or `null`. No router integration.

### 6.4 Router Integration Strategy

**V1 Approach**: Framework-light, React-oriented, no built-in redirect

```typescript
// Access guard is a React component
const BookingAccessGuard = createAccessGuard({
  access: { action: 'read', resource: 'booking' },
  fallback: <UnauthorizedPage />,
});

// Usage with any router - guard provides content, router handles navigation
<Route
  path="/bookings"
  element={
    <BookingAccessGuard>
      <BookingsPage />
    </BookingAccessGuard>
  }
/>

// For redirect behavior, handle at router level (not in guard)
// Example: Router-level protection with redirect
<Route
  path="/bookings"
  element={
    <BookingAccessGuard
      fallback={<Navigate to="/unauthorized" replace />}
    >
      <BookingsPage />
    </BookingAccessGuard>
  }
/>
```

**Router Compatibility**:

- Works with React Router v6 (element prop, `<Navigate />` in fallback)
- Works with TanStack Router (component prop, redirect in fallback)
- Works with any React-based router (guard is just a component wrapper)
- App controls redirect mechanism, not the library

**Rationale**:

- No router-specific APIs in guard itself
- Redirect behavior is app/router responsibility (separation of concerns)
- Guard focuses solely on access control rendering
- Simple, testable, composable
- Router-agnostic by design

### 6.5 Access Guard Edge Cases

**Case 1: Access granted**

- Render children normally

**Case 2: Access denied, ReactNode fallback**

- Render custom unauthorized component

**Case 3: Access denied, no fallback**

- Render null (blank page)

**Case 4: Access changes while on route**

- Guard re-evaluates (via RBAC context change)
- May render fallback if access revoked
- App handles redirect separately (e.g., via router-level effect)

**Note**: String redirect case removed from V1. Redirect is app/router responsibility.

---

## 7. Component Integration Strategy

### 7.1 Integration Philosophy

**Core Principle**: Dashforge components consume RBAC via props, NOT via wrappers.

**Why**:

- No `<ProtectedButton />` wrapper components (adds complexity)
- No higher-order components (harder to type, debug)
- Components own their RBAC integration (single responsibility)

### 7.2 Proposed Component Props

**Standard Access Props** (added to all RBAC-aware components):

```typescript
interface RbacAwareProps {
  /**
   * Access requirement for this component
   * If undefined, component is always accessible
   *
   * IMPORTANT: onUnauthorized is defined INSIDE AccessRequirement,
   * NOT as a separate component prop. Single source of truth.
   */
  access?: AccessRequirement;
}
```

**REMOVED from Original Plan**: Component-level `onUnauthorized` prop. This was creating duplicate ownership of unauthorized behavior. The `onUnauthorized` value comes from `access.onUnauthorized` only.

**Example: Button Component**

```typescript
interface ButtonProps extends RbacAwareProps {
  // ... existing Button props
  onClick: () => void;
  children: React.ReactNode;
  // ... other props
}

// Implementation pattern (conceptual, not code)
function Button({ access, ...otherProps }: ButtonProps) {
  const { can } = useRbac();

  // Resolve access state if requirement provided
  // onUnauthorized comes from access.onUnauthorized, not a separate prop
  const accessState = access
    ? resolveAccessState(access, can)
    : { visible: true, disabled: false, readonly: false, granted: true };

  // Don't render if not visible
  if (!accessState.visible) return null;

  // Render with disabled state
  return (
    <MuiButton
      disabled={otherProps.disabled || accessState.disabled}
      {...otherProps}
    />
  );
}
```

**Example: TextField Component**

```typescript
interface TextFieldProps extends RbacAwareProps {
  // ... existing TextField props
  value: string;
  onChange: (value: string) => void;
  // ... other props
}

// Implementation pattern (conceptual, not code)
function TextField({ access, ...otherProps }: TextFieldProps) {
  const { can } = useRbac();

  const accessState = access
    ? resolveAccessState(access, can)
    : { visible: true, disabled: false, readonly: false, granted: true };

  if (!accessState.visible) return null;

  return (
    <MuiTextField
      disabled={otherProps.disabled || accessState.disabled}
      InputProps={{ readOnly: otherProps.readOnly || accessState.readonly }}
      {...otherProps}
    />
  );
}
```

### 7.3 Component Integration Checklist

**For each RBAC-aware component**:

1. Add `access?: AccessRequirement` prop (NOT separate `onUnauthorized` prop)
2. Import `useRbac` and `resolveAccessState`
3. Resolve access state at render top
4. Return null if `!accessState.visible`
5. Pass `accessState.disabled` to underlying disabled prop
6. Pass `accessState.readonly` to underlying readonly prop (if applicable)
7. Combine with existing disabled/readonly props (OR logic)

**REMOVED from Original Plan**: Step 2 previously said "Add `onUnauthorized?: UnauthorizedBehavior` prop". This is removed. Unauthorized behavior comes from `access.onUnauthorized` only.

### 7.4 Components to Integrate (Planned)

**Phase 1** (V1 Integration):

- Button
- TextField
- NumberField
- Select
- Checkbox
- Switch
- RadioGroup
- Textarea

**Phase 2** (Future):

- DateTimePicker
- Autocomplete
- Custom form components

**Not Integrated** (Not Applicable):

- AppShell (layout, no RBAC needed)
- Breadcrumbs (navigation, filtered via filterNavigationItems)
- LeftNav (navigation, filtered via filterNavigationItems)
- Snackbar (feedback, no RBAC needed)
- ConfirmDialog (feedback, no RBAC needed)

### 7.5 Avoiding Duplication

**Problem**: Each component would duplicate RBAC integration logic.

**Solution**: Create shared hook for components.

**Proposed** (future, not in integration layer):

```typescript
// In libs/dashforge/ui/src/_internal/use-access-state.ts
function useAccessState(access?: AccessRequirement): AccessState {
  const { can } = useRbac();

  return useMemo(() => {
    if (!access) {
      return { visible: true, disabled: false, readonly: false, granted: true };
    }

    // onUnauthorized comes from access.onUnauthorized (no second parameter)
    return resolveAccessState(access, can);
  }, [access, can]);
}

// Usage in components
function Button({ access, ...props }: ButtonProps) {
  const accessState = useAccessState(access);

  if (!accessState.visible) return null;

  return (
    <MuiButton disabled={props.disabled || accessState.disabled} {...props} />
  );
}
```

**CHANGED from Original Plan**: Hook no longer accepts separate `onUnauthorized` parameter. The `onUnauthorized` value comes from `access.onUnauthorized` only. Single source of truth.

**Location**: This hook lives in `@dashforge/ui`, NOT in `@dashforge/rbac/dashforge`.

**Rationale**:

- Integration layer provides utilities (resolveAccessState)
- UI components use utilities via shared hook
- No circular dependencies
- Clear separation of concerns

---

## 8. Separation of Concerns

### 8.1 RBAC vs visibleWhen

**RBAC** (security concern):

- "Can the user perform this action?"
- Evaluated via `can(request)`
- Controls access to sensitive operations
- Fail-secure (deny by default)

**visibleWhen** (business logic concern):

- "Should we show this based on form state?"
- Evaluated via custom condition logic
- Controls UI visibility based on data
- Orthogonal to security

**Combination Strategy**:

```typescript
// Component receives both
function SomeComponent({
  access, // RBAC requirement
  visibleWhen, // Business logic condition
  ...props
}) {
  // Resolve RBAC access
  const accessState = useAccessState(access);

  // Evaluate business logic
  const visibleByCondition = evaluateVisibleWhen(visibleWhen);

  // Final visibility = intersection
  const finalVisible = accessState.visible && visibleByCondition;

  if (!finalVisible) return null;

  // Render with access states
  return <MuiComponent disabled={accessState.disabled} {...props} />;
}
```

**Precedence**:

- Both RBAC AND visibleWhen must pass for visibility
- If RBAC denies, element is hidden regardless of visibleWhen
- If visibleWhen is false, element is hidden regardless of RBAC

### 8.2 RBAC vs Reactions

**RBAC** (static permission):

- "Can user edit this field?"
- Evaluated at render time
- Does not change based on field values

**Reactions** (dynamic form behavior):

- "Should field X be disabled when field Y has value Z?"
- Evaluated reactively based on form state
- Changes as user interacts with form

**Combination Strategy**:

```typescript
function TextField({ access, ...props }) {
  const accessState = useAccessState(access);
  const { watch } = useFormContext();

  // Reaction logic (example)
  const disabledByReaction = watch('someField') === 'someValue';

  // Combine access and reaction
  const finalDisabled = accessState.disabled || disabledByReaction;

  if (!accessState.visible) return null;

  return <MuiTextField disabled={finalDisabled} {...props} />;
}
```

**Precedence**:

- RBAC disabled OR reaction disabled = disabled
- RBAC readonly takes precedence over reactions
- RBAC visibility is final (no reaction can override)

### 8.3 RBAC vs UI States

**RBAC** (permission-based state):

- Controls access based on roles/permissions
- Stable across component lifecycle
- Changes only when subject/policy changes

**UI States** (interaction state):

- Loading, error, validation states
- Dynamic during component lifecycle
- Independent of RBAC

**Combination Strategy**:

```typescript
function Button({ access, onClick, ...props }) {
  const accessState = useAccessState(access);
  const [loading, setLoading] = useState(false);

  // Combine access and UI state
  const finalDisabled = accessState.disabled || loading;

  if (!accessState.visible) return null;

  return (
    <MuiButton
      disabled={finalDisabled}
      onClick={async () => {
        if (accessState.granted) {
          setLoading(true);
          await onClick();
          setLoading(false);
        }
      }}
      {...props}
    />
  );
}
```

**Precedence**:

- RBAC controls structural access (visible, disabled, readonly)
- UI states layer on top (loading, error, etc.)
- Both can contribute to disabled state (OR logic)

---

## 9. Public API Summary

### 9.1 Exports from `@dashforge/rbac/dashforge`

**Types**:

```typescript
export type {
  AccessRequirement,
  UnauthorizedBehavior,
  AccessState,
  NavigationItem,
  ActionItem,
  AccessGuardConfig,
  AccessGuardProps,
};
```

**Utilities**:

```typescript
export { resolveAccessState } from './resolve-access-state';
export { filterNavigationItems } from './filter-navigation-items';
export { filterActions } from './filter-actions';
export { createAccessGuard } from './create-access-guard';
```

**CHANGED from Original Plan**:

- `RouteGuardConfig` → `AccessGuardConfig`
- `RouteGuardProps` → `AccessGuardProps`
- `createRouteGuard` → `createAccessGuard`

### 9.2 Usage Examples

**Example 1: Resolve Access State**

```typescript
import { useRbac } from '@dashforge/rbac/react';
import { resolveAccessState } from '@dashforge/rbac/dashforge';

function MyComponent() {
  const { can } = useRbac();

  const deleteAccessState = resolveAccessState(
    {
      action: 'delete',
      resource: 'booking',
      onUnauthorized: 'disable',
    },
    can
  );

  return (
    <Button disabled={deleteAccessState.disabled} onClick={handleDelete}>
      Delete
    </Button>
  );
}
```

**CHANGED from Original Plan**: Action `'delete'` used instead of UI synonym. Consistent with core RBAC semantics.

**Example 2: Filter Navigation**

```typescript
import { useRbac } from '@dashforge/rbac/react';
import { filterNavigationItems } from '@dashforge/rbac/dashforge';

function LeftNav() {
  const { can } = useRbac();

  const allItems = [
    {
      id: 'bookings',
      label: 'Bookings',
      path: '/bookings',
      access: { action: 'read', resource: 'booking' },
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      access: { action: 'manage', resource: 'settings' },
    },
  ];

  const visibleItems = filterNavigationItems(allItems, can);

  return <NavMenu items={visibleItems} />;
}
```

**CHANGED from Original Plan**: Actions use canonical names (`read`, `manage`) instead of UI synonyms (`view`, `manage`).

**Example 3: Filter Actions**

```typescript
import { useRbac } from '@dashforge/rbac/react';
import { filterActions } from '@dashforge/rbac/dashforge';

function BookingActionsMenu({ booking }) {
  const { can } = useRbac();

  const allActions = [
    {
      id: 'read',
      label: 'View',
      onClick: () => handleView(booking),
      access: { action: 'read', resource: 'booking' },
    },
    {
      id: 'update',
      label: 'Edit',
      onClick: () => handleEdit(booking),
      access: { action: 'update', resource: 'booking', resourceData: booking },
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: () => handleDelete(booking),
      access: { action: 'delete', resource: 'booking', resourceData: booking },
    },
  ];

  const visibleActions = filterActions(allActions, can);

  return <ActionMenu actions={visibleActions} />;
}
```

**CHANGED from Original Plan**: Actions use canonical names (`read`, `update`, `delete`) instead of UI synonyms (`view`, `edit`, `delete`). Action IDs also align with canonical names.

**Example 4: Route Protection**

```typescript
import { createAccessGuard } from '@dashforge/rbac/dashforge';

const BookingsAccessGuard = createAccessGuard({
  access: { action: 'read', resource: 'booking' },
  fallback: <UnauthorizedPage />,
});

// In router config
<Route
  path="/bookings"
  element={
    <BookingsAccessGuard>
      <BookingsPage />
    </BookingsAccessGuard>
  }
/>

// For redirect behavior, handle at app/router level
<Route
  path="/bookings"
  element={
    <BookingsAccessGuard
      fallback={<Navigate to="/unauthorized" replace />}
    >
      <BookingsPage />
    </BookingsAccessGuard>
  }
/>
```

**CHANGED from Original Plan**:

- `createRouteGuard` → `createAccessGuard` (clearer RBAC semantics)
- Action `'view'` → `'read'` (canonical name)
- First example uses ReactNode fallback (not string redirect)
- Added second example showing redirect via router's `<Navigate />` in fallback

---

## 10. What is Excluded from V1 Integration Layer

### 10.1 Advanced Filtering Features

**NOT Included**:

- ❌ Disabled state for filtered actions (hide-only in V1)
- ❌ Partial rendering for denied nav items (all-or-nothing in V1)
- ❌ Custom unauthorized callbacks
- ❌ Access state caching/memoization
- ❌ Bulk access state resolution

**Rationale**: V1 focuses on core use cases. Advanced features add complexity without proportional value.

### 10.2 Router-Specific Integrations

**NOT Included**:

- ❌ React Router-specific guard wrapper
- ❌ TanStack Router loader integration
- ❌ Route-level permission metadata
- ❌ Built-in redirect implementation (app/router responsibility)
- ❌ Automatic redirect to login
- ❌ "Return to" after login flow

**Rationale**: Keep access guards framework-light and router-agnostic. Router-specific features (like redirects) are app/router responsibility, not library responsibility.

### 10.3 Component Wrapper Patterns

**NOT Included**:

- ❌ `<ProtectedButton />` wrapper components
- ❌ `<ProtectedTextField />` wrapper components
- ❌ Higher-order component factories (e.g., `withAccess(Button)`)
- ❌ Render prop components (e.g., `<Access>{state => ...}</Access>`)

**Rationale**: Props-based integration is simpler, more type-safe, and easier to debug than wrappers.

### 10.4 DataTable Integration

**NOT Included**:

- ❌ Column-level access control
- ❌ Row-level access control
- ❌ Action column filtering
- ❌ DataTable-specific access utilities

**Rationale**: DataTable is complex enough to deserve its own integration plan. Out of scope for V1.

### 10.5 Form Integration

**NOT Included**:

- ❌ DashForm-level access control
- ❌ Field-level access via form schema
- ❌ Automatic readonly/disabled binding in forms
- ❌ Form submission access checks

**Rationale**: Form integration requires deep understanding of DashFormBridge. Separate plan needed.

### 10.6 Debug/DevTools Features

**NOT Included**:

- ❌ Access state inspector
- ❌ Permission debugger panel
- ❌ RBAC decision trace/logs
- ❌ Visual policy editor

**Rationale**: V1 is production features only. DevTools are V2+.

### 10.7 Advanced Access Patterns

**NOT Included**:

- ❌ Compound requirements (AND/OR logic)
- ❌ Access requirement inheritance
- ❌ Fallback/default access requirements
- ❌ Context-aware access (e.g., "inherit from parent route")
- ❌ `'show'` mode in UnauthorizedBehavior (semantic ambiguity)

**Rationale**: V1 uses simple, explicit requirements. Advanced patterns add cognitive load. The `'show'` mode was removed because it creates ambiguity (access denied but rendered normally).

### 10.8 Backend Integration

**NOT Included**:

- ❌ API endpoint access control
- ❌ GraphQL query filtering
- ❌ Server-side policy validation
- ❌ Policy sync between frontend/backend

**Rationale**: Integration layer is frontend-only. Backend integration is separate concern.

---

## 11. Testing Strategy

### 11.1 Test Files Required

```
libs/dashforge/rbac/src/dashforge/__tests__/
├── resolve-access-state.spec.ts       # ~24 tests (reduced from ~25)
├── filter-navigation-items.spec.ts    # ~18 tests (reduced from ~20)
├── filter-actions.spec.ts             # ~16 tests (increased from ~15)
└── create-access-guard.spec.tsx       # ~18 tests (reduced from ~20)
```

**Total Estimated Tests**: ~76 tests (reduced from ~80 due to removal of 'show' mode, child promotion, and string redirect)

### 11.2 resolve-access-state.spec.ts

**Test Categories**:

1. **Basic resolution** (5 tests)

   - Granted access returns fully accessible state
   - Denied access with default behavior hides element
   - Denied access respects onUnauthorized from AccessRequirement

2. **Behavior modes** (3 tests)

   - `onUnauthorized: 'hide'` sets visible: false
   - `onUnauthorized: 'disable'` sets disabled: true
   - `onUnauthorized: 'readonly'` sets readonly: true

3. **RBAC integration** (6 tests)

   - Calls canCheck with correct AccessRequest
   - Works with resourceData
   - Works with environment
   - Works with wildcard permissions
   - Works with conditions

4. **Edge cases** (5 tests)

   - Undefined onUnauthorized defaults to 'hide'
   - Empty requirement (minimal action/resource)
   - Multiple calls return consistent results
   - State properties never conflict (no disabled+readonly)

5. **Type safety** (5 tests)
   - Returns AccessState with all required properties
   - granted property matches canCheck result
   - visible/disabled/readonly are always boolean

**CHANGED from Original Plan**: Removed test for `'show'` behavior mode (no longer exists in V1).

### 11.3 filter-navigation-items.spec.ts

**Test Categories**:

1. **Basic filtering** (4 tests)

   - Filters visible items correctly
   - Filters hidden items correctly
   - Preserves order of visible items
   - No access requirement always visible

2. **Nested items** (5 tests)

   - Filters nested children recursively
   - Parent visible, all children visible
   - Parent visible, some children hidden
   - Parent hidden, entire subtree removed (no promotion)
   - Deep nesting (3+ levels)

3. **Edge cases** (5 tests)

   - Empty input returns empty output
   - All items hidden returns empty output
   - No items with access requirements returns all items
   - Maintains item metadata after filtering
   - Handles undefined children gracefully

4. **Structural invariants** (4 tests)
   - Result is always valid NavigationItem[]
   - No orphaned children
   - Original order preserved within levels
   - Parent hidden means entire subtree removed

**CHANGED from Original Plan**:

- Removed 1 test for child promotion (no longer supported)
- Added 1 test for "parent hidden removes entire subtree"
- Updated invariant test to verify no promotion occurs
- Total tests: 18 (reduced from 20)

### 11.4 filter-actions.spec.ts

**Test Categories**:

1. **Basic filtering** (4 tests)

   - Filters visible actions correctly
   - Filters hidden actions correctly
   - Preserves order of visible actions
   - No access requirement always visible

2. **Access behaviors** (4 tests)

   - Respects 'hide' behavior (filters out)
   - 'disable' behavior still shows action (visible: true, but disabled state ignored)
   - 'readonly' behavior still shows action (visible: true, but readonly state ignored)
   - filterActions only uses `visible` property, ignores disabled/readonly

3. **Edge cases** (4 tests)

   - Empty input returns empty output
   - All actions hidden returns empty output
   - No actions with access requirements returns all actions
   - Maintains action metadata after filtering

4. **Action properties** (4 tests)
   - Preserves onClick handlers
   - Preserves icons
   - Preserves metadata
   - Maintains action identity (id)

**CHANGED from Original Plan**: Added explicit test that disable/readonly modes keep actions visible (category 2, test 4). Clarifies that `filterActions` is visibility-only.

### 11.5 create-access-guard.spec.tsx

**Test Categories**:

1. **Basic guard behavior** (5 tests)

   - Renders children when access granted
   - Renders nothing when access denied and no fallback
   - Uses config.access by default
   - Overrides with props.access if provided
   - Throws helpful error when used outside RbacProvider

2. **Fallback behaviors** (3 tests)

   - Renders ReactNode fallback when denied
   - Uses config.fallback by default
   - Overrides with props.fallback if provided

3. **RBAC integration** (4 tests)

   - Calls useRbac() internally
   - Re-evaluates when subject changes
   - Re-evaluates when access prop changes
   - Works with conditions

4. **Router compatibility** (3 tests)

   - Works as route element wrapper
   - No router-specific dependencies in guard itself
   - App can pass router redirect component as fallback

5. **Edge cases** (3 tests)
   - Handles access change while route mounted
   - Multiple guards on same route
   - Nested access guards

**CHANGED from Original Plan**:

- Renamed test file from `create-route-guard.spec.tsx` to `create-access-guard.spec.tsx`
- Removed test for string redirect fallback (no longer supported)
- Added test that app can pass redirect component as fallback (ReactNode)
- Total tests: 18 (reduced from 20)

---

## 12. Implementation Order

### 12.1 Phase 1: Core Utilities (Foundation)

**Order**:

1. Write tests for `types.ts` (type validation)
2. Implement `types.ts`
3. Write tests for `resolve-access-state.ts`
4. Implement `resolve-access-state.ts`
5. Verify typecheck and tests pass

**Why first**: All other utilities depend on access state resolution.

### 12.2 Phase 2: Filtering Utilities

**Order**:

1. Write tests for `filter-actions.ts`
2. Implement `filter-actions.ts`
3. Write tests for `filter-navigation-items.ts`
4. Implement `filter-navigation-items.ts`
5. Verify typecheck and tests pass

**Why second**: Filtering utilities are independent of routing, easier to test.

### 12.3 Phase 3: Route Protection

**Order**:

1. Write tests for `create-access-guard.tsx`
2. Implement `create-access-guard.tsx`
3. Verify typecheck and tests pass

**Why third**: Access guards depend on access state resolution, most complex integration.

**CHANGED from Original Plan**: File renamed from `create-route-guard.tsx` to `create-access-guard.tsx`.

### 12.4 Phase 4: Exports and Documentation

**Order**:

1. Implement `dashforge/index.ts`
2. Write integration examples
3. Update main library exports
4. Verify full typecheck
5. Verify all tests pass (core + react + dashforge)

**Why last**: Ensures clean public API and complete testing.

---

## 13. Design Principles Summary

### 13.1 Core Principles

1. **Core Decides, Dashforge Executes**

   - RBAC core makes security decisions
   - Dashforge layer translates decisions to UI states
   - No security logic in Dashforge layer

2. **Access States Resolved Centrally**

   - Single `resolveAccessState` function
   - Deterministic mapping
   - No ad-hoc state resolution in components

3. **No Inline Role Checks**

   - All access goes through RBAC engine
   - No `if (user.role === 'admin')` anywhere
   - Enforced via architecture

4. **visibleWhen and RBAC Separate**

   - RBAC = security concern
   - visibleWhen = business logic concern
   - Combined at component level, not integration level

5. **Integration Layer Stays Small**
   - Utility functions, not abstractions
   - No wrappers, no HOCs
   - Composable building blocks

### 13.2 Anti-Patterns (Forbidden)

- ❌ Wrapper components (`<ProtectedButton />`)
- ❌ HOC factories (`withAccess(Component)`)
- ❌ Render props (`<Access>{state => ...}</Access>`)
- ❌ RBAC logic inside UI components
- ❌ Mixing RBAC and visibleWhen in utilities
- ❌ Router-specific implementations (no built-in redirect)
- ❌ Caching/optimization theater
- ❌ V2 features in V1
- ❌ Duplicate `onUnauthorized` ownership (component-level props)
- ❌ UI synonyms for actions (`view`/`edit` instead of `read`/`update`)
- ❌ `'show'` mode in UnauthorizedBehavior (creates ambiguity)
- ❌ Child promotion when parent navigation access fails (too magical)

### 13.3 Success Criteria

**Functional**:

- ✅ All utilities are pure functions (except route guard)
- ✅ All utilities have 100% test coverage
- ✅ All utilities are framework-agnostic (except route guard)
- ✅ Access states resolve deterministically
- ✅ Navigation/action filtering preserves structure

**Architectural**:

- ✅ No circular dependencies
- ✅ Clean separation from core/react layers
- ✅ Minimal public API surface
- ✅ Composable utilities
- ✅ Type-safe throughout

**Integration**:

- ✅ Components can consume via props
- ✅ Routers can integrate via guard component
- ✅ Navigation systems can filter via utility
- ✅ Action systems can filter via utility

---

## 14. Next Steps After Plan Approval

### 14.1 Immediate Next Phase: BUILD

Once this plan is approved, proceed to BUILD mode:

1. Create test files following TDD discipline
2. Implement utilities one by one
3. Verify typecheck at each step
4. Verify all tests pass at each step
5. Write build report documenting implementation

### 14.2 Future Phases (Not V1)

**Phase: Component Integration**

- Add `access` props to Button, TextField, etc.
- Implement `useAccessState` hook in UI library
- Test each component's RBAC integration
- Document component-level usage

**Phase: Form Integration**

- Plan DashForm + RBAC integration
- Field-level access control
- Form-level access control
- Submit button access control

**Phase: DataTable Integration**

- Plan DataTable + RBAC integration
- Column visibility control
- Row action filtering
- Bulk action filtering

**Phase: Advanced Features (V2)**

- Compound requirements (AND/OR)
- Access state caching
- Debug/DevTools panel
- Backend policy sync

---

**END OF PLAN**

---

**Status**: Ready for Review (REVISED)  
**Next Phase**: BUILD (after approval)  
**Estimated Implementation Time**: 4-6 hours (integration layer only, excluding component updates)

---

## Revision Checklist

All 7 requested revisions have been applied:

- ✅ **Issue 1**: Removed duplicated `onUnauthorized` ownership. Single source of truth in `AccessRequirement` only. No component-level `onUnauthorized` props.

- ✅ **Issue 2**: Removed `'show'` from `UnauthorizedBehavior`. V1 supports only `hide`, `disable`, `readonly`.

- ✅ **Issue 3**: Decoupled access guard from router-specific redirect. `fallback` accepts only `ReactNode`. No built-in redirect implementation.

- ✅ **Issue 4**: Removed automatic child promotion in navigation filtering. If parent access fails, entire subtree is removed.

- ✅ **Issue 5**: Clarified `filterActions` behavior. Explicitly documented as hide-only. Disable/readonly modes ignored by this utility.

- ✅ **Issue 6**: Aligned action naming with core semantics. Examples use canonical actions (`read`, `create`, `update`, `delete`, `manage`).

- ✅ **Issue 7**: Renamed route guard API from `createRouteGuard` to `createAccessGuard` for clearer RBAC semantics.

Core principle preserved: **RBAC core decides, Dashforge executes.**
