# Implementation Plan: Intelligent Select Component

**Status**: PLAN MODE - Ready for Review  
**Date**: February 23, 2026  
**Component**: `@dashforge/ui` Select  
**Pattern**: Bridge-driven architecture (TextField pattern)

---

## Executive Summary

This plan details the implementation of an intelligent `Select` component that mirrors the existing intelligent `TextField` architecture. The Select component will:

- Use the same bridge-driven integration via `DashFormBridge`
- Implement identical error gating logic (touched OR submitCount > 0)
- Preserve explicit props precedence
- Support dot-notation names
- Maintain clean package boundaries (no RHF imports in `@dashforge/ui`)

**Key Decision**: No new bridge methods required. The existing `DashFormBridge` contract provides all necessary functionality.

---

## 1. Inventory (Existing Patterns)

### 1.1 Current Intelligent TextField Implementation

**Location**: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui/src/components/TextField/TextField.tsx`

**Architecture Overview**:

- 107 lines total
- Intelligent form-aware component
- Clean separation from form implementation

### 1.2 Value Binding Mechanism

#### Read Path (How TextField Gets Values)

TextField delegates value reading to React Hook Form's registration system:

1. **Registration** (line 73):

   ```typescript
   const registration: FieldRegistration = bridge.register(name, rules);
   ```

2. **Bridge Implementation** (DashFormProvider.tsx lines 154-192):

   - Calls `rhf.register(fieldName, rules)` internally
   - RHF registration object includes value binding logic
   - Returns object with `onChange`, `onBlur`, `ref`, `value` properties

3. **Props Spreading** (line 96):
   ```typescript
   <MuiTextField {...rest} {...registration} name={name} />
   ```
   The registration object contains the current value from RHF state

#### Write Path (How TextField Updates Values)

Values are written through a wrapped onChange handler:

1. **onChange Wrapper** (DashFormProvider.tsx lines 163-186):

   ```typescript
   const wrappedOnChange = async (event: unknown) => {
     // 1. Call original RHF onChange (updates RHF state)
     const result = await originalOnChange(event as never);

     // 2. Extract value from event
     let value: unknown;
     if (event?.target?.value !== undefined) {
       value = event.target.value;
     } else {
       value = event;
     }

     // 3. Sync value to Engine
     adapter.syncValueToEngine(fieldName, value);

     return result;
   };
   ```

2. **Data Flow**:
   ```
   User Input → MUI TextField onChange
     ↓
   RHF onChange (updates form state)
     ↓
   Wrapped onChange (sync to Engine)
     ↓
   adapter.syncValueToEngine()
     ↓
   engine.updateNode()
   ```

**Critical Insight**: TextField does NOT directly read or write values. It relies entirely on the registration object from `bridge.register()` which handles all value binding.

### 1.3 Bridge Access Pattern

**Context Import** (line 4):

```typescript
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
```

**Context Access** (line 48):

```typescript
const bridge = useContext(DashFormContext) as DashFormBridge | null;
```

**Bridge Type**:

- Defined at: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui-core/src/bridge/DashFormBridge.ts`
- Provided by: `/Users/mcs/projects/web/dashforge/libs/dashforge/forms/src/core/DashFormProvider.tsx`

### 1.4 Error Binding + Gating Logic

**Implementation** (TextField.tsx lines 76-91):

```typescript
// Get auto error from form validation
const autoErr = bridge.getError?.(name) ?? null;

// Get touched state and submit count for error gating
const autoTouched = bridge.isTouched?.(name) ?? false;
const submitCount = bridge.submitCount ?? 0;

// Gate error display: only show if field touched OR form submitted
const allowAutoError = autoTouched || submitCount > 0;

// Compute resolved props with precedence:
// 1. Explicit props override auto values (explicit wins)
// 2. Auto values from form validation (gated by touched/submit)
const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
const resolvedHelperText =
  rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);
```

**Gating Rules**:

- Show errors when: field touched (after blur) OR form submitted (submitCount > 0)
- Hide errors when: field untouched AND form not submitted
- Purpose: Prevents validation error spam while user is typing

### 1.5 Reactive Subscription Pattern

**Version String Subscription** (TextField.tsx lines 54-61):

```typescript
// Subscribe to form state changes by accessing version strings
// @ts-expect-error - Intentionally unused, for subscription only
const _errorVersion = bridge?.errorVersion;
// @ts-expect-error - Intentionally unused, for subscription only
const _touchedVersion = bridge?.touchedVersion;
// @ts-expect-error - Intentionally unused, for subscription only
const _dirtyVersion = bridge?.dirtyVersion;
// @ts-expect-error - Intentionally unused, for subscription only
const _submitCount = bridge?.submitCount;
```

**Purpose**: Ensures component re-renders when validation state changes in the form.

### 1.6 Shared Utilities and Hooks

**Hook: `useEngineVisibility`**

- **Location**: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui-core/src/react/useEngineVisibility.ts`
- **Purpose**: Reactive visibility evaluation based on engine state
- **Usage** (TextField.tsx lines 64, 67-69):
  ```typescript
  const isVisible = useEngineVisibility(engine, visibleWhen);
  if (!isVisible) return null;
  ```
- **Used by**: Both TextField (current) and Select (future)

**No other shared utilities** are required for basic integration.

---

## 2. Component API Proposal (Select)

### 2.1 Props Interface

```typescript
export interface SelectProps<T = string> extends Omit<MuiSelectProps, 'name'> {
  /**
   * Field name (required).
   * Supports dot-notation for nested fields (e.g., "address.country").
   */
  name: string;

  /**
   * Validation rules (opaque to Select, passed to bridge.register).
   * Follows React Hook Form validation rule format.
   */
  rules?: unknown;

  /**
   * Label text displayed above the select.
   * Used with MUI InputLabel component.
   */
  label?: string;

  /**
   * Array of options to display in the select dropdown.
   * Each option has a value (stored in form) and label (displayed to user).
   */
  options: Array<{ value: T; label: string }>;

  /**
   * Placeholder text shown when no option is selected.
   * Renders as a disabled MenuItem with empty string value.
   */
  placeholder?: string;

  /**
   * Reactive visibility condition based on engine state.
   * If false, component returns null.
   */
  visibleWhen?: (engine: Engine) => boolean;

  /**
   * Override auto error state from form validation.
   * Explicit error prop always wins over auto error.
   */
  error?: boolean;

  /**
   * Override auto helper text from form validation.
   * Explicit helperText prop always wins over auto error message.
   */
  helperText?: string;

  // All other MUI Select props are supported via spread
}
```

### 2.2 API Design Rationale

#### Why `options: Array<{ value: T; label: string }>`?

**Pros**:

- ✅ Simple, declarative API
- ✅ Clear data structure
- ✅ Easy to map from backend data
- ✅ TypeScript-friendly
- ✅ Consistent with common Select patterns

**Cons**:

- ❌ Less flexible than children-based API
- ❌ Requires data transformation if options come in different format

**Decision**: Use `options` array for v1. This matches the most common use case and provides the simplest API.

#### Why `placeholder?: string` instead of empty option handling?

**Rationale**:

- User-friendly: Placeholder clearly indicates "no selection"
- Consistent with TextField API (which has placeholder)
- Simple implementation: Renders as disabled MenuItem with empty value
- Common pattern in form libraries

**Implementation**:

```typescript
{
  placeholder && (
    <MenuItem value="" disabled>
      {placeholder}
    </MenuItem>
  );
}
```

#### Why Generic Type `<T = string>`?

**Rationale**:

- Supports both string and number values (common for select fields)
- Default to string for simplicity
- TypeScript provides type safety for option values
- Future-proof for complex value types

**V1 Scope**: Support string and number values only. Complex object values are out of scope.

#### Controlled vs Uncontrolled Behavior

**Decision**: Follow TextField pattern - **uncontrolled by bridge, controlled by RHF**.

- Select does NOT manage its own value state
- Value is read from `registration.value` (provided by bridge.register)
- Updates flow through `registration.onChange` handler
- This ensures single source of truth (RHF state)

---

## 3. Value Binding Design

### 3.1 Value Read Mechanism

Select will use **identical pattern** to TextField:

```typescript
// 1. Get registration object from bridge
const registration: FieldRegistration = bridge.register(name, rules);

// 2. Spread registration onto MUI Select
// registration.value contains current field value from RHF
<MuiSelect {...registration} name={name}>
  {/* options */}
</MuiSelect>;
```

**Data Flow**:

```
RHF State (source of truth)
  ↓
bridge.register() returns registration object
  ↓
registration.value contains current value
  ↓
Spread onto MUI Select component
  ↓
MUI Select displays current selection
```

**No direct value reading required**. The registration object handles everything.

### 3.2 Value Write Mechanism

Select will use **identical pattern** to TextField:

```typescript
// 1. bridge.register() wraps RHF's onChange handler
const registration = bridge.register(name, rules);

// 2. registration.onChange intercepts MUI Select's onChange
// 3. Extracts value from event.target.value
// 4. Updates RHF state + syncs to Engine

<MuiSelect onChange={registration.onChange}>
  {/* MUI fires onChange with { target: { value: selectedValue } } */}
</MuiSelect>;
```

**Data Flow**:

```
User selects option
  ↓
MUI Select fires onChange(event)
  ↓
registration.onChange receives event
  ↓
Extracts event.target.value
  ↓
Updates RHF state
  ↓
Syncs to Engine via adapter.syncValueToEngine()
  ↓
TextField re-renders with new value
```

**No custom onChange logic required**. The wrapped handler from `bridge.register()` handles everything.

### 3.3 Value Type Mapping

MUI Select's `event.target.value` type depends on what's stored in MenuItem's `value` prop:

- If `<MenuItem value="foo">` → `event.target.value` is string `"foo"`
- If `<MenuItem value={42}>` → `event.target.value` is number `42`

**V1 Decision**: Support string and number values only.

**Implementation**:

```typescript
{
  options.map((option) => (
    <MenuItem key={String(option.value)} value={option.value}>
      {option.label}
    </MenuItem>
  ));
}
```

MUI Select will automatically handle type preservation for string/number values.

### 3.4 Empty Value Handling

**Scenario**: User hasn't selected anything, or field is cleared.

**V1 Strategy**:

- Empty value is represented as `""` (empty string)
- Placeholder MenuItem has `value=""` and `disabled`
- MUI Select shows placeholder when current value is `""`
- Form validation can use `required` rule to enforce selection

**Example**:

```typescript
<Select
  name="country"
  placeholder="Select a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
  ]}
  rules={{ required: 'Please select a country' }}
/>
```

If field is untouched, `value=""` → placeholder shows → no error until touched/submit.

---

## 4. Error Binding + Gating (Mirroring TextField)

### 4.1 Exact Algorithm

```typescript
// STEP 1: Get auto error from form validation
const autoErr = bridge.getError?.(name) ?? null;

// STEP 2: Get gating conditions
const autoTouched = bridge.isTouched?.(name) ?? false;
const submitCount = bridge.submitCount ?? 0;

// STEP 3: Apply gating logic
// Show errors only when field touched OR form submitted
const allowAutoError = autoTouched || submitCount > 0;

// STEP 4: Resolve final error state with explicit precedence
// Explicit props ALWAYS win over auto values
const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
const resolvedHelperText =
  rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);

// STEP 5: Pass resolved values to MUI components
<FormControl error={resolvedError}>
  <Select {...registration} />
  <FormHelperText>{resolvedHelperText}</FormHelperText>
</FormControl>;
```

### 4.2 Gating Behavior Verification

**Scenario 1**: Field is required but untouched

- `autoErr` = `{ message: "Required" }`
- `autoTouched` = `false`
- `submitCount` = `0`
- `allowAutoError` = `false`
- **Result**: No error shown ✅

**Scenario 2**: Field is required, user blurs without selecting

- `autoErr` = `{ message: "Required" }`
- `autoTouched` = `true` (blur fired)
- `submitCount` = `0`
- `allowAutoError` = `true`
- **Result**: Error shown ✅

**Scenario 3**: Field is required, untouched, form submitted

- `autoErr` = `{ message: "Required" }`
- `autoTouched` = `false`
- `submitCount` = `1` (form submitted)
- `allowAutoError` = `true`
- **Result**: Error shown ✅

**Scenario 4**: Field is required, error shown, user selects valid option

- `autoErr` = `null` (validation passed)
- `autoTouched` = `true`
- `submitCount` = `1`
- `allowAutoError` = `true`
- `resolvedError` = `false` (no error)
- **Result**: Error cleared ✅

**Scenario 5**: Explicit error prop overrides auto error

- `rest.error` = `true` (explicit)
- `autoErr` = `null` (no validation error)
- `resolvedError` = `rest.error` = `true`
- **Result**: Error shown (explicit wins) ✅

### 4.3 Explicit Precedence Rules

**Precedence Order** (highest to lowest):

1. **Explicit `error` prop** → Always wins
2. **Explicit `helperText` prop** → Always wins
3. **Auto error** (from `bridge.getError()`) → Only if gating allows
4. **Auto helper text** (from `autoErr?.message`) → Only if gating allows

**Code Pattern**:

```typescript
const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
const resolvedHelperText =
  rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);
```

The `??` (nullish coalescing) operator ensures explicit props are never overridden.

---

## 5. MUI Wiring Details

### 5.1 Component Structure

Select requires a different MUI component hierarchy than TextField:

**TextField uses**:

```tsx
<MuiTextField
  label="..."
  error={...}
  helperText="..."
/>
```

(Single component, label/error/helperText are props)

**Select requires**:

```tsx
<FormControl error={resolvedError}>
  <InputLabel id={`${name}-label`}>{label}</InputLabel>
  <MuiSelect
    labelId={`${name}-label`}
    label={label}
    {...registration}
    name={name}
  >
    {placeholder && (
      <MenuItem value="" disabled>
        {placeholder}
      </MenuItem>
    )}
    {options.map((option) => (
      <MenuItem key={String(option.value)} value={option.value}>
        {option.label}
      </MenuItem>
    ))}
  </MuiSelect>
  {resolvedHelperText && <FormHelperText>{resolvedHelperText}</FormHelperText>}
</FormControl>
```

### 5.2 Why This Structure?

**FormControl**:

- Container that manages the form field's context
- Propagates `error` state to children
- Provides proper spacing and layout

**InputLabel**:

- Displays the label text above the select
- Must have `id` that matches Select's `labelId` for accessibility
- Automatically handles floating/shrinking based on Select state

**Select**:

- The actual dropdown component
- Must have `labelId` matching InputLabel's `id`
- Must also have `label` prop for proper outline rendering
- Receives registration props (value, onChange, onBlur, ref)

**MenuItem**:

- Individual options in the dropdown
- `value` prop determines what's stored in form state
- Children determine what's displayed to user

**FormHelperText**:

- Displays helper text or error message below select
- Automatically styled red when FormControl has error=true
- Only rendered if resolvedHelperText exists

### 5.3 Label ID Pattern

**Why labelId is needed**:

- Accessibility: Screen readers announce label when Select is focused
- MUI requirement: Select needs `labelId` to function properly with InputLabel

**ID generation**:

```typescript
const labelId = `${name}-label`;
```

**Usage**:

```tsx
<InputLabel id={labelId}>{label}</InputLabel>
<MuiSelect labelId={labelId} label={label}>
```

**Edge Case**: If no label prop provided, don't render InputLabel:

```typescript
{label && <InputLabel id={labelId}>{label}</InputLabel>}
<MuiSelect labelId={label ? labelId : undefined} label={label}>
```

### 5.4 Error State Propagation

**How error affects visual appearance**:

1. `FormControl error={true}` → Applies error context
2. `InputLabel` → Text color changes to red (via FormControl context)
3. `Select` → Outline/border color changes to red (via FormControl context)
4. `FormHelperText` → Text color is red (via FormControl context)

**No manual styling required**. MUI's context system handles everything.

### 5.5 Complete Component Template

```typescript
export function Select<T = string>(props: SelectProps<T>) {
  const { name, rules, label, options, placeholder, visibleWhen, ...rest } =
    props;

  // [Hook calls: bridge, engine, subscription, visibility...]

  if (!isVisible) return null;

  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);
    const autoErr = bridge.getError?.(name) ?? null;
    const autoTouched = bridge.isTouched?.(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;
    const allowAutoError = autoTouched || submitCount > 0;
    const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
    const resolvedHelperText =
      rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);

    const labelId = label ? `${name}-label` : undefined;

    return (
      <FormControl error={resolvedError} fullWidth>
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <MuiSelect
          {...rest}
          {...registration}
          name={name}
          labelId={labelId}
          label={label}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={String(option.value)} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {resolvedHelperText && (
          <FormHelperText>{resolvedHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Standalone fallback
  const labelId = label ? `${name}-label` : undefined;
  return (
    <FormControl fullWidth>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect {...rest} name={name} labelId={labelId} label={label}>
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
```

---

## 6. Implementation Steps

### 6.1 File Creation

**File**: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui/src/components/Select/Select.tsx`

**Imports Required**:

```typescript
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MuiSelect from '@mui/material/Select';
import type { SelectProps as MuiSelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import { useContext } from 'react';
import { DashFormContext, useEngineVisibility } from '@dashforge/ui-core';
import type {
  DashFormBridge,
  FieldRegistration,
  Engine,
} from '@dashforge/ui-core';
```

### 6.2 Component Structure (Following TextField Pattern)

```typescript
export interface SelectProps<T = string> extends Omit<MuiSelectProps, 'name'> {
  name: string;
  rules?: unknown;
  label?: string;
  options: Array<{ value: T; label: string }>;
  placeholder?: string;
  visibleWhen?: (engine: Engine) => boolean;
  error?: boolean;
  helperText?: string;
}

/**
 * Intelligent Select component.
 *
 * Behavior:
 * - If used inside DashForm → integrates via DashFormBridge
 * - If used outside → behaves as plain MUI Select
 * - Supports reactive visibility via visibleWhen prop
 * - Auto binds error + helperText from form validation
 *
 * Error Display Gating (Form Closure v1):
 * - Errors show only when field is touched (after blur) OR form submitted
 * - Prevents error spam before user interaction
 *
 * Precedence:
 * - Explicit error/helperText props override auto values
 *
 * This component does NOT depend on:
 * - react-hook-form
 * - @dashforge/forms
 *
 * It only depends on the bridge contract from @dashforge/ui-core.
 */
export function Select<T = string>(props: SelectProps<T>) {
  const { name, rules, label, options, placeholder, visibleWhen, ...rest } =
    props;

  // DEV ONLY: Render instrumentation
  if (process.env.NODE_ENV !== 'production') {
    console.log('Select render:', name);
  }

  // Always call hooks at top level
  const bridge = useContext(DashFormContext) as DashFormBridge | null;
  const engine = bridge?.engine;

  // Subscribe to form state changes
  // @ts-expect-error - Intentionally unused, for subscription only
  const _errorVersion = bridge?.errorVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _touchedVersion = bridge?.touchedVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _dirtyVersion = bridge?.dirtyVersion;
  // @ts-expect-error - Intentionally unused, for subscription only
  const _submitCount = bridge?.submitCount;

  const isVisible = useEngineVisibility(engine, visibleWhen);

  if (!isVisible) {
    return null;
  }

  // If inside DashForm, register with form
  if (bridge && typeof bridge.register === 'function') {
    const registration: FieldRegistration = bridge.register(name, rules);

    // Get auto error from form validation
    const autoErr = bridge.getError?.(name) ?? null;

    // Get touched state and submit count for error gating
    const autoTouched = bridge.isTouched?.(name) ?? false;
    const submitCount = bridge.submitCount ?? 0;

    // Gate error display
    const allowAutoError = autoTouched || submitCount > 0;

    // Compute resolved props with precedence
    const resolvedError = rest.error ?? (Boolean(autoErr) && allowAutoError);
    const resolvedHelperText =
      rest.helperText ?? (allowAutoError ? autoErr?.message : undefined);

    const labelId = label ? `${name}-label` : undefined;

    return (
      <FormControl error={resolvedError} fullWidth>
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <MuiSelect
          {...rest}
          {...registration}
          name={name}
          labelId={labelId}
          label={label}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              {placeholder}
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem key={String(option.value)} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </MuiSelect>
        {resolvedHelperText && (
          <FormHelperText>{resolvedHelperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Standalone fallback
  const labelId = label ? `${name}-label` : undefined;
  return (
    <FormControl fullWidth>
      {label && <InputLabel id={labelId}>{label}</InputLabel>}
      <MuiSelect {...rest} name={name} labelId={labelId} label={label}>
        {placeholder && (
          <MenuItem value="" disabled>
            {placeholder}
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={String(option.value)} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  );
}
```

### 6.3 Index File

**File**: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui/src/components/Select/index.ts`

```typescript
export { Select } from './Select';
export type { SelectProps } from './Select';
```

### 6.4 Package Export

**File**: `/Users/mcs/projects/web/dashforge/libs/dashforge/ui/src/index.ts`

Add export:

```typescript
export { Select } from './components/Select';
export type { SelectProps } from './components/Select';
```

---

## 7. Docs Demo & Verification

### 7.1 Demo Page Location

**Recommended Approach**: Extend existing Form Stress page.

**Location**: `/Users/mcs/projects/web/dashforge/docs/src/pages/form-stress/`

**Why**?

- Already has comprehensive TextField validation tests
- Easy to add Select alongside TextField
- Can test Select/TextField interaction
- Users can compare behavior side-by-side

**Alternative**: Create dedicated Select demo page at `/docs/src/pages/select-demo/` if Select needs isolated testing.

### 7.2 Test Cases (3-5 Required Scenarios)

Add new section to `StressForm.tsx` or create `SelectStressSection.tsx`:

#### Test Case 1: Required Select + Gating Behavior

```typescript
<Select
  name="country"
  label="Country (Required)"
  placeholder="Select a country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
    { value: 'uk', label: 'United Kingdom' },
  ]}
  rules={{ required: 'Please select a country' }}
/>
```

**Expected Behavior**:

- Initially: No error shown (field untouched, form not submitted)
- After blur without selecting: Error shown ("Please select a country")
- After form submit without selecting: Error shown
- After selecting valid option: Error clears

#### Test Case 2: Submit Shows Error on Untouched Select

```typescript
<Select
  name="language"
  label="Language (Required)"
  placeholder="Select a language"
  options={[
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
  ]}
  rules={{ required: 'Language is required' }}
/>

<Button type="submit">Submit</Button>
```

**Expected Behavior**:

- Initially: No error (untouched)
- Click Submit without touching Select: Error appears ("Language is required")
- Select a value: Error clears
- Submit again: Form validates successfully

#### Test Case 3: Selecting Valid Option Clears Error

```typescript
<Select
  name="role"
  label="Role (Required)"
  placeholder="Select a role"
  options={[
    { value: 'admin', label: 'Administrator' },
    { value: 'user', label: 'User' },
    { value: 'guest', label: 'Guest' },
  ]}
  rules={{ required: 'Role is required' }}
/>
```

**Test Flow**:

1. Submit form → error shows
2. Select "User" → error clears immediately
3. Clear selection (if Select is clearable) → error shows again

#### Test Case 4: Explicit helperText Override

```typescript
<Select
  name="timezone"
  label="Timezone"
  placeholder="Select timezone"
  helperText="This is explicit helper text (always shown)"
  options={[
    { value: 'est', label: 'Eastern Time' },
    { value: 'pst', label: 'Pacific Time' },
  ]}
  rules={{ required: 'Timezone is required' }}
/>
```

**Expected Behavior**:

- Helper text shows "This is explicit helper text" even when validation error exists
- Explicit helperText wins over auto error message
- Error state (red border) still applies if validation fails

#### Test Case 5: Dot-Notation Name Test

```typescript
<Select
  name="address.country"
  label="Country"
  placeholder="Select country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' },
  ]}
  rules={{ required: 'Country is required' }}
/>

<Select
  name="address.state"
  label="State"
  placeholder="Select state"
  options={[
    { value: 'ny', label: 'New York' },
    { value: 'ca', label: 'California' },
  ]}
  rules={{ required: 'State is required' }}
/>
```

**Expected Behavior**:

- Form values stored as `{ address: { country: 'us', state: 'ny' } }`
- Each field validates independently
- Error gating works correctly for nested fields

### 7.3 Demo Page Implementation

**File**: `/Users/mcs/projects/web/dashforge/docs/src/pages/form-stress/SelectStressSection.tsx`

```typescript
import { Select } from '@dashforge/ui';
import { Box, Typography } from '@mui/material';

export function SelectStressSection() {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Component Tests
      </Typography>

      {/* Test Case 1 */}
      <Select
        name="country"
        label="Country (Required)"
        placeholder="Select a country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
          { value: 'uk', label: 'United Kingdom' },
        ]}
        rules={{ required: 'Please select a country' }}
      />

      {/* Test Case 2 */}
      <Select
        name="language"
        label="Language (Required)"
        placeholder="Select a language"
        options={[
          { value: 'en', label: 'English' },
          { value: 'es', label: 'Spanish' },
          { value: 'fr', label: 'French' },
        ]}
        rules={{ required: 'Language is required' }}
      />

      {/* Test Case 3 */}
      <Select
        name="role"
        label="Role (Required)"
        placeholder="Select a role"
        options={[
          { value: 'admin', label: 'Administrator' },
          { value: 'user', label: 'User' },
          { value: 'guest', label: 'Guest' },
        ]}
        rules={{ required: 'Role is required' }}
      />

      {/* Test Case 4 */}
      <Select
        name="timezone"
        label="Timezone"
        placeholder="Select timezone"
        helperText="This is explicit helper text (always shown)"
        options={[
          { value: 'est', label: 'Eastern Time' },
          { value: 'pst', label: 'Pacific Time' },
        ]}
        rules={{ required: 'Timezone is required' }}
      />

      {/* Test Case 5 */}
      <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
        Nested Fields (Dot Notation)
      </Typography>
      <Select
        name="address.country"
        label="Country"
        placeholder="Select country"
        options={[
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ]}
        rules={{ required: 'Country is required' }}
      />
      <Select
        name="address.state"
        label="State"
        placeholder="Select state"
        options={[
          { value: 'ny', label: 'New York' },
          { value: 'ca', label: 'California' },
        ]}
        rules={{ required: 'State is required' }}
      />
    </Box>
  );
}
```

**Integration**: Add `<SelectStressSection />` to existing `StressForm.tsx`.

### 7.4 Manual Test Checklist

When running docs app (`nx serve docs`), verify:

- [ ] No console errors on page load
- [ ] Select renders with label and placeholder
- [ ] Clicking Select opens dropdown
- [ ] Selecting option closes dropdown and displays selected value
- [ ] No error shown initially (untouched, unsubmitted)
- [ ] Blur without selecting → error shows (if required)
- [ ] Submit without selecting → error shows (if required)
- [ ] Selecting valid option → error clears immediately
- [ ] Explicit helperText always wins over auto error message
- [ ] Dot-notation fields store values in nested object
- [ ] MUI Select styling looks correct (no layout issues)
- [ ] Helper text appears below Select (not overlapping)

---

## 8. Acceptance Checklist

### 8.1 Build & Type Safety

- [ ] `nx build ui` passes without errors
- [ ] `nx build ui-core` passes without errors
- [ ] `nx build forms` passes without errors
- [ ] `nx build docs` passes without errors
- [ ] No TypeScript errors in Select.tsx
- [ ] No TypeScript errors in demo files

### 8.2 Architecture Compliance

- [ ] Select component has ZERO imports from `react-hook-form`
- [ ] Select component has ZERO imports from `@dashforge/forms`
- [ ] Select only imports from `@dashforge/ui-core` (for bridge contract)
- [ ] Select only imports from `@mui/material` (for UI components)
- [ ] No circular dependencies introduced

### 8.3 Bridge Contract

- [ ] No new bridge methods added (uses existing `DashFormBridge` API)
- [ ] Uses `bridge.register()` for value binding
- [ ] Uses `bridge.getError()` for error retrieval
- [ ] Uses `bridge.isTouched()` for touched state
- [ ] Uses `bridge.submitCount` for submit tracking

### 8.4 Error Gating Behavior

- [ ] Test Case 1: No error shown initially (untouched + unsubmitted)
- [ ] Test Case 2: Error shows after blur (touched)
- [ ] Test Case 3: Error shows after submit (submitCount > 0)
- [ ] Test Case 4: Error clears when valid option selected
- [ ] Test Case 5: Explicit error prop overrides auto error

### 8.5 Explicit Precedence

- [ ] Explicit `error` prop always wins over auto error
- [ ] Explicit `helperText` prop always wins over auto error message
- [ ] Test Case 4 passes (explicit helperText verification)

### 8.6 Dot-Notation Support

- [ ] Test Case 5: `address.country` stores value in `{ address: { country: ... } }`
- [ ] Test Case 5: `address.state` stores value in `{ address: { state: ... } }`
- [ ] Nested field errors display correctly
- [ ] Nested field touched state tracked independently

### 8.7 Docs Demo Verification

- [ ] Demo page loads without errors
- [ ] All 5 test cases are visible
- [ ] Can interact with all Select components
- [ ] Console logs show expected render behavior
- [ ] No unexpected re-renders

### 8.8 API Consistency

- [ ] Select API mirrors TextField API (name, rules, visibleWhen)
- [ ] Select supports all MUI Select props via spread
- [ ] Select JSDoc comments match TextField style
- [ ] Select file structure matches TextField (component + index)

### 8.9 Package Exports

- [ ] `Select` exported from `@dashforge/ui` package
- [ ] `SelectProps` type exported from `@dashforge/ui` package
- [ ] Can import: `import { Select } from '@dashforge/ui'`

### 8.10 Functionality Completeness

- [ ] Placeholder renders correctly
- [ ] Options render from array
- [ ] Label displays above Select
- [ ] Helper text displays below Select
- [ ] Error state applies red styling
- [ ] Standalone mode works (outside DashForm)
- [ ] Visibility toggling works (visibleWhen prop)

---

## 9. Known Limitations & Future Enhancements

### 9.1 V1 Limitations

**Out of Scope for V1**:

1. **Children-based API**: Only `options` array prop supported
2. **Complex value types**: Only string/number values (no objects)
3. **Multi-select**: Only single-select supported
4. **Custom rendering**: No renderValue or renderOption customization
5. **Grouping**: No MenuItem grouping (no OptGroup support)
6. **Search/filter**: No built-in search functionality

**Rationale**: Keep v1 simple and aligned with TextField complexity. Add features in future iterations based on user feedback.

### 9.2 Future Enhancement Ideas

**Phase 2 Candidates**:

- Multi-select support (`SelectProps.multiple`)
- Children-based API (for advanced customization)
- Option groups (via `SelectProps.optionGroups`)
- Custom option rendering (renderOption callback)
- Search/autocomplete integration (via Autocomplete component)

**Phase 3 Candidates**:

- Async option loading
- Infinite scroll for large option lists
- Keyboard navigation enhancements

---

## 10. Implementation Timeline

**Estimated Effort**: 2-4 hours

**Breakdown**:

1. Create Select.tsx component (1 hour)

   - Copy TextField.tsx as template
   - Adapt MUI components (FormControl, InputLabel, etc.)
   - Update props interface
   - Add options rendering logic

2. Update package exports (10 minutes)

   - Add to components/Select/index.ts
   - Add to ui/src/index.ts

3. Create demo page (30 minutes)

   - Add SelectStressSection.tsx
   - Integrate into form-stress page
   - Add 5 test cases

4. Testing & verification (1 hour)

   - Manual testing of all test cases
   - Build verification
   - Type checking
   - Acceptance checklist

5. Documentation (30 minutes)
   - JSDoc comments
   - Update CHANGELOG (if applicable)

---

## 11. Risk Assessment

### 11.1 Low Risk Areas

- ✅ Bridge integration (proven pattern from TextField)
- ✅ Error gating logic (copy-paste from TextField)
- ✅ Package boundaries (no new dependencies)
- ✅ Value binding (handled by bridge.register)

### 11.2 Medium Risk Areas

- ⚠️ MUI component wiring (different structure than TextField)
  - **Mitigation**: Follow MUI docs for FormControl + Select + InputLabel
- ⚠️ Label ID generation (accessibility concern)
  - **Mitigation**: Use consistent pattern `${name}-label`
- ⚠️ Type handling for generic `<T>` (TypeScript complexity)
  - **Mitigation**: Default to `string`, keep v1 simple

### 11.3 Zero Risk of Breaking Changes

- ✅ No existing Select component to break
- ✅ No bridge contract changes
- ✅ No TextField modifications
- ✅ Isolated component (no shared state)

---

## 12. Open Questions (For User Review)

### Question 1: fullWidth prop default?

- Should Select have `fullWidth` by default in FormControl?
- TextField uses MUI's default (not full width unless specified)
- **Recommendation**: Add `fullWidth` to FormControl for consistency with form layouts

**Decision needed**: User preference?

### Question 2: Demo page location?

- Extend existing `/form-stress` page?
- Create dedicated `/select-demo` page?
- **Recommendation**: Extend form-stress for quick integration

**Decision needed**: User preference?

### Question 3: Generic type support visibility?

- Should `<T>` generic be exposed in examples/docs?
- Or keep it simple with string-only examples?
- **Recommendation**: Document string examples, mention number support in JSDoc

**Decision needed**: User preference?

---

## Conclusion

This plan provides a **complete blueprint** for implementing the intelligent Select component with:

- Zero new dependencies
- Zero new bridge methods
- 100% alignment with TextField architecture
- Clear verification criteria

The implementation is **low-risk** and **straightforward** because it reuses proven patterns from TextField. The most complex part is MUI component wiring (FormControl + InputLabel + Select), which is well-documented by MUI.

**Next Step**: Review this plan, answer open questions, then proceed to implementation phase.

---

**Plan Status**: ✅ Ready for Review  
**Plan Author**: OpenCode AI  
**Plan Date**: February 23, 2026
