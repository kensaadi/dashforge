# Snackbar Close Button Hover Fix

**Date:** 2026-03-27  
**Library:** `@dashforge/theme-mui`  
**Component:** Alert (Snackbar close button)  
**Issue:** Close button hover effect showing incorrect light gray background on colored Snackbar backgrounds

---

## Problem Statement

The close button (X icon) in filled variant Snackbars was showing a light gray background color on hover (`dash.color.border.subtle = #F3F4F6`). This looked visually incorrect on colored backgrounds:

- Success (green `#15803D`)
- Error (red `#DC2626`)
- Warning (orange `#B45309`)
- Info (blue `#0EA5E9`)

The hover effect was inherited from the global `MuiIconButton` overrides, which apply to all IconButtons throughout the application.

---

## Root Cause

**File:** `libs/dashforge/theme-mui/src/overrides/MuiIconButton.ts`

```typescript
'&:hover': {
  backgroundColor: dash.color.border.subtle,  // ❌ Light gray on ALL IconButtons
}
```

This global style was being applied to the Alert close button, causing the visual inconsistency on colored backgrounds.

---

## Solution

**Approach:** Remove hover background effect specifically for IconButtons inside Alert components.

**Implementation:** Added nested selector override in `MuiAlert.ts` to set `backgroundColor: 'transparent'` on hover for IconButtons within Alerts.

**Why This Works:**

- **Scoped:** Only affects close button in Alert/Snackbar components
- **Non-breaking:** Does not affect other IconButtons in the application (dialogs, toolbars, etc.)
- **Simple:** Single CSS override, no complex logic or theme-aware branching
- **Clean:** No background color change on hover, maintaining visual consistency

---

## Changes Made

### File: `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts`

**Location:** `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts:27-36`

**Before:**

```typescript
styleOverrides: {
  root: {
    borderRadius: dash.radius.md,
    backgroundImage: 'none',
  },
```

**After:**

```typescript
styleOverrides: {
  root: {
    borderRadius: dash.radius.md,
    backgroundImage: 'none',
    // Remove hover background effect from close button (IconButton inside Alert)
    '& .MuiIconButton-root': {
      '&:hover': {
        backgroundColor: 'transparent',
      },
    },
  },
```

---

## Technical Details

### CSS Selector Hierarchy

The fix uses CSS specificity to override the global IconButton hover:

```
.MuiAlert-root .MuiIconButton-root:hover {
  backgroundColor: 'transparent';  /* Higher specificity wins */
}
```

This overrides:

```
.MuiIconButton-root:hover {
  backgroundColor: dash.color.border.subtle;  /* Global default */
}
```

### Affected Components

**Directly affected:**

- `SnackbarItem.tsx` - Uses `<Alert variant="filled">` with close button
- All Alert components with `onClose` prop (renders IconButton internally)

**Not affected:**

- Other IconButtons in the application (dialogs, toolbars, app bars, etc.)
- Alert icon (only the close button is affected)

---

## Verification

### Typecheck Status

**Command:** `npx nx run @dashforge/theme-mui:typecheck`

**Result:** Pre-existing type errors unrelated to this change:

- `createMuiTheme.ts:120` - Type mismatch in component merging (pre-existing)
- `theme-mui.spec.tsx:3` - Build output issue (pre-existing)

**Assessment:** The new code is syntactically correct and does not introduce new type errors.

---

## Testing Recommendations

### Visual Testing Required

Test the close button hover effect on all Snackbar variants:

**Test Cases:**

1. **Success Snackbar** (green background `#15803D`)
   - Hover over close button → should remain transparent
2. **Error Snackbar** (red background `#DC2626`)
   - Hover over close button → should remain transparent
3. **Warning Snackbar** (orange background `#B45309`)
   - Hover over close button → should remain transparent
4. **Info Snackbar** (blue background `#0EA5E9`)
   - Hover over close button → should remain transparent

**Test Location:**

- `web/src/pages/Docs/components/snackbar/demos/SnackbarVariantsDemo.tsx`

### Browser Testing

- Chrome/Edge (Chromium)
- Firefox
- Safari

### Theme Testing

- Light mode
- Dark mode (if applicable)

---

## Impact Assessment

### Changed Behavior

- **Before:** Close button showed light gray background on hover
- **After:** Close button remains transparent on hover (no background change)

### Unchanged Behavior

- Close button icon color (remains inverse text color)
- Close button click functionality
- Other IconButton hover effects throughout the application
- Alert layout, spacing, and overall styling

### Risk Level: **Low**

- Isolated change to Alert component only
- No API changes
- No breaking changes to other components
- Simple CSS override with high specificity

---

## Related Work

This fix completes the Snackbar theme improvement work:

1. **Snackbar Theme Fix** (`.opencode/reports/snackbar-theme-fix-build.md`)
   - Added `info` color support to theme
   - Fixed filled variant backgrounds for all semantic colors
2. **Snackbar Theme Refinement** (`.opencode/reports/snackbar-theme-fix-refinement.md`)

   - Replaced hardcoded `#FFFFFF` with `dash.color.text.inverse`
   - Added fallback for `info → primary`

3. **Close Button Hover Fix** (this report)
   - Removed incorrect hover background on close button

---

## Conclusion

The close button hover effect has been successfully removed for Alert components (including Snackbars) by adding a scoped CSS override in `MuiAlert.ts`. The fix is:

- ✅ Scoped to Alert components only
- ✅ Non-breaking for other IconButtons
- ✅ Syntactically correct (no new type errors)
- ✅ Simple and maintainable

**Status:** Implementation complete. Ready for visual testing.

**Next Steps:**

1. Test hover effect on all Snackbar variants (success, error, warning, info)
2. Verify other IconButtons in app still have appropriate hover effects (if needed)
3. Test in both light and dark modes
4. Deploy to staging for QA review

---

**Modified Files:**

- `libs/dashforge/theme-mui/src/overrides/MuiAlert.ts` (+6 lines)

**Lines Changed:** 6 additions (lines 30-35)

**Complexity:** Low  
**Confidence:** High
