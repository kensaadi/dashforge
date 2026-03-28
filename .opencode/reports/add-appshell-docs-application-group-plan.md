# AppShell Documentation Page - Implementation Plan

**Date**: 2026-03-28  
**Status**: Analysis Complete - Ready for Implementation  
**Project**: Dashforge Documentation Website  
**Task**: Add AppShell documentation page under "Application" group (NOT "Layout")

---

## Executive Summary

This plan details the implementation of a comprehensive documentation page for the **AppShell** component in the Dashforge documentation website.

**Critical Architectural Decision**: AppShell is an **application-level shell pattern** (header + sidebar + content orchestration with responsive navigation), NOT a low-level layout primitive. Therefore, it MUST be placed under a new **"Application"** sidebar group, NOT under the existing "Layout" group.

---

## 1. Current Documentation Architecture Analysis

### 1.1 Documentation Site Structure

The documentation site is located at:

```
web/
├── src/
│   ├── pages/
│   │   ├── Docs/
│   │   │   ├── DocsPage.tsx          (Main docs page with routing logic)
│   │   │   ├── components/
│   │   │   │   ├── DocsSidebar.model.ts   (SIDEBAR NAVIGATION TREE)
│   │   │   │   ├── DocsSidebar.tsx         (Sidebar rendering)
│   │   │   │   ├── DocsLayout.tsx          (Layout composition)
│   │   │   │   ├── DocsToc.tsx             (Table of contents)
│   │   │   │   └── [component-folders]/    (Component docs)
│   │   │   ├── getting-started/
│   │   │   └── theme-system/
```

### 1.2 Current Sidebar Structure

Located in: `web/src/pages/Docs/components/DocsSidebar.model.ts`

Current groups (lines 34-124):

1. **Getting Started** (5 items)
2. **Core Concepts** (empty - "Coming soon")
3. **UI Components**
   - Input (TextField, NumberField, Select, Autocomplete)
   - **Layout** (empty - "Coming soon")
   - Utilities (ConfirmDialog, Snackbar)
4. **Form System** (empty - "Coming soon")
5. **Theme System** (Design Tokens)
6. **Architecture** (empty - "Coming soon")

**Key Finding**: There is currently an empty "Layout" subgroup under "UI Components", but AppShell must NOT go there.

### 1.3 Documentation Page Pattern

All component documentation pages follow this consistent pattern:

**Directory Structure**:

```
web/src/pages/Docs/components/[component-name]/
├── [Component]Docs.tsx           (Main orchestrator)
├── [Component]QuickStart.tsx     (Quick Start section)
├── [Component]Examples.tsx       (Examples section)
├── [Component]Scenarios.tsx      (Scenarios/Capabilities)
├── [Component]Api.tsx            (API Reference)
├── [Component]Notes.tsx          (Implementation Notes)
└── demos/                        (Individual demo components)
    ├── [Component]BasicDemo.tsx
    ├── [Component]AdvancedDemo.tsx
    └── ...
```

**Main Docs Component Structure** (~200-300 lines):

```tsx
export function [Component]Docs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Stack spacing={3}>
        <Typography variant="h1" sx={{ ... }}>Title</Typography>
        <Typography variant="body1" sx={{ ... }}>Description</Typography>
        <Box sx={{ ... }}>Category Badge</Box>
      </Stack>

      {/* Quick Start Section */}
      <Stack spacing={4} id="quick-start">
        <Typography variant="h2">Quick Start</Typography>
        <[Component]QuickStart />
      </Stack>

      {/* Examples Section */}
      <Stack spacing={4} id="examples">
        <Typography variant="h2">Examples</Typography>
        <[Component]Examples />
      </Stack>

      {/* Additional Sections */}
      ...

      {/* API Section */}
      <Stack spacing={4} id="api">
        <Typography variant="h2">API Reference</Typography>
        <[Component]Api />
      </Stack>

      {/* Implementation Notes */}
      <Stack spacing={4} id="notes">
        <Typography variant="h2">Implementation Notes</Typography>
        <[Component]Notes />
      </Stack>
    </Stack>
  );
}
```

### 1.4 Routing Integration Pattern

Located in: `web/src/pages/Docs/DocsPage.tsx`

**Pattern**:

1. Import component docs: `import { AppShellDocs } from './components/appshell/AppShellDocs';`
2. Define TOC items array: `const appShellTocItems: DocsTocItem[] = [...]`
3. Add path detection: `const isAppShellDocs = location.pathname === '/docs/application/appshell';`
4. Add TOC selection logic: Include in ternary chain
5. Add content rendering logic: Include in ternary chain

### 1.5 Table of Contents (On This Page) System

**Location**: Right sidebar, rendered by `DocsToc.tsx`

**Mechanism**:

- TOC items defined in `DocsPage.tsx` as array of `{ id: string, label: string }`
- Each section in docs has `id` attribute matching TOC item `id`
- IntersectionObserver tracks scroll position and highlights active section
- Clicking TOC item scrolls to corresponding section

**Standard TOC Items**:

```typescript
const [component]TocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'layout-variants', label: 'Layout Variants' }, // or similar
  { id: 'playground', label: 'Interactive Playground' }, // if applicable
  { id: 'capabilities', label: 'Capabilities' }, // or 'Scenarios'
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

---

## 2. AppShell Component Analysis

### 2.1 AppShell Component Location

```
libs/dashforge/ui/src/components/AppShell/
├── AppShell.tsx                 (145 lines - main component)
├── AppShell.unit.test.tsx       (207 lines - comprehensive tests)
├── types.ts                     (123 lines - TypeScript interfaces)
└── index.ts                     (2 lines - exports)
```

**Export Status**: Already exported from `@dashforge/ui`:

```typescript
export { AppShell } from './components/AppShell/AppShell';
export type { AppShellProps } from './components/AppShell/types';
```

### 2.2 AppShell Dependencies

**Direct Component Dependencies**:

- `LeftNav` (side navigation component)
- `TopBar` (header component)
- Both are already exported from `@dashforge/ui`

**Type Dependencies**:

- `LeftNavItem`, `RenderLinkFn`, `IsActiveFn` from LeftNav types
- MUI types: `AppBarProps`, `SxProps`, `Theme`

**Status**: All dependencies available in docs environment.

### 2.3 AppShell Features & Positioning

**What AppShell Is**:

- Application-level shell pattern for authenticated/admin/product surfaces
- Orchestrates LeftNav (sidebar navigation) + TopBar (header) + main content area
- Responsive layout coordination (desktop side-by-side, mobile overlay)
- Controlled/uncontrolled navigation state management
- Automatic content offset calculation
- Toolbar spacing for fixed headers

**What AppShell Is NOT**:

- NOT a low-level layout primitive (like Box, Stack, Grid)
- NOT a simple wrapper component
- NOT just a "layout" utility

**Correct Positioning**:

- High-level application building block
- Used once per application (typically in `App.tsx` or layout wrapper)
- Defines the structural frame for authenticated experiences
- Similar level of abstraction to "page templates" or "application frames"

---

## 3. Implementation Plan

### Phase 1: Add "Application" Sidebar Group

**File to Modify**: `web/src/pages/Docs/components/DocsSidebar.model.ts`

**Changes**:

1. Add new group at the end of `docsSidebarTree` array (after "Architecture" group)
2. Group definition:

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

**Complete Modified Array Structure**:

```typescript
export const docsSidebarTree: DocsSidebarGroup[] = [
  { title: 'Getting Started', items: [...] },
  { title: 'Core Concepts', items: [] },
  { title: 'UI Components', items: [...] },
  { title: 'Form System', items: [] },
  { title: 'Theme System', items: [...] },
  { title: 'Architecture', items: [] },
  {
    title: 'Application',  // NEW GROUP
    items: [
      {
        label: 'AppShell',
        path: '/docs/application/appshell',
      },
    ],
  },
];
```

**Line Numbers**: Insert after line 123 (after Architecture group)

**Estimated Changes**: +9 lines

---

### Phase 2: Create AppShell Documentation Directory Structure

**New Directory**: `web/src/pages/Docs/components/appshell/`

**Files to Create**:

1. **AppShellDocs.tsx** (~250 lines)

   - Main documentation page orchestrator
   - Hero section with title, description, badge
   - Imports and renders all sub-sections
   - Follows pattern from ConfirmDialogDocs.tsx and SnackbarDocs.tsx

2. **AppShellQuickStart.tsx** (~120 lines)

   - Quick start guide with basic usage
   - Code example showing minimal AppShell setup
   - Installation reminder if needed
   - Import statements example

3. **AppShellExamples.tsx** (~180 lines)

   - Basic example: AppShell with simple navigation
   - Responsive example: Desktop vs mobile behavior
   - Controlled navigation example: External nav state control
   - Custom slots example: Header/footer customization

4. **AppShellComposition.tsx** (~150 lines)

   - Or "AppShellLayoutVariants.tsx"
   - Desktop layout (side-by-side)
   - Mobile layout (overlay)
   - Fixed vs static TopBar
   - Expanded vs collapsed navigation

5. **AppShellScenarios.tsx** (~160 lines)

   - Admin panel integration
   - Dashboard application
   - Multi-tenant app with dynamic navigation
   - Integration with routing libraries

6. **AppShellApi.tsx** (~180 lines)

   - AppShellProps table with descriptions
   - LeftNav integration notes
   - TopBar integration notes
   - Slot customization options

7. **AppShellNotes.tsx** (~120 lines)

   - Architecture notes (composition pattern)
   - When to use AppShell vs custom layout
   - Performance considerations
   - Accessibility notes
   - Router integration best practices

8. **demos/** directory
   - **AppShellBasicDemo.tsx** (~80 lines)
   - **AppShellResponsiveDemo.tsx** (~100 lines)
   - **AppShellControlledDemo.tsx** (~90 lines)
   - **AppShellCustomSlotsDemo.tsx** (~110 lines)

**Total New Files**: 12 files
**Estimated Total Lines**: ~1,540 lines

---

### Phase 3: Update DocsPage.tsx Routing

**File to Modify**: `web/src/pages/Docs/DocsPage.tsx`

**Changes Required**:

1. **Add Import** (after line 27):

```typescript
import { AppShellDocs } from './components/appshell/AppShellDocs';
```

2. **Define TOC Items** (after line 148):

```typescript
const appShellTocItems: DocsTocItem[] = [
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'composition', label: 'Composition & Layout' },
  { id: 'scenarios', label: 'Integration Scenarios' },
  { id: 'api', label: 'API Reference' },
  { id: 'notes', label: 'Implementation Notes' },
];
```

3. **Add Path Detection** (after line 175):

```typescript
const isAppShellDocs = location.pathname === '/docs/application/appshell';
```

4. **Update TOC Selection Logic** (in ternary chain around line 177-199):

```typescript
const tocItems = isNumberFieldDocs
  ? numberFieldTocItems
  : isSelectDocs
  ? selectTocItems
  : isAutocompleteDocs
  ? autocompleteTocItems
  : isConfirmDialogDocs
  ? confirmDialogTocItems
  : isSnackbarDocs
  ? snackbarTocItems
  : isAppShellDocs // NEW
  ? appShellTocItems // NEW
  : isOverview
  ? overviewTocItems
  : isInstallation
  ? installationTocItems
  : isUsage
  ? usageTocItems
  : isProjectStructure
  ? projectStructureTocItems
  : isWhyDashforge
  ? whyDashforgeTocItems
  : isDesignTokens
  ? designTokensTocItems
  : textFieldTocItems;
```

5. **Update Content Rendering Logic** (in ternary chain around line 201-225):

```typescript
const docsContent = isNumberFieldDocs ? (
  <NumberFieldDocs />
) : isSelectDocs ? (
  <SelectDocs />
) : isAutocompleteDocs ? (
  <AutocompleteDocs />
) : isConfirmDialogDocs ? (
  <ConfirmDialogDocs />
) : isSnackbarDocs ? (
  <SnackbarDocs />
) : isAppShellDocs ? ( // NEW
  <AppShellDocs /> // NEW
) : isOverview ? (
  <Overview />
) : isInstallation ? (
  <Installation />
) : isUsage ? (
  <Usage />
) : isProjectStructure ? (
  <ProjectStructure />
) : isWhyDashforge ? (
  <WhyDashforge />
) : isDesignTokens ? (
  <DesignTokensDocs />
) : (
  <TextFieldDocs />
);
```

**Estimated Changes**: +20 lines (import, TOC array, path check, 2 ternary additions)

---

### Phase 4: Content Writing Guidelines

**Hero Section Badge Category**:

```tsx
<Box
  sx={{
    bgcolor: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.10)',
    border: isDark
      ? '1px solid rgba(59,130,246,0.30)'
      : '1px solid rgba(59,130,246,0.25)',
  }}
>
  <Typography sx={{ color: isDark ? '#93c5fd' : '#2563eb' }}>
    Application Pattern
  </Typography>
</Box>
```

**Title Gradient** (use blue gradient for Application category):

```tsx
background: isDark
  ? 'linear-gradient(135deg, #ffffff 0%, #60a5fa 100%)'
  : 'linear-gradient(135deg, #0f172a 0%, #2563eb 100%)';
```

**Description Template**:

```
An application-level shell component for structuring authenticated experiences,
admin panels, and dashboard applications. Orchestrates sidebar navigation, header,
and main content area with responsive layout coordination and navigation state management.
```

**Positioning Language**:

- Use terms: "application shell", "structural frame", "authenticated experience", "admin panel", "dashboard"
- Avoid terms: "layout primitive", "container", "wrapper"
- Emphasize: high-level composition, application-wide usage, page frame

**Section Content**:

1. **Quick Start**:

   - Basic AppShell setup with mock navigation items
   - LeftNav integration example
   - TopBar customization example
   - Main content area usage

2. **Examples**:

   - Basic layout demo
   - Responsive behavior demo (show desktop/mobile switching)
   - Controlled navigation demo (external button toggling nav)
   - Custom slots demo (header, footer, topBar regions)

3. **Composition & Layout**:

   - Desktop layout explanation (side-by-side)
   - Mobile layout explanation (overlay modal)
   - Fixed vs static TopBar
   - Nav width customization (expanded/collapsed)
   - Breakpoint configuration

4. **Integration Scenarios**:

   - Admin panel setup
   - Multi-page dashboard application
   - Integration with React Router
   - Integration with Next.js (future consideration)
   - Dynamic navigation based on user permissions

5. **API Reference**:

   - Full AppShellProps table
   - LeftNav-related props (items, renderLink, isActive)
   - TopBar-related props (topBarLeft, topBarCenter, topBarRight)
   - Layout props (navWidthExpanded, navWidthCollapsed, breakpoint)
   - State props (navOpen, defaultNavOpen, onNavOpenChange)
   - Slot props (leftNavHeader, leftNavFooter)

6. **Implementation Notes**:
   - When to use AppShell vs custom layout
   - Performance: AppShell is lightweight composition
   - Accessibility: proper ARIA landmarks
   - Router integration best practices
   - Customization patterns

---

## 4. Demo Components Implementation

### 4.1 AppShellBasicDemo.tsx

**Content**:

- Simple AppShell with 4-5 navigation items
- Basic TopBar with logo and user menu placeholder
- Main content area with sample content
- Default responsive behavior

**Key Points**:

- Show minimal setup
- Use mock LeftNavItem[] data
- Demonstrate default behavior

**Estimated Lines**: ~80

---

### 4.2 AppShellResponsiveDemo.tsx

**Content**:

- AppShell with visual indicators for current mode (desktop/mobile)
- Show breakpoint switching
- Display current nav state (open/closed)
- Interactive resize message or viewport width display

**Key Points**:

- Emphasize responsive behavior
- Show mobile overlay vs desktop side-by-side
- Demonstrate automatic layout switching

**Estimated Lines**: ~100

---

### 4.3 AppShellControlledDemo.tsx

**Content**:

- AppShell with controlled `navOpen` prop
- External button to toggle navigation
- State synchronization with `onNavOpenChange`
- Display current state in UI

**Key Points**:

- Show controlled vs uncontrolled pattern
- Demonstrate state management
- External control of navigation

**Estimated Lines**: ~90

---

### 4.4 AppShellCustomSlotsDemo.tsx

**Content**:

- AppShell with all slots populated:
  - `leftNavHeader`: Custom logo/branding
  - `leftNavFooter`: User profile or settings
  - `topBarLeft`: Breadcrumbs or page title
  - `topBarCenter`: Search bar
  - `topBarRight`: Notifications + user menu
- Rich main content

**Key Points**:

- Show full slot customization
- Demonstrate flexibility
- Realistic application layout

**Estimated Lines**: ~110

---

## 5. File Changes Summary

### Files to Modify (2 total)

1. **`web/src/pages/Docs/components/DocsSidebar.model.ts`**

   - Add "Application" group with AppShell item
   - **Lines Changed**: +9 lines (insert after line 123)

2. **`web/src/pages/Docs/DocsPage.tsx`**
   - Add import for AppShellDocs
   - Define appShellTocItems
   - Add path detection
   - Update TOC selection logic
   - Update content rendering logic
   - **Lines Changed**: +20 lines (distributed)

### Files to Create (12 total)

#### Main Documentation Directory

```
web/src/pages/Docs/components/appshell/
```

#### Documentation Components (7 files)

1. `AppShellDocs.tsx` (~250 lines)
2. `AppShellQuickStart.tsx` (~120 lines)
3. `AppShellExamples.tsx` (~180 lines)
4. `AppShellComposition.tsx` (~150 lines)
5. `AppShellScenarios.tsx` (~160 lines)
6. `AppShellApi.tsx` (~180 lines)
7. `AppShellNotes.tsx` (~120 lines)

#### Demo Components (4 files in `demos/` subdirectory)

8. `demos/AppShellBasicDemo.tsx` (~80 lines)
9. `demos/AppShellResponsiveDemo.tsx` (~100 lines)
10. `demos/AppShellControlledDemo.tsx` (~90 lines)
11. `demos/AppShellCustomSlotsDemo.tsx` (~110 lines)

#### Mock Data (1 file)

12. `mockNavItems.ts` (~30 lines)

**Total New Lines**: ~1,570 lines across 12 new files

---

## 6. Implementation Sequence

### Step 1: Sidebar Group Addition (5 minutes)

1. Open `web/src/pages/Docs/components/DocsSidebar.model.ts`
2. Add "Application" group after "Architecture" group (line 123)
3. Save file
4. Verify TypeScript compilation

### Step 2: Routing Integration (10 minutes)

1. Open `web/src/pages/Docs/DocsPage.tsx`
2. Add import for AppShellDocs (will exist after Step 3)
3. Define appShellTocItems array
4. Add isAppShellDocs path detection
5. Update TOC selection ternary
6. Update content rendering ternary
7. Save file

### Step 3: Create Directory Structure (2 minutes)

1. Create directory: `web/src/pages/Docs/components/appshell/`
2. Create subdirectory: `web/src/pages/Docs/components/appshell/demos/`

### Step 4: Create Mock Data (15 minutes)

1. Create `mockNavItems.ts`
2. Define sample LeftNavItem[] array (5-6 items)
3. Include different item types (regular items, dividers if applicable)

### Step 5: Create Demo Components (90 minutes)

1. Create `AppShellBasicDemo.tsx` (20 min)
2. Create `AppShellResponsiveDemo.tsx` (25 min)
3. Create `AppShellControlledDemo.tsx` (20 min)
4. Create `AppShellCustomSlotsDemo.tsx` (25 min)

### Step 6: Create Documentation Section Components (120 minutes)

1. Create `AppShellQuickStart.tsx` (20 min)
2. Create `AppShellExamples.tsx` (25 min)
3. Create `AppShellComposition.tsx` (20 min)
4. Create `AppShellScenarios.tsx` (25 min)
5. Create `AppShellApi.tsx` (20 min)
6. Create `AppShellNotes.tsx` (10 min)

### Step 7: Create Main Docs Component (30 minutes)

1. Create `AppShellDocs.tsx`
2. Import all section components
3. Create hero section with proper styling
4. Compose all sections with IDs for TOC
5. Follow spacing pattern from other docs

### Step 8: Validation (30 minutes)

1. Run typecheck: `npx nx run web:typecheck`
2. Build check: `npx nx run web:build`
3. Dev server: `npx nx run web:serve`
4. Navigate to `/docs/application/appshell`
5. Verify sidebar shows "Application" group
6. Verify "AppShell" item is clickable and navigates correctly
7. Verify TOC (On This Page) shows all sections
8. Verify TOC anchors work (click -> scroll)
9. Verify all demos render without errors
10. Test responsive behavior (resize browser)
11. Verify light/dark mode switching works

**Total Estimated Time**: ~5 hours (including validation and refinement)

---

## 7. Acceptance Criteria

### Must Have ✅

- [ ] **Sidebar Structure**

  - [ ] "Application" group exists in sidebar
  - [ ] "Application" group appears AFTER "Architecture" group
  - [ ] "AppShell" item appears under "Application" group
  - [ ] "AppShell" does NOT appear under "Layout" subgroup
  - [ ] No duplicate AppShell entries anywhere in sidebar

- [ ] **Navigation**

  - [ ] Clicking "AppShell" in sidebar navigates to `/docs/application/appshell`
  - [ ] Direct URL access to `/docs/application/appshell` works
  - [ ] Active state highlights "AppShell" item when on page
  - [ ] Browser back/forward buttons work correctly

- [ ] **Page Structure**

  - [ ] Page follows standard docs component pattern
  - [ ] Hero section with title, description, category badge present
  - [ ] All required sections present: Quick Start, Examples, Composition, Scenarios, API, Notes
  - [ ] Section IDs match TOC items

- [ ] **Table of Contents**

  - [ ] TOC panel appears on right side
  - [ ] TOC shows all 6 section items
  - [ ] Clicking TOC item scrolls to corresponding section
  - [ ] Active section highlighting works during scroll
  - [ ] TOC is sticky during scroll

- [ ] **Content Quality**

  - [ ] Language emphasizes "application-level shell pattern"
  - [ ] No language suggesting it's a "layout primitive"
  - [ ] Clear distinction from low-level layout components
  - [ ] Examples are functional and render correctly

- [ ] **Technical Quality**
  - [ ] No TypeScript errors
  - [ ] No console errors or warnings
  - [ ] Build succeeds without errors
  - [ ] All imports resolve correctly
  - [ ] No broken links or routes

### Should Have 🎯

- [ ] **Demo Components**

  - [ ] All 4 demo components render correctly
  - [ ] Demos are interactive where appropriate
  - [ ] Demos show realistic use cases
  - [ ] Code examples are clear and copy-able

- [ ] **Visual Polish**

  - [ ] Consistent styling with existing component docs
  - [ ] Proper spacing between sections
  - [ ] Gradient colors appropriate for "Application" category
  - [ ] Badge color distinct from other categories

- [ ] **Responsiveness**
  - [ ] Page layout works on mobile viewport
  - [ ] Demos work on mobile viewport
  - [ ] TOC behavior appropriate on mobile (hidden or collapsed)

### Nice to Have 🌟

- [ ] **Interactive Elements**

  - [ ] Code copy buttons work (if implemented in existing docs)
  - [ ] Interactive playground for prop exploration
  - [ ] Live code editing for demos

- [ ] **Additional Content**
  - [ ] Migration guide from custom layouts
  - [ ] Comparison table: AppShell vs custom layout
  - [ ] Video walkthrough or animated GIF
  - [ ] Links to related components (LeftNav, TopBar)

---

## 8. Risk Assessment

### Low Risks ✅

1. **Sidebar Model Change**

   - Simple array addition
   - No complex logic changes
   - Easy to verify correctness
   - **Mitigation**: TypeScript will catch any structural errors

2. **Routing Integration**

   - Following established pattern
   - No new routing mechanism needed
   - **Mitigation**: Test direct URL access and sidebar navigation

3. **Component Availability**
   - AppShell already exported from `@dashforge/ui`
   - All dependencies available
   - **Mitigation**: Verify imports before writing demos

### Medium Risks ⚠️

1. **Content Volume**

   - 12 new files, ~1,570 lines of code
   - Risk of inconsistency across files
   - **Mitigation**:
     - Create templates/skeletons first
     - Review one section at a time
     - Use existing docs as reference

2. **Positioning Clarity**

   - Must clearly communicate "application-level" not "layout primitive"
   - Risk of confusing language
   - **Mitigation**:
     - Review language in each section
     - Emphasize use cases (admin panels, dashboards)
     - Use "application shell" terminology consistently

3. **Demo Complexity**
   - AppShell demos need realistic context (navigation, content)
   - Risk of overly complex or unclear demos
   - **Mitigation**:
     - Start with simplest demo first
     - Use mock data consistently
     - Keep demo code concise and focused

### Specific Risks & Mitigations

**Risk**: Accidentally placing AppShell under "Layout"

- **Likelihood**: Low (explicit plan says "Application")
- **Impact**: High (defeats purpose of task)
- **Mitigation**:
  - Check sidebar tree structure before committing
  - Verify in browser that "Application" group exists
  - Confirm AppShell is NOT under "Layout"

**Risk**: TOC items not matching section IDs

- **Likelihood**: Medium (easy typo)
- **Impact**: Medium (broken TOC navigation)
- **Mitigation**:
  - Use consistent naming pattern: `quick-start`, `examples`, `api`, etc.
  - Test TOC clicking after implementation
  - Console errors will show if ID not found

**Risk**: Import path errors

- **Likelihood**: Low
- **Impact**: High (build fails)
- **Mitigation**:
  - Use TypeScript auto-import
  - Verify `@dashforge/ui` package.json exports
  - Test build early

---

## 9. Testing Checklist

### Build & Compilation

- [ ] `npx nx run web:typecheck` passes with 0 errors
- [ ] `npx nx run web:build` completes successfully
- [ ] No TypeScript errors in terminal
- [ ] No missing import errors

### Navigation Testing

- [ ] Open docs site: `npx nx run web:serve`
- [ ] Navigate to `/docs`
- [ ] Verify "Application" group appears in left sidebar
- [ ] Verify "Application" is LAST group (after Architecture)
- [ ] Verify "AppShell" item appears under "Application"
- [ ] Verify "AppShell" does NOT appear under "Layout"
- [ ] Click "AppShell" item
- [ ] URL changes to `/docs/application/appshell`
- [ ] Page content loads correctly

### Direct Access Testing

- [ ] Navigate directly to `/docs/application/appshell` in browser
- [ ] Page loads without 404 error
- [ ] Sidebar shows "AppShell" as active (highlighted)
- [ ] Content renders correctly

### Table of Contents Testing

- [ ] TOC panel appears on right side of page
- [ ] TOC shows 6 items: Quick Start, Examples, Composition, Scenarios, API, Notes
- [ ] Click "Quick Start" in TOC
- [ ] Page scrolls to Quick Start section
- [ ] "Quick Start" becomes active (highlighted) in TOC
- [ ] Repeat for all TOC items
- [ ] Manually scroll through page
- [ ] Verify TOC active state updates as you scroll past sections
- [ ] Scroll to bottom of page
- [ ] Verify last TOC item becomes active

### Content Testing

- [ ] Hero section renders:
  - [ ] Title: "AppShell"
  - [ ] Description mentions "application-level shell"
  - [ ] Badge shows "Application Pattern" (or similar)
  - [ ] Gradient colors are blue-ish (Application category)
- [ ] Quick Start section renders
- [ ] Examples section renders with all demos
- [ ] Composition section renders
- [ ] Scenarios section renders
- [ ] API section renders with props table
- [ ] Notes section renders

### Demo Components Testing

- [ ] AppShellBasicDemo renders without errors
- [ ] AppShellResponsiveDemo renders without errors
- [ ] AppShellControlledDemo renders without errors
  - [ ] Toggle button works
  - [ ] Nav state changes when clicked
- [ ] AppShellCustomSlotsDemo renders without errors
  - [ ] All slots show custom content

### Responsive Testing

- [ ] Resize browser to mobile width (~375px)
- [ ] Verify page layout adapts
- [ ] Verify demos still render correctly
- [ ] Verify TOC behavior on mobile (may hide or collapse)
- [ ] Resize back to desktop
- [ ] Verify layout returns to normal

### Dark Mode Testing

- [ ] Toggle dark mode (button in top bar)
- [ ] Verify all content is readable
- [ ] Verify gradient colors work in dark mode
- [ ] Verify TOC is readable in dark mode
- [ ] Verify demos render correctly in dark mode
- [ ] Toggle back to light mode
- [ ] Verify everything still works

### Browser Console Testing

- [ ] Open browser console (F12)
- [ ] Navigate to AppShell docs page
- [ ] Verify no errors in console
- [ ] Verify no warnings about missing components
- [ ] Verify no 404 errors for resources
- [ ] Click through all TOC items
- [ ] Verify no errors during scroll/navigation

### Regression Testing

- [ ] Navigate to other docs pages (TextField, Select, etc.)
- [ ] Verify they still load correctly
- [ ] Verify their TOC still works
- [ ] Verify their sidebar highlighting still works
- [ ] Verify no duplicate sidebar entries for any component

---

## 10. Post-Implementation Verification

### Explicit Verification Requirements

Before considering this task complete, explicitly verify and document:

1. **Sidebar Placement Confirmation**

   - Open browser to docs site
   - Take screenshot of sidebar showing "Application" group
   - Confirm in screenshot that:
     - "Application" group exists
     - "Application" is AFTER "Architecture"
     - "AppShell" appears under "Application"
     - "Layout" subgroup (under UI Components) is still empty
     - No "AppShell" appears anywhere under "Layout"

2. **Route Verification**

   - Navigate to `/docs/application/appshell`
   - Verify URL in address bar is exactly: `/docs/application/appshell`
   - Verify page loads without 404
   - Verify correct content appears

3. **No Duplicates**

   - Search entire codebase for "AppShell" in DocsSidebar.model.ts
   - Verify only ONE entry exists (under "Application" group)
   - Search entire codebase for path `/docs/application/appshell`
   - Verify no conflicting routes exist

4. **Architectural Intent Statement**
   - Review page content (AppShellDocs.tsx, AppShellQuickStart.tsx, AppShellNotes.tsx)
   - Confirm language emphasizes:
     - "application-level shell"
     - "authenticated experiences"
     - "admin panels" / "dashboards"
   - Confirm language does NOT suggest:
     - "layout primitive"
     - "container component"
     - Placement under "Layout"

---

## 11. Documentation for Report

After implementation, create report file:

```
.opencode/reports/add-appshell-docs-application-group-report.md
```

**Report Must Include**:

### 1. Files Changed

- List all modified files with line numbers of changes
- List all created files with line counts

### 2. Sidebar Structure

- Copy of the new "Application" group definition from DocsSidebar.model.ts
- Confirmation that it was added AFTER "Architecture" group
- Screenshot or description of sidebar rendering

### 3. Route Added

- Route path: `/docs/application/appshell`
- Confirmation that route works (tested)

### 4. TOC Items Defined

- Copy of appShellTocItems array from DocsPage.tsx
- Confirmation that all IDs match section IDs in AppShellDocs.tsx

### 5. Final Sidebar Placement Confirmation

**Explicit statement**:

> "AppShell was intentionally and correctly placed under the **Application** sidebar group,
> NOT under the Layout subgroup. This placement reflects AppShell's role as an application-level
> shell pattern for authenticated experiences, admin panels, and dashboard applications.
> It is not a low-level layout primitive and therefore does not belong in the Layout category."

### 6. Testing Results

- Build status (pass/fail)
- Typecheck status (pass/fail)
- Manual testing results (navigation, TOC, demos)
- Any issues encountered and resolved

### 7. Follow-up Notes

- Any gaps in content that could be improved
- Suggestions for future enhancements (e.g., video walkthrough)
- Related documentation that might need updates

---

## 12. Success Metrics

**Quantitative**:

- 0 TypeScript errors
- 0 build errors
- 0 console errors in browser
- 1 new sidebar group ("Application")
- 1 new component docs entry ("AppShell")
- 12 new files created
- ~1,570 lines of documentation code written
- 6 TOC sections with working anchors
- 4 interactive demos

**Qualitative**:

- Sidebar hierarchy is semantically correct
- "Application" positioning is clear and justified
- Documentation follows established patterns
- Content clearly distinguishes AppShell from layout primitives
- Examples are realistic and helpful
- API documentation is comprehensive
- Notes section provides valuable guidance

---

## 13. Future Enhancements (Out of Scope)

These are NOT part of this implementation but could be added later:

1. **Interactive Playground**

   - Live prop editor for AppShell
   - Real-time preview of layout changes
   - Similar to existing component playgrounds

2. **Video Walkthrough**

   - Screen recording showing AppShell in action
   - Step-by-step setup guide
   - Integration with routing libraries

3. **Migration Guide**

   - Dedicated page for migrating from custom layouts to AppShell
   - Step-by-step instructions
   - Before/after code examples

4. **Related Documentation**

   - LeftNav standalone documentation
   - TopBar standalone documentation
   - Cross-linking between AppShell, LeftNav, TopBar docs

5. **Advanced Examples**
   - Multi-tenant application with dynamic navigation
   - Permission-based navigation items
   - Nested routing within AppShell

---

## 14. Conclusion

### Summary

This plan provides a comprehensive blueprint for adding AppShell documentation to the Dashforge docs website under the correct "Application" sidebar group.

**Key Architectural Decision**: AppShell is positioned as an application-level building block, NOT a layout primitive, and therefore belongs in a dedicated "Application" group, NOT under "Layout".

### Implementation Approach

1. Add "Application" group to sidebar model (1 file, 9 lines)
2. Update routing in DocsPage.tsx (1 file, 20 lines)
3. Create 12 new documentation files (~1,570 lines total)
4. Follow established documentation patterns
5. Emphasize application-level positioning in content
6. Validate thoroughly before completion

### Estimated Effort

- **Implementation**: 4-5 hours
- **Validation**: 30-60 minutes
- **Report Writing**: 30 minutes
- **Total**: ~5-6 hours

### Risk Level

**Overall Risk: LOW-MEDIUM**

- Low risk for technical implementation (following patterns)
- Medium risk for content volume and consistency
- All risks have clear mitigations

### Next Steps

1. Review and approve this plan
2. Execute Phase 1-7 in sequence
3. Perform comprehensive validation (Phase 8)
4. Create post-implementation report
5. Consider future enhancements based on user feedback

---

**End of Implementation Plan**

Ready for execution once approved.
