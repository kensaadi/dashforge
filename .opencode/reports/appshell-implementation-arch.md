# AppShell Documentation Implementation - Architecture Analysis

**Date**: 2026-03-28  
**Status**: NOT IMPLEMENTED  
**Analysis Type**: Pre-Implementation Verification

---

## Executive Summary

This report analyzes the **current state** of the Dashforge documentation codebase against the requirements for adding AppShell documentation under the "Application" sidebar group.

**CRITICAL FINDING**: ❌ **AppShell documentation has NOT been implemented yet**

---

## 1. Sidebar Structure Analysis

### File: `web/src/pages/Docs/components/DocsSidebar.model.ts`

**Current State**: ✅ BASELINE CORRECT (No Application group exists)

**Current Groups** (lines 34-124):

1. Getting Started
2. Core Concepts (empty)
3. UI Components
   - Input (4 items)
   - **Layout** (empty) ⚠️
   - Utilities (2 items)
4. Form System (empty)
5. **Theme System** (1 item: Design Tokens)
6. **Architecture** (empty)

**Current Order**:

```
Theme System     (line 112-119)
Architecture     (line 120-123)
[END OF FILE]
```

### Verification Results

✅ **PASS**: No "Application" group exists (as expected - not yet implemented)  
✅ **PASS**: No "AppShell" entry anywhere in sidebar  
✅ **PASS**: "Layout" subgroup exists but is empty (line 89-90)  
✅ **PASS**: Theme System appears before Architecture

### Required Change

**WHERE TO INSERT**: Between "Theme System" (ends line 119) and "Architecture" (starts line 120)

**EXACT INSERTION POINT**: After line 119, before line 120

**Code to Insert**:

```typescript
  {
    title: 'Application',
    items: [
      {
        label: 'AppShell',
        path: '/docs/application/appshell',
      },
    ],
  },
```

**Post-Implementation Expected Order**:

1. Getting Started
2. Core Concepts
3. UI Components
4. Form System
5. **Theme System**
6. **Application** ← NEW
7. **Architecture**

---

## 2. Routing Analysis

### File: `web/src/pages/Docs/DocsPage.tsx`

**Current State**: ❌ NO APPSHELL ROUTING

### Verification Results

❌ **MISSING**: No import for `AppShellDocs`  
❌ **MISSING**: No `appShellTocItems` array defined  
❌ **MISSING**: No `isAppShellDocs` path detection  
❌ **MISSING**: No AppShell entry in TOC ternary chain  
❌ **MISSING**: No AppShell entry in content ternary chain

### Current Import Pattern (lines 16-27)

**Existing Component Imports**:

```typescript
import { TextFieldDocs } from './components/text-field/TextFieldDocs';
import { NumberFieldDocs } from './components/number-field/NumberFieldDocs';
import { SelectDocs } from './components/select/SelectDocs';
import { AutocompleteDocs } from './components/autocomplete/AutocompleteDocs';
import { ConfirmDialogDocs } from './components/confirm-dialog/ConfirmDialogDocs';
import { SnackbarDocs } from './components/snackbar/SnackbarDocs';
// ... other imports
```

**Required Addition** (after line 27):

```typescript
import { AppShellDocs } from './components/appshell/AppShellDocs';
```

### Current TOC Pattern (lines 29-148)

**Pattern**:

```typescript
const [component]TocItems: DocsTocItem[] = [
  { id: 'section-id', label: 'Section Label' },
  // ...
];
```

**Required Addition** (after line 148, after `designTokensTocItems`):

```typescript
const appShellTocItems: DocsTocItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API Reference' },
];
```

### Current Path Detection Pattern (lines 156-175)

**Pattern**:

```typescript
const is[Component]Docs = location.pathname === '/docs/[path]';
```

**Required Addition** (after line 175):

```typescript
const isAppShellDocs = location.pathname.startsWith(
  '/docs/application/appshell'
);
```

⚠️ **CRITICAL**: Must use `.startsWith()` NOT `===`

### Current TOC Selection Logic (lines 177-199)

**Pattern**: Large ternary chain

**Required Change**: Insert BEFORE `isOverview` check:

```typescript
: isAppShellDocs
? appShellTocItems
```

### Current Content Rendering Logic (lines 201-225)

**Pattern**: Large ternary chain matching TOC chain

**Required Change**: Insert BEFORE `isOverview` check:

```typescript
) : isAppShellDocs ? (
  <AppShellDocs />
```

---

## 3. File Structure Analysis

### Directory: `web/src/pages/Docs/components/appshell/`

**Current State**: ❌ **DIRECTORY DOES NOT EXIST**

### Required Files (5 total)

**MUST CREATE**:

1. ✅ `AppShellDocs.tsx` (~200 lines)
2. ✅ `AppShellQuickStart.tsx` (~80 lines)
3. ✅ `AppShellExamples.tsx` (~100 lines)
4. ✅ `AppShellApi.tsx` (~120 lines)
5. ✅ `AppShellDemo.tsx` (~100 lines)

**MUST NOT CREATE**:

- ❌ `AppShellComposition.tsx`
- ❌ `AppShellScenarios.tsx`
- ❌ `AppShellNotes.tsx`
- ❌ `AppShellLayoutVariants.tsx`
- ❌ `demos/` subdirectory
- ❌ `mockNavItems.ts`

### Expected Directory Structure

```
web/src/pages/Docs/components/
├── appshell/                    ← NEW DIRECTORY
│   ├── AppShellDocs.tsx        ← NEW FILE
│   ├── AppShellQuickStart.tsx  ← NEW FILE
│   ├── AppShellExamples.tsx    ← NEW FILE
│   ├── AppShellApi.tsx         ← NEW FILE
│   └── AppShellDemo.tsx        ← NEW FILE
├── autocomplete/
├── confirm-dialog/
├── number-field/
├── select/
├── snackbar/
└── text-field/
```

---

## 4. Component Pattern Analysis

### Reference: Existing Component Docs

**Analyzed Components**:

- ✅ SnackbarDocs.tsx (225 lines)
- ✅ ConfirmDialogDocs.tsx (302 lines)

**Common Pattern**:

```tsx
export function [Component]Docs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Stack spacing={3} id="[first-section-id]">
        <Typography variant="h1">Title</Typography>
        <Typography variant="body1">Description</Typography>
        <Box>Category Badge</Box>
      </Stack>

      {/* Section 2 */}
      <Stack spacing={4} id="[section-2-id]">
        <Typography variant="h2">Section Title</Typography>
        <[Component]Section />
      </Stack>

      {/* ... more sections */}
    </Stack>
  );
}
```

### Required AppShellDocs.tsx Structure

**MUST HAVE** (4 sections only):

```tsx
export function AppShellDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* 1. Hero / Overview */}
      <Stack spacing={3} id="overview">
        <Typography variant="h1">AppShell</Typography>
        <Typography variant="body1">
          Application-level shell for authenticated experiences...
        </Typography>
        <Box>Badge: "Application Pattern"</Box>
      </Stack>

      {/* 2. Quick Start */}
      <Stack spacing={4} id="quick-start">
        <Typography variant="h2">Quick Start</Typography>
        <AppShellQuickStart />
      </Stack>

      {/* 3. Examples */}
      <Stack spacing={4} id="examples">
        <Typography variant="h2">Examples</Typography>
        <AppShellExamples />
      </Stack>

      {/* 4. API */}
      <Stack spacing={4} id="api">
        <Typography variant="h2">API Reference</Typography>
        <AppShellApi />
      </Stack>
    </Stack>
  );
}
```

**MUST NOT HAVE**:

- ❌ `id="composition"`
- ❌ `id="scenarios"`
- ❌ `id="notes"`
- ❌ `id="playground"`
- ❌ More than 4 sections

---

## 5. Demo Component Analysis

### Reference: Existing Demo Patterns

**Analyzed**:

- ✅ `SnackbarBasicDemo.tsx`
- ✅ `ConfirmDialogExamples.tsx`

**Common Pattern**:

- Import component from `@dashforge/ui`
- Create simple, focused demo
- Keep interactive elements minimal
- Inline any mock data (no external files)

### Required AppShellDemo.tsx Structure

**MUST HAVE**:

```tsx
import { useState } from 'react';
import { AppShell } from '@dashforge/ui';
import type { LeftNavItem } from '@dashforge/ui';
// ... MUI imports

export function AppShellDemo() {
  const [navOpen, setNavOpen] = useState(true);

  // Mock data INLINE
  const navItems: LeftNavItem[] = [
    { id: '1', type: 'item', label: 'Dashboard', key: 'dashboard' },
    { id: '2', type: 'item', label: 'Users', key: 'users' },
    // ... 3-5 items max
  ];

  return (
    <Box sx={{ height: 600, border: '1px solid divider' }}>
      <AppShell
        items={navItems}
        renderLink={(item, children) => <div>{children}</div>}
        isActive={(item) => item.key === 'dashboard'}
        navOpen={navOpen}
        onNavOpenChange={setNavOpen}
        topBarLeft={<Typography>Logo</Typography>}
        topBarRight={
          <Button onClick={() => setNavOpen(!navOpen)}>Toggle</Button>
        }
      >
        <Box sx={{ p: 3 }}>Content area with simple description</Box>
      </AppShell>
    </Box>
  );
}
```

**MUST NOT HAVE**:

- ❌ Multiple demo files (BasicDemo, ResponsiveDemo, etc.)
- ❌ Fancy animations or complex interactions
- ❌ External mock data files
- ❌ Over-engineered state management

---

## 6. TOC (Table of Contents) Analysis

### Current TOC Pattern

**Mechanism**:

- TOC items defined as array in `DocsPage.tsx`
- Section IDs in component match TOC item IDs
- `DocsToc.tsx` uses IntersectionObserver for scroll tracking

**Example** (SnackbarDocs):

```typescript
// In DocsPage.tsx
const snackbarTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'scenarios', label: 'Integration Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Implementation Notes' },
];

// In SnackbarDocs.tsx
<Stack spacing={4} id="quick-start">...</Stack>
<Stack spacing={4} id="examples">...</Stack>
<Stack spacing={4} id="scenarios">...</Stack>
<Stack spacing={4} id="api">...</Stack>
<Stack spacing={4} id="notes">...</Stack>
```

### Required AppShell TOC

**Definition** (in DocsPage.tsx):

```typescript
const appShellTocItems: DocsTocItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API Reference' },
];
```

**Matching IDs** (in AppShellDocs.tsx):

```tsx
<Stack spacing={3} id="overview">...</Stack>
<Stack spacing={4} id="quick-start">...</Stack>
<Stack spacing={4} id="examples">...</Stack>
<Stack spacing={4} id="api">...</Stack>
```

**Verification**:

- ✅ 4 TOC items only
- ✅ IDs match: `overview`, `quick-start`, `examples`, `api`
- ✅ No extra TOC items for non-existent sections

---

## 7. Styling & Theming Analysis

### Hero Section Gradient Pattern

**Existing Patterns**:

- **SnackbarDocs**: Orange/amber gradient (Imperative Pattern)
- **ConfirmDialogDocs**: Purple gradient (Imperative Pattern)
- **DesignTokensDocs**: Not analyzed yet

**Required for AppShell**: Blue gradient (Application Pattern)

**Code**:

```tsx
<Typography
  variant="h1"
  sx={{
    fontSize: { xs: 40, md: 56 },
    fontWeight: 800,
    letterSpacing: '-0.04em',
    lineHeight: 1.1,
    color: isDark ? '#ffffff' : '#0f172a',
    background: isDark
      ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
      : 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  }}
>
  AppShell
</Typography>
```

### Badge Pattern

**Required Badge**:

```tsx
<Box
  sx={{
    display: 'inline-flex',
    alignSelf: 'flex-start',
    px: 2,
    py: 0.75,
    borderRadius: 1.5,
    bgcolor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)',
    border: isDark
      ? '1px solid rgba(59,130,246,0.30)'
      : '1px solid rgba(59,130,246,0.25)',
  }}
>
  <Typography
    sx={{
      fontSize: 13,
      fontWeight: 700,
      color: isDark ? '#93c5fd' : '#2563eb',
    }}
  >
    Application Pattern
  </Typography>
</Box>
```

---

## 8. Implementation Checklist

### ✅ Pre-Implementation Verification

**Status: READY TO IMPLEMENT**

- [x] Sidebar structure analyzed
- [x] Current order confirmed: Theme System → Architecture (no Application group)
- [x] Layout subgroup identified as empty (line 89-90)
- [x] No AppShell entry exists anywhere in sidebar
- [x] No AppShell routing exists in DocsPage.tsx
- [x] No appshell/ directory exists
- [x] Insertion points identified
- [x] Patterns documented
- [x] Reference components analyzed

### ❌ Implementation Tasks (NOT DONE)

**Phase 1: Sidebar** (5 minutes)

- [ ] Open `DocsSidebar.model.ts`
- [ ] Insert "Application" group after line 119
- [ ] Verify order: Theme System → Application → Architecture
- [ ] Save file

**Phase 2: Routing** (10 minutes)

- [ ] Open `DocsPage.tsx`
- [ ] Add import for AppShellDocs (line 28)
- [ ] Define appShellTocItems array (after line 148)
- [ ] Add isAppShellDocs detection with `.startsWith()` (after line 175)
- [ ] Update TOC ternary chain (before isOverview)
- [ ] Update content ternary chain (before isOverview)
- [ ] Save file

**Phase 3: Directory** (1 minute)

- [ ] Create directory: `web/src/pages/Docs/components/appshell/`

**Phase 4: Files** (60 minutes)

- [ ] Create `AppShellDocs.tsx` (30 min)
- [ ] Create `AppShellQuickStart.tsx` (10 min)
- [ ] Create `AppShellExamples.tsx` (5 min)
- [ ] Create `AppShellApi.tsx` (10 min)
- [ ] Create `AppShellDemo.tsx` (10 min)

**Phase 5: Validation** (10 minutes)

- [ ] Run typecheck
- [ ] Run dev server
- [ ] Navigate to `/docs/application/appshell`
- [ ] Verify sidebar order
- [ ] Verify TOC works
- [ ] Verify demo renders

---

## 9. Risk Assessment

### ✅ Low Risk Items

1. **Sidebar Insertion**

   - Simple array modification
   - Clear insertion point (line 119)
   - No complex logic

2. **Routing Pattern**

   - Following established pattern
   - Only adding, not modifying existing code
   - TypeScript will catch errors

3. **File Structure**
   - Standard pattern already established
   - No deviation from existing structure

### ⚠️ Medium Risk Items

1. **Path Detection Pattern**

   - MUST use `.startsWith()` not `===`
   - Easy to get wrong
   - **Mitigation**: Explicitly documented in plan

2. **TOC ID Matching**

   - IDs must match between DocsPage and AppShellDocs
   - Typos will break TOC
   - **Mitigation**: Copy-paste from plan

3. **Section Count**
   - Must be exactly 4 sections
   - Temptation to add more
   - **Mitigation**: Clear constraint documented

### 🔴 High Risk Items (Errors to Avoid)

1. **❌ Wrong Sidebar Order**

   - Risk: Placing Application after Architecture
   - **MUST BE**: Theme System → Application → Architecture
   - **Mitigation**: Verify line numbers before insert

2. **❌ AppShell Under Layout**

   - Risk: Adding AppShell to Layout subgroup (line 89-90)
   - **Mitigation**: Insert in separate "Application" group

3. **❌ Over-Engineering**

   - Risk: Creating extra files (Scenarios, Notes, etc.)
   - **Mitigation**: ONLY create 5 files specified

4. **❌ Wrong Path Detection**

   - Risk: Using `===` instead of `.startsWith()`
   - **Mitigation**: Explicit code snippet in plan

5. **❌ Duplicate Entries**
   - Risk: Adding AppShell in multiple places
   - **Mitigation**: Single entry under Application group

---

## 10. Acceptance Criteria

### Critical Requirements

**1. Sidebar Structure**

- [x] NO CHANGES YET (baseline verified)
- [ ] "Application" group must exist
- [ ] "Application" must appear between "Theme System" and "Architecture"
- [ ] "AppShell" must be under "Application" group
- [ ] "Layout" subgroup must remain empty
- [ ] No duplicate AppShell entries

**2. Routing**

- [x] NO CHANGES YET (baseline verified)
- [ ] `isAppShellDocs` must use `.startsWith('/docs/application/appshell')`
- [ ] `appShellTocItems` must have exactly 4 items
- [ ] AppShell must be in TOC ternary chain before isOverview
- [ ] AppShell must be in content ternary chain before isOverview

**3. Files**

- [x] NO FILES YET (baseline verified)
- [ ] Exactly 5 files created in `appshell/` directory
- [ ] No extra files (Composition, Scenarios, Notes, demos/)
- [ ] All imports resolve correctly

**4. Content**

- [ ] AppShellDocs has exactly 4 sections with correct IDs
- [ ] Hero section has blue gradient + "Application Pattern" badge
- [ ] Demo is simple, functional, with inline mock data
- [ ] No over-engineering in any component

**5. Functionality**

- [ ] TypeScript compiles with 0 errors
- [ ] Dev server runs without errors
- [ ] Page accessible at `/docs/application/appshell`
- [ ] Sidebar navigation works
- [ ] TOC scroll tracking works
- [ ] Demo renders and toggle works

---

## 11. Current vs. Required State

### Sidebar (DocsSidebar.model.ts)

| Aspect              | Current State        | Required State                         | Status   |
| ------------------- | -------------------- | -------------------------------------- | -------- |
| "Application" group | ❌ Does not exist    | ✅ Must exist                          | ⏳ TO DO |
| Order               | Theme → Architecture | Theme → **Application** → Architecture | ⏳ TO DO |
| "Layout" subgroup   | Empty (line 89-90)   | Remains empty                          | ✅ OK    |
| "AppShell" entry    | ❌ Does not exist    | Under "Application"                    | ⏳ TO DO |

### Routing (DocsPage.tsx)

| Aspect              | Current State | Required State             | Status   |
| ------------------- | ------------- | -------------------------- | -------- |
| Import AppShellDocs | ❌ Missing    | ✅ Must exist              | ⏳ TO DO |
| appShellTocItems    | ❌ Missing    | ✅ 4 items defined         | ⏳ TO DO |
| isAppShellDocs      | ❌ Missing    | ✅ Uses `.startsWith()`    | ⏳ TO DO |
| TOC ternary         | No AppShell   | AppShell before isOverview | ⏳ TO DO |
| Content ternary     | No AppShell   | AppShell before isOverview | ⏳ TO DO |

### Files

| File                   | Current State     | Required State            | Status   |
| ---------------------- | ----------------- | ------------------------- | -------- |
| appshell/ directory    | ❌ Does not exist | ✅ Must exist             | ⏳ TO DO |
| AppShellDocs.tsx       | ❌ Missing        | ✅ ~200 lines, 4 sections | ⏳ TO DO |
| AppShellQuickStart.tsx | ❌ Missing        | ✅ ~80 lines              | ⏳ TO DO |
| AppShellExamples.tsx   | ❌ Missing        | ✅ ~100 lines             | ⏳ TO DO |
| AppShellApi.tsx        | ❌ Missing        | ✅ ~120 lines             | ⏳ TO DO |
| AppShellDemo.tsx       | ❌ Missing        | ✅ ~100 lines             | ⏳ TO DO |

---

## 12. Next Steps

### Immediate Actions

1. **Review this analysis** with stakeholder
2. **Confirm constraints**:
   - Only 5 files
   - Only 4 sections
   - `.startsWith()` for path detection
   - Order: Theme System → Application → Architecture
3. **Execute implementation** following simplified plan
4. **Validate** against acceptance criteria
5. **Create post-implementation report**

### Implementation Order

**DO IN THIS EXACT ORDER**:

1. Sidebar changes first (verify order before proceeding)
2. Routing changes second (verify `.startsWith()`)
3. Create directory
4. Create files one by one (verify each compiles)
5. Manual testing

### Post-Implementation Report Location

```
.opencode/reports/add-appshell-docs-application-group-report.md
```

---

## 13. Conclusion

### Current Status

**IMPLEMENTATION STATUS**: ❌ **NOT STARTED**

The codebase is in a **clean baseline state**:

- ✅ No Application group exists (as expected)
- ✅ No AppShell references anywhere
- ✅ Layout subgroup is empty (correct)
- ✅ Sidebar order is Theme System → Architecture (ready for insertion)

### Readiness Assessment

**READY TO IMPLEMENT**: ✅ YES

All prerequisites are met:

- [x] Insertion points identified
- [x] Patterns documented
- [x] Reference components analyzed
- [x] Constraints clarified
- [x] Risks identified
- [x] Acceptance criteria defined

### Critical Reminders

1. ⚠️ **Sidebar Order**: Theme System → **Application** → Architecture
2. ⚠️ **Path Detection**: MUST use `.startsWith()` NOT `===`
3. ⚠️ **File Count**: ONLY 5 files, no extras
4. ⚠️ **Section Count**: ONLY 4 sections in AppShellDocs
5. ⚠️ **No Over-Engineering**: This is v1, keep it simple

### Estimated Timeline

- Sidebar: 5 minutes
- Routing: 10 minutes
- Files: 60 minutes
- Validation: 10 minutes
- **Total**: ~85 minutes

---

**END OF ANALYSIS**

Ready for implementation execution.
