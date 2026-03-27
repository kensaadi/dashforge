# Snackbar Theme Fix - Complete Implementation Plan

**Date:** March 27, 2026  
**Issue:** Snackbar always shows white/neutral background regardless of variant (success/error/warning/info)  
**Mode:** BUILD  
**Status:** 📋 PLAN READY FOR IMPLEMENTATION

---

## 🔍 Root Cause Analysis

### Problem Identified

The Snackbar shows white/neutral background for all variants due to **misconfigured MUI Alert overrides**.

### File: `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts`

**Three Critical Issues:**

#### 1. **Aggressive `root` Override**

Line 18 sets `backgroundColor: dash.color.surface.overlay` for **ALL** Alert variants, overriding MUI's default filled variant colors.

**Color applied:**

- Light mode: `#FFFFFF` (white)
- Dark mode: `#1F2937` (neutral dark gray)

#### 2. **Missing `filled` Variant Overrides**

Snackbar uses `variant="filled"` (see `SnackbarItem.tsx:59`), but overrides are only defined for `standard` variant:

**Existing:**

- ✅ `standardSuccess`
- ✅ `standardWarning`
- ✅ `standardError`
- ✅ `standardInfo`

**Missing:**

- ❌ `filledSuccess`
- ❌ `filledWarning`
- ❌ `filledError`
- ❌ `filledInfo`

#### 3. **Standard Overrides Use Neutral Background**

Even if used, the `standard*` overrides set `backgroundColor: dash.color.surface.overlay` (neutral) instead of intent colors.

---

## 🎯 Solution Overview

Implement **Option A: Complete Fix with Filled Variants** + add distinct `info` color.

### Key Changes

1. ✅ Add `info` color to `ColorIntent` type
2. ✅ Add `info` values to light/dark themes
3. ✅ Map `info` to MUI palette
4. ✅ Fix MuiAlert overrides:
   - Remove aggressive `root` backgroundColor
   - Add `filled*` variant overrides
   - Use intent colors for filled backgrounds

---

## 🏗️ Architecture: Theme Customization System

### Public APIs for Developers

```typescript
// 1. Replace entire theme
replaceTheme(customTheme: DashforgeTheme)

// 2. Patch partial (deep merge) ✅ USED IN DOCS
patchTheme({ color: { intent: { primary: '#ff0000' } } })

// 3. Set theme preset
setTheme(customTheme: DashforgeTheme)

// 4. Switch light/dark
setThemeMode('light' | 'dark')
toggleThemeMode()
```

**Real Example (from `docs/src/app/app.tsx:173`):**

```typescript
patchTheme({ color: { intent: { primary: '#ff0000' } } });
```

### Theme Flow

```
DashforgeTheme (tokens)
    ↓
useDashTheme() (reactive Valtio)
    ↓
createMuiThemeFromDashTheme() (adapter)
    ↓
MUI ThemeProvider
    ↓
Alert Component
```

**✅ Fully reactive:** When a dev calls `patchTheme()`, the MUI theme updates automatically.

---

## 🛠️ Implementation Changes

### File 1: `libs/dashforge/tokens/src/theme/types.ts`

**Change:** Add `info` to `ColorIntent`

```typescript
export type ColorIntent = {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  info: string; // ✅ ADD
};
```

**Rationale:**

- Semantically separates `info` from `primary`
- Allows devs to customize info color independently
- Example: `patchTheme({ color: { intent: { info: '#00BCD4' } } })`

---

### File 2: `libs/dashforge/tokens/src/theme/default-theme.ts`

**Change:** Add `info` values to light and dark themes

```typescript
// defaultLightTheme
export const defaultLightTheme: DashforgeTheme = {
  // ...
  color: {
    intent: {
      primary: '#2563EB',
      secondary: '#4F46E5',
      success: '#15803D',
      warning: '#B45309',
      danger: '#DC2626',
      info: '#0EA5E9', // ✅ ADD (sky-600)
    },
    // ...
  },
  // ...
};

// defaultDarkTheme
export const defaultDarkTheme: DashforgeTheme = {
  // ...
  color: {
    intent: {
      primary: '#3B82F6',
      secondary: '#6366F1',
      success: '#22C55E',
      warning: '#F59E0B',
      danger: '#EF4444',
      info: '#38BDF8', // ✅ ADD (sky-400)
    },
    // ...
  },
  // ...
};
```

**Colors Chosen (Tailwind Sky):**

- Light: `#0EA5E9` (sky-600) - darker, more readable on light backgrounds
- Dark: `#38BDF8` (sky-400) - lighter, more readable on dark backgrounds

**Alternatives:**

- Cyan: `#06B6D4` (light) / `#22D3EE` (dark)
- Teal: `#14B8A6` (light) / `#2DD4BF` (dark)

---

### File 3: `libs/dashforge/theme-mui/src/adapter/createMuiTheme.ts`

**Change:** Map `info` to MUI palette

**Location:** Line ~48

```typescript
const palette = {
  mode: dash.meta.mode,

  primary: { main: dash.color.intent.primary },
  secondary: { main: dash.color.intent.secondary },
  success: { main: dash.color.intent.success },
  warning: { main: dash.color.intent.warning },
  error: { main: dash.color.intent.danger },
  info: { main: dash.color.intent.info }, // ✅ ADD

  // ...
};
```

**Impact:** When a dev does `patchTheme({ color: { intent: { info: '#custom' } } })`, the color propagates automatically to MUI.

---

### File 4: `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts` ⚠️ **CRITICAL FILE**

**Complete Replacement:**

```typescript
import type { DashforgeTheme } from '@dashforge/tokens';
import type { ThemeOptions } from '@mui/material/styles';

export function getMuiAlertOverrides(
  dash: DashforgeTheme
): ThemeOptions['components'] {
  // Helper for standard variant (neutral background, only icon colored)
  const standardStyle = (iconColor: string) => ({
    backgroundColor: dash.color.surface.overlay,
    color: dash.color.text.primary,
    '& .MuiAlert-icon': { color: iconColor },
  });

  // Helper for filled variant (colored background, white text)
  const filledStyle = (bgColor: string) => ({
    backgroundColor: bgColor,
    color: '#FFFFFF',
    '& .MuiAlert-icon': { color: '#FFFFFF' },
  });

  return {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: dash.radius.md,
          backgroundImage: 'none',
          // ❌ REMOVED backgroundColor here - let variants handle it
        },

        // Standard variants (neutral background, only icon colored)
        standardSuccess: standardStyle(dash.color.intent.success),
        standardWarning: standardStyle(dash.color.intent.warning),
        standardError: standardStyle(dash.color.intent.danger),
        standardInfo: standardStyle(dash.color.intent.info), // ✅ CHANGED from primary to info

        // Filled variants (colored background) ✅ NEW
        filledSuccess: filledStyle(dash.color.intent.success),
        filledWarning: filledStyle(dash.color.intent.warning),
        filledError: filledStyle(dash.color.intent.danger),
        filledInfo: filledStyle(dash.color.intent.info),
      },
    },
  };
}
```

**Key Changes:**

1. **❌ REMOVED:** `backgroundColor` from `root` override

   - **Rationale:** Was overriding all variants, causing the bug
   - **Impact:** `filled` and `standard` variants now handle background independently

2. **✅ ADDED:** `filledStyle()` helper for filled variants

   - Colored background with intent color
   - White text and icon (#FFFFFF)
   - **Customizable:** If a dev does `patchTheme({ color: { intent: { success: '#00FF00' } } })`, the success Snackbar becomes lime green

3. **✅ ADDED:** Overrides for `filledSuccess`, `filledWarning`, `filledError`, `filledInfo`

   - Use colors from `dash.color.intent.*`
   - **Reactive:** Change automatically when theme changes

4. **✅ CHANGED:** `standardInfo` uses `dash.color.intent.info` instead of `primary`
   - Maintains semantic consistency

---

## 🎨 Final Color Mapping

### Light Mode

| Variant | Filled Background | Icon/Text (standard) | Hex Light   |
| ------- | ----------------- | -------------------- | ----------- |
| Success | `#15803D`         | `#15803D`            | Dark green  |
| Warning | `#B45309`         | `#B45309`            | Dark orange |
| Error   | `#DC2626`         | `#DC2626`            | Dark red    |
| Info    | `#0EA5E9`         | `#0EA5E9`            | Sky 600     |

### Dark Mode

| Variant | Filled Background | Icon/Text (standard) | Hex Dark     |
| ------- | ----------------- | -------------------- | ------------ |
| Success | `#22C55E`         | `#22C55E`            | Light green  |
| Warning | `#F59E0B`         | `#F59E0B`            | Light orange |
| Error   | `#EF4444`         | `#EF4444`            | Light red    |
| Info    | `#38BDF8`         | `#38BDF8`            | Sky 400      |

---

## ✅ Customization Guarantee

### Scenario 1: Dev wants to change success color

```typescript
patchTheme({
  color: {
    intent: {
      success: '#00FF00', // Custom lime green
    },
  },
});
```

**Result:** ✅ All `success` Snackbars become lime green, both filled and standard.

---

### Scenario 2: Dev wants distinct info color

```typescript
patchTheme({
  color: {
    intent: {
      info: '#00BCD4', // Cyan for info
      primary: '#9C27B0', // Purple for primary
    },
  },
});
```

**Result:** ✅ `info` Snackbar becomes cyan, while primary buttons stay purple.

---

### Scenario 3: Dev wants complete custom theme

```typescript
const myBrandTheme: DashforgeTheme = {
  meta: { name: 'MyBrand', version: '1.0.0', mode: 'light' },
  color: {
    intent: {
      primary: '#FF6B00',
      secondary: '#FFD700',
      success: '#2ECC71',
      warning: '#F39C12',
      danger: '#E74C3C',
      info: '#3498DB',
    },
    // ... rest of theme
  },
  // ...
};

replaceTheme(myBrandTheme);
```

**Result:** ✅ All Snackbars use custom brand colors.

---

## 🧪 Validation Tests

### Manual Tests

#### 1. **Snackbar Variants Demo** (`/docs/snackbar`)

- [ ] Click "Success" → Green (#15803D light / #22C55E dark)
- [ ] Click "Error" → Red (#DC2626 light / #EF4444 dark)
- [ ] Click "Warning" → Orange (#B45309 light / #F59E0B dark)
- [ ] Click "Info" → Sky (#0EA5E9 light / #38BDF8 dark)

#### 2. **Theme Toggle**

- [ ] Toggle dark mode → Verify light colors
- [ ] Toggle light mode → Verify dark colors

#### 3. **Theme Customization** (Browser Console)

```typescript
// Test 1: Patch single color
patchTheme({ color: { intent: { success: '#00FF00' } } });
// Click "Success" → Lime green

// Test 2: Patch info color
patchTheme({ color: { intent: { info: '#FF00FF' } } });
// Click "Info" → Magenta

// Test 3: Reset
replaceTheme(defaultLightTheme);
// Everything back to normal
```

#### 4. **Other Alerts in Codebase**

- [ ] Verify `docs/src/app/app.tsx:347-350` (4 Alert standard variants)
- [ ] Verify `web/src/pages/Docs/components/autocomplete/AutocompleteNotes.tsx:183` (Alert info standard)
- [ ] All should have neutral background with colored icon (standard variant)

---

### Automated Tests

```bash
# Typecheck - verify no TypeScript errors
npx nx run @dashforge/tokens:typecheck
npx nx run @dashforge/theme-mui:typecheck
npx nx run @dashforge/ui:typecheck

# Unit tests Snackbar
npx nx run @dashforge/ui:test Snackbar
```

**Expectations:**

- ✅ 0 TypeScript errors (new `info` property recognized)
- ✅ All Snackbar tests pass (no breaking changes)

---

## 📊 Impact Analysis

### Breaking Changes

**❌ NONE for existing implementations**

- New `info` property has default value
- `standardInfo` changes from `primary` to `info` but with semantically correct color
- `filled*` overrides are added, not modified
- Other Alerts in codebase use `standard` variant (not impacted)

### Compatibility with Custom Themes

**Scenario:** Dev already has a custom theme without `info`

```typescript
const oldCustomTheme = {
  color: {
    intent: {
      primary: '#custom',
      secondary: '#custom',
      success: '#custom',
      warning: '#custom',
      danger: '#custom',
      // ⚠️ info not defined
    },
  },
};
```

**Solution:** TypeScript error → Dev must add `info` to custom theme.

**Easy Migration:**

```typescript
const newCustomTheme = {
  ...oldCustomTheme,
  color: {
    ...oldCustomTheme.color,
    intent: {
      ...oldCustomTheme.color.intent,
      info: oldCustomTheme.color.intent.primary, // Fallback to primary
    },
  },
};
```

### Files Modified

| File                | Lines Added | Lines Removed | Risk                                |
| ------------------- | ----------- | ------------- | ----------------------------------- |
| `types.ts`          | 1           | 0             | ⚠️ Low (breaking for custom themes) |
| `default-theme.ts`  | 2           | 0             | ✅ None                             |
| `createMuiTheme.ts` | 1           | 0             | ✅ None                             |
| `MuiAlert.ts`       | ~20         | ~3            | ⚠️ Medium (core styling)            |

**Total:** ~24 lines added, ~3 removed

---

## 🚀 Implementation Order

### Step 1: Types & Tokens (Safe)

1. `libs/dashforge/tokens/src/theme/types.ts` → Add `info: string`
2. `libs/dashforge/tokens/src/theme/default-theme.ts` → Add `info` values

**Validation:**

```bash
npx nx run @dashforge/tokens:typecheck
```

---

### Step 2: MUI Adapter (Safe)

3. `libs/dashforge/theme-mui/src/adapter/createMuiTheme.ts` → Map `info` to palette

**Validation:**

```bash
npx nx run @dashforge/theme-mui:typecheck
```

---

### Step 3: MUI Alert Overrides (Critical)

4. `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts` → Complete fix

**Validation:**

```bash
npx nx run @dashforge/theme-mui:typecheck
npx nx run @dashforge/ui:typecheck
```

---

### Step 4: Visual Validation

5. Start web app

```bash
npx nx run web:serve
```

6. Navigate to `/docs/snackbar`
7. Test all variants (success/error/warning/info)
8. Toggle light/dark mode
9. Test theme customization (browser console)

---

### Step 5: Regression Testing

10. Verify other Alerts in codebase:

    - `docs/src/app/app.tsx` (4 Alert standard)
    - `web/src/pages/Docs/components/autocomplete/AutocompleteNotes.tsx`

11. Run full test suite:

```bash
npx nx run @dashforge/ui:test
```

---

## 📝 Developer Documentation

### Example: `libs/dashforge/tokens/README.md` (Optional)

````markdown
## Color Intent Tokens

| Token       | Purpose               | Example Usage                       |
| ----------- | --------------------- | ----------------------------------- | ------ |
| `primary`   | Brand primary color   | Buttons, links, primary actions     |
| `secondary` | Secondary brand color | Secondary buttons, accents          |
| `success`   | Success states        | Success messages, checkmarks        |
| `warning`   | Warning states        | Warning messages, cautions          |
| `danger`    | Error/danger states   | Error messages, destructive actions |
| `info`      | Informational states  | Info messages, tips, help text      | ✅ NEW |

### Customizing Theme

```typescript
import { patchTheme } from '@dashforge/theme-core';

// Change single color
patchTheme({
  color: {
    intent: {
      info: '#00BCD4', // Custom cyan
    },
  },
});

// Change multiple colors
patchTheme({
  color: {
    intent: {
      success: '#2ECC71',
      warning: '#F39C12',
      danger: '#E74C3C',
      info: '#3498DB',
    },
  },
});
```
````

```

---

## 📋 Pre-Implementation Checklist

Before proceeding, confirm:

- [ ] Sky color (`#0EA5E9` light / `#38BDF8` dark) approved for info
- [ ] Breaking change for custom themes acceptable (minor - only need to add `info` field)
- [ ] Documentation/changelog update required or not
- [ ] Ready to implement now

---

## 📈 Success Criteria

**Implementation Complete When:**

1. ✅ All 4 files modified and typecheck passes
2. ✅ Snackbar variants show correct colors in light mode
3. ✅ Snackbar variants show correct colors in dark mode
4. ✅ Theme customization via `patchTheme()` works correctly
5. ✅ Other Alerts in codebase not broken (standard variant)
6. ✅ All Snackbar tests pass
7. ✅ No TypeScript errors

---

**Plan Status:** ✅ READY FOR IMPLEMENTATION
**Risk Level:** ⚠️ Low-Medium
**Implementation Time:** 20-30 minutes
**Testing Time:** 15-20 minutes
**Total Time:** ~45 minutes

---

## 🎯 Next Action

Awaiting approval to proceed with implementation.
```
