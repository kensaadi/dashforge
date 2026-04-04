# TextField RBAC Integration V1 — Architectural Plan

**Status**: Planning Phase  
**Scope**: TextField Component RBAC Integration Only  
**Target**: `libs/dashforge/ui/src/components/TextField/TextField.tsx`  
**Date**: 2026-04-04  
**Policy Reference**: `.opencode/policies/rbac-v1.md`  
**Foundation**: RBAC Core V1 (complete), RBAC React V1 (complete), RBAC Dashforge V1 (complete)

---

## Executive Summary

This plan defines the **first production-grade RBAC integration** for a real Dashforge component: **TextField**.

TextField is chosen as the first integration target because:

1. It's a fundamental form component used throughout Dashforge applications
2. It already has sophisticated integration with DashFormContext and DashFormBridge
3. It demonstrates all three RBAC access states: hidden, disabled, and readonly
4. It serves as the **template for future component integrations** (Select, NumberField, DatePicker, etc.)

**Core Design Principles**:

- RBAC decides access state, TextField consumes it
- `resolveAccessState` remains the single source of truth
- `visibleWhen` remains completely separate from RBAC
- `disabled` and `readonly` props compose cleanly with RBAC states
- `access` prop is optional and backward-compatible
- No wrapper components, no duplicate logic
- Minimal API surface for V1

---

## 1. Target Component

### 1.1 Application Structure

**Package**: `@dashforge/ui`  
**Target File**: `libs/dashforge/ui/src/components/TextField/TextField.tsx`  
**Types File**: `libs/dashforge/ui/src/components/TextField/textField.types.ts`

### 1.2 Current TextField Responsibilities

TextField is a sophisticated form component with the following responsibilities:

1. **Dual Mode Support**:

   - **Plain mode**: Standalone MUI TextField (no form integration)
   - **Bound mode**: Integrated with DashFormBridge (form-connected)

2. **Reactive Visibility**:

   - Supports `visibleWhen` prop for conditional rendering based on engine state
   - Uses `useEngineVisibility` hook from `@dashforge/ui-core`

3. **Form Integration**:

   - Calls `bridge.register(name, rules)` when inside DashFormContext
   - Binds value, onChange, onBlur from registration
   - Auto-binds error and helperText from form validation

4. **Error Display Gating** (Form Closure v1):

   - Errors show only when field is touched (after blur) OR form submitted
   - Prevents error spam while typing before user interaction

5. **Layout Modes**:

   - `floating`: Standard MUI floating label (default)
   - `stacked`: External label above control
   - `inline`: External label to the left of control

6. **Select Mode Support**:

   - Special handling for select mode with controlled value and touch tracking
   - Sanitizes display values to prevent MUI out-of-range warnings

7. **Prop Precedence**:
   - Explicit error/helperText props override auto values from bridge

**Current Props** (from `textField.types.ts`):

- `name` (required)
- `rules` (optional validation rules)
- `visibleWhen` (optional conditional visibility)
- `layout` (optional: 'floating' | 'stacked' | 'inline')
- `disabled` (optional: boolean)
- All other MUI TextField props (error, helperText, label, etc.)

**Current Dependencies**:

- `@mui/material/TextField`
- `@dashforge/ui-core` (DashFormContext, DashFormBridge, useEngineVisibility)
- `@dashforge/theme-core` (useDashTheme)

**Does NOT depend on**:

- `react-hook-form` (uses bridge abstraction)
- `@dashforge/forms`

---

## 2. Proposed Public API Change

### 2.1 New Prop: `access`

Add a single optional prop to `TextFieldProps`:

````typescript
export interface TextFieldProps extends Omit<MuiTextFieldProps, ...> {
  name: string;
  rules?: unknown;
  visibleWhen?: (engine: Engine) => boolean;
  layout?: FieldLayout;

  /**
   * RBAC access requirement for this field.
   *
   * When provided, the field's visibility, disabled state, and readonly state
   * are controlled by RBAC permissions.
   *
   * Access state is resolved using the RBAC system and combined with
   * explicit props using OR logic for disabled and readonly states.
   *
   * @example
   * ```tsx
   * <TextField
   *   name="salary"
   *   label="Salary"
   *   access={{
   *     resource: 'employee',
   *     action: 'update',
   *     onUnauthorized: 'readonly'
   *   }}
   * />
   * ```
   */
  access?: AccessRequirement;

  // ... existing props
}
````

### 2.2 Additional Props Required

**None**. The `access` prop is sufficient for V1.

**Rationale**:

- `onUnauthorized` lives inside `AccessRequirement` (single source of truth)
- No component-level override props needed
- Keeps API minimal and predictable

### 2.3 Backward Compatibility

When `access` prop is **omitted**:

- TextField behaves exactly as it does today
- No RBAC evaluation occurs
- No performance impact
- Existing usage continues to work unchanged

When `access` prop is **provided**:

- TextField evaluates RBAC access using `useRbac()` hook
- Access state is resolved using `resolveAccessState`
- Visibility, disabled, and readonly states are controlled by RBAC
- Explicit props can still override (composition rules defined below)

---

## 3. Detailed Behavior Matrix

### 3.1 RBAC Access States

| Access Granted | onUnauthorized   | Visible | Disabled | Readonly | Description                                 |
| -------------- | ---------------- | ------- | -------- | -------- | ------------------------------------------- |
| ✅ True        | (any)            | ✅ Yes  | ❌ No    | ❌ No    | Full access - field is interactive          |
| ❌ False       | `hide` (default) | ❌ No   | N/A      | N/A      | Field not rendered at all                   |
| ❌ False       | `disable`        | ✅ Yes  | ✅ Yes   | ❌ No    | Field visible but not interactive           |
| ❌ False       | `readonly`       | ✅ Yes  | ❌ No    | ✅ Yes   | Field visible, value shown but not editable |

### 3.2 Visibility Behavior (access.visible === false)

**Rendering**:

- Return `null` from TextField component (same as `visibleWhen` returning false)
- Early return happens AFTER all hooks are called (React rules)
- No MUI TextField rendered, no DOM output

**Interaction with visibleWhen**:

- RBAC visibility and `visibleWhen` are **independent concerns**
- Both conditions must be true for field to render
- Evaluation order:
  1. All hooks called unconditionally (React rules)
  2. Check `visibleWhen` → if false, return null
  3. Check RBAC visibility → if false, return null
  4. Both true → render field

**Code Pattern**:

```typescript
// Hooks first
const isVisibleWhen = useEngineVisibility(engine, visibleWhen);
const accessState = useAccessState(access); // New hook

// Early returns after hooks
if (!isVisibleWhen) {
  return null;
}

if (!accessState.visible) {
  return null;
}

// Render field
```

### 3.3 Disabled Behavior (accessState.disabled === true)

**MUI TextField Mapping**:

- Pass `disabled={effectiveDisabled}` to MUI TextField
- Where `effectiveDisabled = userDisabled || accessState.disabled`

**Composition Rule**:

- **OR logic**: Field is disabled if EITHER explicit `disabled` prop is true OR RBAC says disabled
- User-provided `disabled` prop takes precedence (cannot be overridden by RBAC to enable)

**Examples**:

```typescript
// User disabled = false, RBAC disabled = false → disabled = false
<TextField name="field" disabled={false} access={{...}} />

// User disabled = false, RBAC disabled = true → disabled = true
<TextField name="field" disabled={false} access={{..., onUnauthorized: 'disable'}} />

// User disabled = true, RBAC disabled = false → disabled = true
<TextField name="field" disabled={true} access={{...}} />

// User disabled = true, RBAC disabled = true → disabled = true
<TextField name="field" disabled={true} access={{..., onUnauthorized: 'disable'}} />
```

**Implementation**:

```typescript
const effectiveDisabled = props.disabled || accessState.disabled;
```

**Rationale**: OR logic ensures that if user explicitly disables a field, RBAC cannot enable it. RBAC can only add additional restrictions, never remove them.

### 3.4 Readonly Behavior (accessState.readonly === true)

**MUI TextField Mapping**:

- MUI TextField does NOT have a native `readonly` prop
- Readonly is implemented via `slotProps.input.readOnly`
- Must merge with existing `slotProps` if present

**Composition Rule**:

- **OR logic**: Field is readonly if EITHER explicit `slotProps.input.readOnly` is true OR RBAC says readonly
- User-provided readonly takes precedence (cannot be overridden by RBAC to make editable)

**Implementation Pattern**:

```typescript
const effectiveReadonly =
  props.slotProps?.input?.readOnly || accessState.readonly;

const effectiveSlotProps = {
  ...props.slotProps,
  input: {
    ...props.slotProps?.input,
    readOnly: effectiveReadonly,
  },
};
```

**Examples**:

```typescript
// User readonly = false, RBAC readonly = false → readonly = false
<TextField name="field" access={{...}} />

// User readonly = false, RBAC readonly = true → readonly = true
<TextField name="field" access={{..., onUnauthorized: 'readonly'}} />

// User readonly = true, RBAC readonly = false → readonly = true
<TextField
  name="field"
  slotProps={{ input: { readOnly: true } }}
  access={{...}}
/>

// User readonly = true, RBAC readonly = true → readonly = true
<TextField
  name="field"
  slotProps={{ input: { readOnly: true } }}
  access={{..., onUnauthorized: 'readonly'}}
/>
```

**Special Consideration - Select Mode**:

- When `select={true}`, TextField renders as a dropdown
- MUI Select does NOT support `readOnly` prop (it's a non-standard HTML attribute for select elements)
- **Decision**: When `accessState.readonly === true` AND `select === true`, treat as `disabled` instead
- Rationale: Closest semantic equivalent; prevents selection changes while showing current value

**Readonly + Select Implementation**:

```typescript
// If readonly access state and select mode, use disabled instead
const effectiveDisabled =
  props.disabled ||
  accessState.disabled ||
  (accessState.readonly && props.select === true);

const effectiveReadonly =
  !props.select && // Only apply readonly to text inputs, not selects
  (props.slotProps?.input?.readOnly || accessState.readonly);
```

---

## 4. Combination Rules Summary

### 4.1 Visibility Combination

```
Final Visibility = visibleWhen(engine) AND accessState.visible
```

- Both must be true to render
- If either is false, return null
- Independent concerns, evaluated separately

### 4.2 Disabled Combination

```
Final Disabled = props.disabled OR accessState.disabled OR (accessState.readonly AND props.select)
```

- OR logic: any source can disable
- User disable cannot be overridden by RBAC to enable
- Readonly + select mode → treat as disabled

### 4.3 Readonly Combination

```
Final Readonly = (props.slotProps.input.readOnly OR accessState.readonly) AND !props.select
```

- OR logic: any source can make readonly
- User readonly cannot be overridden by RBAC to make editable
- Only applies to text inputs, not select mode

### 4.4 SlotProps Merging

When RBAC sets readonly:

```typescript
slotProps: {
  ...props.slotProps,
  input: {
    ...props.slotProps?.input,
    readOnly: effectiveReadonly,
  },
}
```

- Deep merge required
- Preserve existing slotProps
- Override only `input.readOnly` when needed

---

## 5. Separation of Concerns

### 5.1 RBAC vs visibleWhen

**RBAC**:

- **Purpose**: Access control based on permissions
- **Source**: RBAC policy + subject roles
- **Question**: "Does this user have permission?"
- **Prop**: `access={{ resource, action, onUnauthorized }}`

**visibleWhen**:

- **Purpose**: Conditional rendering based on form state
- **Source**: Engine state (form values, reactions)
- **Question**: "Should this field show based on current form state?"
- **Prop**: `visibleWhen={(engine) => engine.getNode('country')?.value === 'US'}`

**Independence**:

- These are **separate concerns** that must NOT be mixed
- Both conditions are evaluated independently
- Both must be true for field to render
- No shared state or logic between them

**Code Separation**:

```typescript
// RBAC evaluation (uses RbacProvider context)
const accessState = useAccessState(access);

// Form state evaluation (uses Engine context)
const isVisibleWhen = useEngineVisibility(engine, visibleWhen);

// Independent early returns
if (!isVisibleWhen) return null;
if (!accessState.visible) return null;
```

### 5.2 RBAC vs Form Validation

**RBAC**:

- Controls **access** (can user interact?)
- Sets disabled/readonly state
- NOT related to validation

**Form Validation**:

- Controls **correctness** (is value valid?)
- Sets error/helperText
- Handled by Form Closure v1 rules

**No Interaction**:

- RBAC does NOT affect validation rules
- RBAC does NOT affect error display
- Validation errors can show on readonly fields (viewing existing invalid data)
- Separate code paths, no shared logic

### 5.3 RBAC vs Form Bridge

**RBAC**:

- Evaluates permissions via `RbacProvider`
- Uses `useRbac()` hook
- Returns access state (visible/disabled/readonly)

**Form Bridge**:

- Manages form state via `DashFormContext`
- Uses `bridge.register(name, rules)`
- Returns registration (value, onChange, onBlur)

**Integration Point**:

- Both systems are active simultaneously in bound mode
- RBAC controls **access state** → affects disabled/readonly
- Bridge controls **form state** → affects value/onChange
- No conflicts: different responsibilities

**Code Pattern**:

```typescript
// Form bridge (existing)
const bridge = useContext(DashFormContext);
const registration = bridge?.register(name, rules);

// RBAC (new)
const accessState = useAccessState(access);

// Combined rendering
<MuiTextField
  {...registration} // Bridge: value, onChange, onBlur
  disabled={effectiveDisabled} // RBAC: access control
  slotProps={effectiveSlotProps} // RBAC: readonly state
/>;
```

---

## 6. Proposed Integration Strategy

### 6.1 Hook Strategy: `useAccessState`

**Decision**: Create a shared internal hook `useAccessState` to resolve access state for TextField and future components.

**Location**: `libs/dashforge/ui/src/components/_internal/useAccessState.ts`

**Why Internal**:

- Shared across multiple components (TextField, Select, NumberField, etc.)
- NOT part of public API (consumers use `access` prop on components)
- Encapsulates RBAC integration complexity
- Ensures consistent behavior across all form components

**Hook Signature**:

```typescript
/**
 * Internal hook to resolve RBAC access state for a component.
 *
 * This hook evaluates the provided AccessRequirement against the current
 * RBAC context and returns the resolved access state (visible/disabled/readonly).
 *
 * If no access requirement is provided, returns default state (full access).
 *
 * @param access - Optional access requirement
 * @returns AccessState with visible, disabled, readonly flags
 *
 * @internal - For use by Dashforge UI components only
 */
export function useAccessState(
  access: AccessRequirement | undefined
): AccessState;
```

**Implementation Strategy**:

```typescript
import { useRbac } from '@dashforge/rbac';
import { resolveAccessState } from '@dashforge/rbac';
import type { AccessRequirement, AccessState } from '@dashforge/rbac';

export function useAccessState(
  access: AccessRequirement | undefined
): AccessState {
  const rbac = useRbac();

  // If no access requirement, grant full access (backward compatible)
  if (!access) {
    return {
      visible: true,
      disabled: false,
      readonly: false,
      granted: true,
    };
  }

  // Check access via RBAC
  const granted = rbac.can({
    resource: access.resource,
    action: access.action,
    resourceData: access.resourceData,
    environment: access.environment,
  });

  // Resolve to UI state
  return resolveAccessState(granted, access);
}
```

**Dependency Chain**:

- `useAccessState` → calls `useRbac()` (from `@dashforge/rbac`)
- `useAccessState` → calls `resolveAccessState()` (from `@dashforge/rbac`)
- TextField → calls `useAccessState()`

**Benefits**:

- Single source of truth for access resolution in UI layer
- Reusable across all form components
- Encapsulates RBAC dependency
- Easy to test independently
- Consistent behavior guarantee

### 6.2 TextField Integration Pattern

**Implementation Steps**:

1. Import dependencies:

```typescript
import { useAccessState } from '../_internal/useAccessState';
import type { AccessRequirement } from '@dashforge/rbac';
```

2. Add `access` prop to component signature:

```typescript
export function TextField(props: TextFieldProps) {
  const {
    name,
    rules,
    visibleWhen,
    layout = 'floating',
    disabled,
    access, // NEW
    ...rest
  } = props;
```

3. Call hook unconditionally at top level (after existing hooks):

```typescript
// Always call hooks at top level (unconditionally)
const bridge = useContext(DashFormContext) as DashFormBridge | null;
const engine = bridge?.engine;
const dashTheme = useDashTheme();

// Subscribe to form state changes
void bridge?.errorVersion;
void bridge?.touchedVersion;
// ... existing subscriptions

// Existing visibility hook
const isVisible = useEngineVisibility(engine, visibleWhen);

// NEW: RBAC access state hook
const accessState = useAccessState(access);
```

4. Add RBAC visibility check (after visibleWhen check):

```typescript
// Early return for visibleWhen
if (!isVisible) {
  return null;
}

// NEW: Early return for RBAC visibility
if (!accessState.visible) {
  return null;
}
```

5. Compute effective disabled state:

```typescript
// NEW: Compute effective disabled (OR logic)
const effectiveDisabled =
  disabled ||
  accessState.disabled ||
  (accessState.readonly && rest.select === true); // readonly select → disabled
```

6. Compute effective readonly state via slotProps:

```typescript
// NEW: Compute effective readonly for text inputs only
const effectiveReadonly =
  !rest.select && // Only for text inputs, not selects
  (rest.slotProps?.input?.readOnly || accessState.readonly);

// NEW: Merge slotProps with readonly state
const effectiveSlotProps = effectiveReadonly
  ? {
      ...rest.slotProps,
      input: {
        ...rest.slotProps?.input,
        readOnly: effectiveReadonly,
      },
    }
  : rest.slotProps;
```

7. Pass effective states to MUI TextField:

```typescript
<MuiTextField
  {...rest}
  {...registration} // If in bound mode
  id={fieldId}
  name={name}
  label={label}
  disabled={effectiveDisabled} // NEW: RBAC-aware
  slotProps={effectiveSlotProps} // NEW: RBAC-aware
  // ... other props
/>
```

**Key Points**:

- Hooks called unconditionally (React rules)
- Early returns only after all hooks
- OR logic for disabled and readonly
- Deep merge for slotProps
- Applied to ALL rendering paths (plain mode, bound mode, all layouts, select mode)

### 6.3 RbacProvider Requirement

**Dependency**: TextField RBAC integration requires `RbacProvider` in the component tree.

**When `access` prop is used**:

- `useAccessState` calls `useRbac()` internally
- `useRbac()` throws if no RbacProvider found
- Application must wrap TextField with `<RbacProvider>`

**Error Handling**:

- Let `useRbac()` throw naturally (standard React context error)
- Error message: "useRbac must be used within RbacProvider"
- No special handling needed in TextField
- This is expected behavior (same as DashFormContext requirement)

**Example Setup**:

```typescript
import { RbacProvider } from '@dashforge/rbac';
import { TextField } from '@dashforge/ui';

function App() {
  return (
    <RbacProvider policy={policy} subject={currentUser}>
      <TextField
        name="salary"
        label="Salary"
        access={{
          resource: 'employee',
          action: 'update',
          onUnauthorized: 'readonly',
        }}
      />
    </RbacProvider>
  );
}
```

**When `access` prop is NOT used**:

- No RbacProvider required
- `useAccessState` returns default full access state
- No RBAC evaluation occurs
- Backward compatible with existing usage

### 6.4 Package Dependency

**Add to `@dashforge/ui` peerDependencies**:

```json
{
  "peerDependencies": {
    "@dashforge/rbac": "workspace:*"
    // ... existing dependencies
  }
}
```

**Rationale**:

- TextField now imports from `@dashforge/rbac`
- Peer dependency allows consuming app to control version
- Workspace protocol ensures local development works

---

## 7. Test Plan

### 7.1 Test Categories

#### Category A: RBAC Integration (Unit Tests)

**File**: `TextField.rbac.test.tsx` (new file)

**Purpose**: Test RBAC-specific behavior in isolation

**Required Tests**:

1. **Access granted - full interactivity**

   - When access is granted, field is visible, enabled, writable
   - All user interactions work normally

2. **Access denied + hide - field not rendered**

   - When access denied with `onUnauthorized: 'hide'`, field returns null
   - No DOM output

3. **Access denied + disable - field visible but disabled**

   - When access denied with `onUnauthorized: 'disable'`, field renders
   - Field has `disabled={true}` attribute
   - User cannot interact with field

4. **Access denied + readonly - field visible but readonly**

   - When access denied with `onUnauthorized: 'readonly'`, field renders
   - Field has `readOnly={true}` attribute (via slotProps)
   - User cannot edit value (but can see it)

5. **Readonly + select mode - uses disabled instead**

   - When `select={true}` AND `onUnauthorized: 'readonly'`
   - Field uses `disabled={true}` instead of readonly
   - Prevents selection changes

6. **No access prop - full access by default**

   - When `access` prop is omitted, field behaves normally
   - Backward compatibility verified

7. **Disabled composition - OR logic**

   - User `disabled={false}`, RBAC disabled → field disabled
   - User `disabled={true}`, RBAC enabled → field disabled
   - User `disabled={true}`, RBAC disabled → field disabled

8. **Readonly composition - OR logic**

   - User readonly false, RBAC readonly → field readonly
   - User readonly true, RBAC enabled → field readonly
   - User readonly true, RBAC readonly → field readonly

9. **SlotProps merging**

   - When user provides `slotProps.input.readOnly={true}`, it's preserved
   - When RBAC adds readonly, existing slotProps are preserved
   - Deep merge works correctly

10. **RBAC + visibleWhen independence**

    - Both RBAC visibility and visibleWhen are checked independently
    - If visibleWhen returns false, field hidden (regardless of RBAC)
    - If RBAC visibility false, field hidden (regardless of visibleWhen)
    - Both must be true to render

11. **Resource-specific access**

    - Different resources have different access states
    - `access={{ resource: 'user', action: 'update' }}` → granted
    - `access={{ resource: 'admin', action: 'delete' }}` → denied

12. **Context conditions**
    - Access decision uses `resourceData` when provided
    - Conditional permissions work correctly
    - Field state updates when access decision changes

#### Category B: Regression Tests (Existing Tests)

**File**: `TextField.test.tsx` (existing file)

**Purpose**: Ensure existing behavior is NOT broken

**Required Validations**:

1. All existing plain mode tests still pass
2. All existing bound mode tests still pass
3. All existing error gating tests still pass
4. All existing layout tests still pass
5. All existing select mode tests still pass
6. No new console errors or warnings

**Note**: Existing tests should NOT be modified unless absolutely necessary. Add new RBAC tests separately.

#### Category C: Integration Tests (Optional for V1, Recommended for V2)

**File**: `TextField.integration.test.tsx` (future)

**Purpose**: Test TextField RBAC with real form integration

**Scope** (not required for V1):

- TextField inside DashForm with RBAC
- Form submission with readonly fields
- Validation + RBAC interaction
- Dynamic access changes during form interaction

### 7.2 Test Utilities

**RbacProvider Test Wrapper**:

Create a test utility to wrap components with RbacProvider:

```typescript
// File: libs/dashforge/ui/src/test-utils/rbac-test-utils.tsx

import { RbacProvider } from '@dashforge/rbac';
import type { RbacPolicy, Subject } from '@dashforge/rbac';

export function renderWithRbac(
  component: React.ReactElement,
  options?: {
    policy?: RbacPolicy;
    subject?: Subject;
  }
) {
  const defaultPolicy: RbacPolicy = {
    roles: [
      {
        name: 'admin',
        permissions: [{ resource: '*', action: '*', effect: 'allow' }],
      },
    ],
  };

  const defaultSubject: Subject = {
    id: 'test-user',
    roles: ['admin'],
  };

  return render(
    <RbacProvider
      policy={options?.policy ?? defaultPolicy}
      subject={options?.subject ?? defaultSubject}
    >
      {component}
    </RbacProvider>
  );
}

export function renderWithBridgeAndRbac(
  component: React.ReactElement,
  options?: {
    mockBridgeOptions?: any;
    policy?: RbacPolicy;
    subject?: Subject;
  }
) {
  // Combines existing renderWithBridge + RbacProvider
  const bridgeResult = renderWithBridge(component, {
    mockBridgeOptions: options?.mockBridgeOptions,
  });

  // Re-render with RBAC wrapper
  const { rerender } = bridgeResult;

  rerender(
    <RbacProvider
      policy={options?.policy ?? defaultPolicy}
      subject={options?.subject ?? defaultSubject}
    >
      {component}
    </RbacProvider>
  );

  return bridgeResult;
}
```

**Mock Policies for Testing**:

```typescript
// Policies for common test scenarios

export const FULL_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'user',
      permissions: [{ resource: '*', action: '*', effect: 'allow' }],
    },
  ],
};

export const NO_ACCESS_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'guest',
      permissions: [], // No permissions
    },
  ],
};

export const READ_ONLY_POLICY: RbacPolicy = {
  roles: [
    {
      name: 'viewer',
      permissions: [
        { resource: '*', action: 'read', effect: 'allow' },
        { resource: '*', action: 'update', effect: 'deny' },
        { resource: '*', action: 'delete', effect: 'deny' },
      ],
    },
  ],
};
```

### 7.3 Test Execution Strategy

**Test-Driven Development (TDD)**:

1. **Phase 1**: Write all RBAC integration tests FIRST (before implementation)

   - All tests should fail initially
   - Tests define expected behavior

2. **Phase 2**: Implement `useAccessState` hook

   - Get basic hook tests passing

3. **Phase 3**: Implement TextField integration

   - Get all RBAC tests passing one by one

4. **Phase 4**: Run all existing tests

   - Verify no regressions
   - Fix any breaking changes

5. **Phase 5**: Run typecheck + all tests
   - Ensure 100% pass rate
   - No skipped tests

**Coverage Target**:

- RBAC integration code: 100% coverage
- Overall TextField: Maintain existing coverage (currently high)

---

## 8. Explicit Exclusions from V1

### 8.1 NOT Included in TextField RBAC V1

**Component-Level Features**:

- ❌ `onAccessDenied` callback prop
- ❌ Custom unauthorized UI (e.g., lock icon)
- ❌ Tooltips explaining why field is disabled/readonly
- ❌ Programmatic access checks from props (use RBAC directly)
- ❌ Role-based styling (e.g., different colors for admins)

**Access Features**:

- ❌ Async permission checks
- ❌ Dynamic access requirement updates (access prop is static)
- ❌ Field-level permission caching (use global RBAC caching in V2)
- ❌ Compound requirements (AND/OR logic - single requirement only)

**Integration Features**:

- ❌ Automatic audit logging of access denials
- ❌ DevTools integration (show access state in inspector)
- ❌ Access state debugging UI
- ❌ Permission request workflow (e.g., "Request Access" button)

**Form Integration**:

- ❌ Automatic validation rule updates based on access
- ❌ Conditional required rules based on permissions
- ❌ Form-level access aggregation
- ❌ Submit button disabling based on field access states

**Advanced Patterns**:

- ❌ Row-level access in multi-field contexts
- ❌ Contextual access based on field value
- ❌ Time-based access restrictions
- ❌ Field-level encryption based on permissions

### 8.2 Deferred to Future Phases

**Phase 2: Other Form Components**

- Select RBAC integration
- NumberField RBAC integration
- DatePicker RBAC integration
- Checkbox RBAC integration
- Radio RBAC integration

**Phase 3: Button RBAC Integration**

- Button `access` prop
- Action buttons with access control
- Submit button with aggregated form access

**Phase 4: Complex Components**

- DataTable row/column access
- Tabs access control
- Wizard step access

**Phase 5: Enhanced UX**

- Visual indicators for readonly/disabled due to permissions
- Tooltips explaining access denial
- "Request Access" workflows

**V2 Features**:

- Compound access requirements
- Access check caching
- Audit logging
- DevTools integration

---

## 9. Rollout Notes for Future Component Integrations

### 9.1 TextField as Template

TextField serves as the **canonical template** for all future form component RBAC integrations.

**Reusable Pattern**:

1. **Add `access` prop** to component types
2. **Call `useAccessState(access)`** unconditionally at top level
3. **Add RBAC visibility check** after existing visibility checks
4. **Compute effective disabled** with OR logic
5. **Compute effective readonly** (if applicable) with OR logic
6. **Merge slotProps** for readonly state
7. **Pass effective states** to underlying MUI component

**Copy-Paste-Adapt Strategy**:

For each new component:

- Copy TextField RBAC integration code
- Adapt prop names (e.g., some components don't have `disabled`)
- Adapt readonly implementation (some components use different props)
- Copy test structure from `TextField.rbac.test.tsx`
- Adapt test cases to component-specific behavior

### 9.2 Component-Specific Considerations

**Select Component**:

- Same pattern as TextField
- Readonly → disabled (no native readonly for select)
- Already handles this in TextField select mode

**NumberField Component**:

- Same pattern as TextField
- Supports readonly via slotProps.input.readOnly
- No special handling needed

**Checkbox Component**:

- Supports disabled
- Does NOT support readonly (checkboxes can't be readonly in HTML)
- Readonly mode → use disabled instead
- Document this behavior explicitly

**Radio Component**:

- Same as Checkbox
- Readonly → disabled

**DatePicker Component**:

- Supports disabled
- Supports readonly
- May require special handling for MUI DatePicker API
- Test carefully with calendar popup interaction

**Button Component** (different pattern):

- No readonly concept
- Only visible/hidden and enabled/disabled
- Simpler integration
- Use `filterActions` utility instead of component-level access

### 9.3 Shared Hook Reuse

**All form components** should use the same `useAccessState` hook:

```typescript
// Component implementation
import { useAccessState } from '../_internal/useAccessState';

export function SomeFormComponent(props: SomeProps) {
  const accessState = useAccessState(props.access);

  // Same pattern for all components
  if (!accessState.visible) return null;

  const effectiveDisabled = props.disabled || accessState.disabled;
  // ... etc
}
```

**Benefits**:

- Consistent behavior across all components
- Single source of truth for access resolution
- Easy to update globally if needed
- Testable in isolation

### 9.4 Testing Template

**For each component**, create:

- `ComponentName.rbac.test.tsx` with same test structure as TextField
- Adapt test cases to component-specific behavior
- Reuse `renderWithRbac` and `renderWithBridgeAndRbac` utilities
- Use same mock policies

**Test Checklist** (copy for each component):

- ✅ Access granted - full interactivity
- ✅ Access denied + hide - not rendered
- ✅ Access denied + disable - visible but disabled
- ✅ Access denied + readonly - visible but readonly (if applicable)
- ✅ No access prop - full access by default
- ✅ Disabled composition - OR logic
- ✅ Readonly composition - OR logic (if applicable)
- ✅ RBAC + visibleWhen independence
- ✅ SlotProps/props merging
- ✅ No regressions in existing tests

### 9.5 Documentation Template

For each integrated component, document:

**Usage Example**:

```typescript
<ComponentName
  name="fieldName"
  access={{
    resource: 'resourceName',
    action: 'actionName',
    onUnauthorized: 'hide' | 'disable' | 'readonly',
  }}
/>
```

**Behavior Table**:
| Access | onUnauthorized | Result |
|--------|----------------|--------|
| Granted | (any) | Interactive |
| Denied | hide | Not rendered |
| Denied | disable | Visible, disabled |
| Denied | readonly | Visible, readonly |

**Special Considerations**:

- Document component-specific readonly handling
- Document any limitations (e.g., checkbox readonly → disabled)
- Document prop composition rules

---

## 10. Implementation Checklist

### Phase 1: Foundation

- [ ] Add `@dashforge/rbac` to `@dashforge/ui` peerDependencies
- [ ] Create `useAccessState` hook in `libs/dashforge/ui/src/components/_internal/useAccessState.ts`
- [ ] Write unit tests for `useAccessState` hook
- [ ] Verify hook tests pass

### Phase 2: Type Definitions

- [ ] Add `access?: AccessRequirement` to `TextFieldProps` in `textField.types.ts`
- [ ] Import `AccessRequirement` type from `@dashforge/rbac`
- [ ] Verify typecheck passes

### Phase 3: Test Setup (TDD)

- [ ] Create test utilities in `test-utils/rbac-test-utils.tsx`
- [ ] Create `TextField.rbac.test.tsx` with all test cases (tests should FAIL initially)
- [ ] Verify tests run and fail as expected

### Phase 4: TextField Implementation

- [ ] Import `useAccessState` in TextField.tsx
- [ ] Destructure `access` prop
- [ ] Call `useAccessState(access)` hook
- [ ] Add RBAC visibility check
- [ ] Compute `effectiveDisabled` with OR logic
- [ ] Compute `effectiveReadonly` with OR logic
- [ ] Merge `effectiveSlotProps`
- [ ] Update all MUI TextField rendering paths (plain mode, bound mode, all layouts, select mode)
- [ ] Verify RBAC tests start passing

### Phase 5: Regression Testing

- [ ] Run all existing TextField tests
- [ ] Verify no regressions
- [ ] Fix any breaking changes
- [ ] Verify all tests pass (new + existing)

### Phase 6: Validation

- [ ] Run `npx nx run @dashforge/ui:typecheck` → 0 errors
- [ ] Run `npx nx run @dashforge/ui:test` → all tests pass
- [ ] Run `npx nx run @dashforge/ui:test --coverage` → verify coverage
- [ ] No skipped tests
- [ ] No console.log in production code

### Phase 7: Documentation

- [ ] Create build report at `.opencode/reports/textfield-rbac-build-report.md`
- [ ] Document all changes
- [ ] Document test results
- [ ] Document any discoveries or deviations from plan

---

## 11. Success Criteria

### Functional Requirements

- ✅ TextField supports `access` prop
- ✅ Access granted → field is interactive
- ✅ Access denied + hide → field not rendered
- ✅ Access denied + disable → field disabled
- ✅ Access denied + readonly → field readonly (text mode) or disabled (select mode)
- ✅ No `access` prop → backward compatible behavior
- ✅ RBAC and visibleWhen are independent
- ✅ Disabled composition uses OR logic
- ✅ Readonly composition uses OR logic
- ✅ SlotProps merging preserves existing slotProps

### Technical Requirements

- ✅ TypeScript strict mode compliance (0 errors)
- ✅ All new tests pass
- ✅ All existing tests pass (no regressions)
- ✅ 0 skipped tests
- ✅ No console.log in production code
- ✅ Test coverage maintained or improved
- ✅ TDD discipline followed (tests before implementation)

### Architectural Requirements

- ✅ RBAC logic is centralized in `useAccessState` hook
- ✅ `resolveAccessState` from `@dashforge/rbac` is used correctly
- ✅ No duplicate access resolution logic
- ✅ No wrapper components introduced
- ✅ Clean separation from visibleWhen
- ✅ Clean separation from form validation
- ✅ Single source of truth for unauthorized behavior (AccessRequirement.onUnauthorized)

### Documentation Requirements

- ✅ Build report created with all implementation details
- ✅ Test results documented
- ✅ Usage examples provided
- ✅ Rollout template documented for future components

---

## 12. Risk Assessment

### Low Risk

- ✅ **Pattern Reuse**: useAccessState follows same pattern as useEngineVisibility
- ✅ **Backward Compatibility**: `access` prop is optional, existing code unaffected
- ✅ **Test Coverage**: TDD approach ensures behavior is validated before implementation

### Medium Risk

- ⚠️ **SlotProps Merging Complexity**: Deep merge required for readonly state

  - **Mitigation**: Comprehensive tests for slotProps scenarios
  - **Fallback**: Document any edge cases discovered during testing

- ⚠️ **Select Mode Readonly Handling**: Select doesn't support readonly natively
  - **Mitigation**: Use disabled state for readonly+select (documented behavior)
  - **Validation**: Explicit test case for this scenario

### High Risk

- 🔴 **None identified** - This is a low-risk addition due to optional prop and TDD approach

### Contingency Plans

- If slotProps merging proves too complex → Start with simpler approach (override only, no merge) and document limitation
- If select readonly handling is confusing → Add explicit error message in development mode
- If performance issues arise → Add memoization to `useAccessState` hook

---

## 13. Conclusion

This plan defines a **minimal, complete, and production-ready** RBAC integration for TextField.

**Key Achievements**:

- ✅ Single `access` prop for RBAC control
- ✅ Clean separation from visibleWhen and form validation
- ✅ Reusable `useAccessState` hook for future components
- ✅ Comprehensive test plan with TDD approach
- ✅ Full backward compatibility
- ✅ Clear rollout template for other components

**Next Steps**:

1. Get plan approval
2. Execute TDD implementation (tests first)
3. Validate with typecheck + tests
4. Document in build report
5. Use as template for Select, NumberField, etc.

**The foundation is solid. This plan is ready for execution.**

---

**Plan Author**: OpenCode AI  
**Review Status**: Awaiting human review  
**Approval**: Pending
