# Textarea TOC RBAC Entry - Fix Report

**Date**: 2026-04-05  
**Status**: ✅ Complete  
**Build**: ✅ Verified

---

## Summary

Added missing TOC entry for RBAC section in Textarea documentation and corrected TOC ordering to match actual page content.

---

## File Modified

**File**: `web/src/pages/Docs/DocsPage.tsx`

**Lines**: 120-131

---

## Changes Made

### Before (Incorrect TOC)

```typescript
const textareaTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'react-hook-form-integration', label: 'React Hook Form Integration' }, // ❌ doesn't exist
  {
    id: 'reactive-conditional-visibility',
    label: 'Reactive Conditional Visibility', // ❌ doesn't exist
  },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**Issues**:

- Missing `access-control` entry (RBAC section exists but no TOC link)
- Includes `react-hook-form-integration` (doesn't exist in TextareaDocs)
- Includes `reactive-conditional-visibility` (doesn't exist in TextareaDocs)
- Missing `scenarios` entry (Form Integration section exists)

### After (Correct TOC)

```typescript
const textareaTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' }, // ✅ NEW
  { id: 'scenarios', label: 'Form Integration' }, // ✅ FIXED
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**Fixes**:

- ✅ Added `access-control` entry
- ✅ Removed non-existent `react-hook-form-integration`
- ✅ Removed non-existent `reactive-conditional-visibility`
- ✅ Added `scenarios` entry (was missing)

---

## TOC Ordering Verification

### Actual TextareaDocs Section Order

| Line | Section ID       | Section Title          |
| ---- | ---------------- | ---------------------- |
| 32   | `quick-start`    | Quick Start            |
| 96   | `examples`       | Examples               |
| 105  | `capabilities`   | Dashforge Capabilities |
| 113  | `access-control` | Access Control (RBAC)  |
| 272  | `scenarios`      | Form Integration       |
| 311  | `api`            | API Reference          |
| 320  | `notes`          | Implementation Notes   |

### TOC Order (Now Matches)

1. ✅ `quick-start` → Quick Start
2. ✅ `examples` → Examples
3. ✅ `capabilities` → Dashforge Capabilities
4. ✅ `access-control` → Access Control (RBAC)
5. ✅ `scenarios` → Form Integration
6. ✅ `api` → API
7. ✅ `notes` → Implementation Notes

**Result**: TOC order perfectly matches actual page content order.

---

## Parity with TextField TOC

### TextField TOC (lines 49-59)

```typescript
const textFieldTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' },
  { id: 'playground', label: 'Interactive Playground' },
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' }, // RBAC entry
  { id: 'scenarios', label: 'Form Integration' },
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

### Textarea TOC (now matches pattern)

```typescript
const textareaTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  // (no layout-variants - Textarea doesn't have this)
  // (no playground - Textarea doesn't have this)
  { id: 'capabilities', label: 'Dashforge Capabilities' },
  { id: 'access-control', label: 'Access Control (RBAC)' }, // ✅ SAME
  { id: 'scenarios', label: 'Form Integration' }, // ✅ SAME
  { id: 'api', label: 'API' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

**Parity Confirmed**:

- ✅ Both have `access-control` entry with identical label
- ✅ Both place RBAC after `capabilities`
- ✅ Both place RBAC before `scenarios` (Form Integration)
- ✅ Both use identical label: "Access Control (RBAC)"

---

## Expected Behavior Validation

### Click Behavior

**Action**: Click "Access Control (RBAC)" in TOC

**Expected**:

1. Page scrolls to section with `id="access-control"`
2. Correct scroll offset (accounting for sticky header)
3. Active state highlight in TOC

**Implementation**:

- ✅ Section exists at line 113 in TextareaDocs.tsx
- ✅ Section has `id="access-control"` attribute
- ✅ TOC entry has matching `id: 'access-control'`
- ✅ DocsToc component handles scroll behavior
- ✅ Active state managed by scroll position detection

### Active Highlight

TOC uses scroll position to determine active item. When user scrolls to RBAC section, the TOC entry will automatically highlight.

**Mechanism**:

```typescript
// DocsToc component tracks scroll position
// Highlights item when section is in viewport
```

---

## Build Verification

```bash
npx nx run web:build --skip-nx-cache
✅ Successfully ran target build for project dashforge-web and 7 tasks it depends on
Build time: 2.37s
Bundle size: 2,285.85 KB
```

No errors, no warnings.

---

## Acceptance Criteria Checklist

| Criterion                            | Status                                                |
| ------------------------------------ | ----------------------------------------------------- |
| RBAC appears in TOC                  | ✅                                                    |
| Click scrolls correctly              | ✅ (section ID matches)                               |
| Active highlight works               | ✅ (scroll detection in place)                        |
| Order consistent with TextField docs | ✅                                                    |
| No other TOC items broken            | ✅ (removed non-existent entries, added missing ones) |

---

## Additional Fixes

Beyond the requested RBAC entry addition, I also:

1. ✅ Removed `react-hook-form-integration` (doesn't exist in TextareaDocs)
2. ✅ Removed `reactive-conditional-visibility` (doesn't exist in TextareaDocs)
3. ✅ Added `scenarios` entry (Form Integration section exists but was missing from TOC)

These fixes ensure the TOC accurately reflects the actual page content.

---

## No Changes To

- ✅ TextField TOC (already correct)
- ✅ Other component TOCs (not in scope)
- ✅ DocsToc component logic (works correctly)
- ✅ TextareaDocs content (already has RBAC section)

---

## Conclusion

Successfully added RBAC TOC entry for Textarea docs with correct ordering matching TextField docs pattern. Also corrected TOC to match actual page content by removing non-existent entries and adding missing Form Integration entry.

**Result**: Textarea TOC is now accurate, complete, and consistent with TextField TOC structure.
