# AppShell Documentation - Simplified Implementation Plan (PATCH)

**Date**: 2026-03-28  
**Status**: SIMPLIFIED - Ready for Fast Execution  
**Complexity**: MINIMAL - V1 Documentation

---

## CRITICAL SIMPLIFICATIONS

This plan overrides the previous over-engineered approach with a **pragmatic, minimal v1 implementation**.

### Rules Applied

1. ✅ Minimal file structure (6 files total, not 12)
2. ✅ Single demo file (not 4 separate demos)
3. ✅ No Composition.tsx or Scenarios.tsx
4. ✅ Focus on clarity, correctness, speed
5. ✅ Use `location.pathname.startsWith()` for routing
6. ✅ Correct sidebar order: Theme System → Application → Architecture

---

## 1. Sidebar Changes

### File: `web/src/pages/Docs/components/DocsSidebar.model.ts`

**Current Order** (lines 107-124):

```typescript
{
  title: 'Theme System',
  items: [
    {
      label: 'Design Tokens',
      path: '/docs/theme-system/design-tokens',
    },
  ],
},
{
  title: 'Architecture',
  items: [],
},
```

**New Order** (INSERT "Application" between Theme System and Architecture):

```typescript
{
  title: 'Theme System',
  items: [
    {
      label: 'Design Tokens',
      path: '/docs/theme-system/design-tokens',
    },
  ],
},
{
  title: 'Application',  // NEW GROUP
  items: [
    {
      label: 'AppShell',
      path: '/docs/application/appshell',
    },
  ],
},
{
  title: 'Architecture',
  items: [],
},
```

**Changes**: +7 lines (insert after line 119, before Architecture group)

---

## 2. Routing Changes

### File: `web/src/pages/Docs/DocsPage.tsx`

**Add Import** (after line 27):

```typescript
import { AppShellDocs } from './components/appshell/AppShellDocs';
```

**Define TOC Items** (after line 148):

```typescript
const appShellTocItems: DocsTocItem[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'quick-start', label: 'Quick Start' },
  { id: 'examples', label: 'Examples' },
  { id: 'api', label: 'API Reference' },
];
```

**Add Path Detection** (after line 175):

```typescript
const isAppShellDocs = location.pathname.startsWith(
  '/docs/application/appshell'
);
```

**Update TOC Selection** (add to ternary chain ~line 177):

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
  : isAppShellDocs        // ADD THIS
  ? appShellTocItems      // ADD THIS
  : isOverview
  ? overviewTocItems
  // ... rest
```

**Update Content Rendering** (add to ternary chain ~line 201):

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
) : isAppShellDocs ? (      // ADD THIS
  <AppShellDocs />          // ADD THIS
) : isOverview ? (
  <Overview />
) // ... rest
```

**Changes**: +15 lines total

---

## 3. Files to Create (6 TOTAL - Not 12)

### Directory Structure

```
web/src/pages/Docs/components/appshell/
├── AppShellDocs.tsx          (~200 lines - main file)
├── AppShellQuickStart.tsx    (~80 lines)
├── AppShellExamples.tsx      (~100 lines)
├── AppShellApi.tsx           (~120 lines)
└── AppShellDemo.tsx          (~100 lines - ONE demo file)
```

**NO CREATION OF**:

- ❌ AppShellComposition.tsx
- ❌ AppShellScenarios.tsx
- ❌ AppShellNotes.tsx
- ❌ demos/ subdirectory with 4 files
- ❌ mockNavItems.ts (inline in demo)

---

## 4. File Contents (Simplified)

### 4.1 AppShellDocs.tsx (~200 lines)

**Purpose**: Main orchestrator

**Structure**:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useDashTheme } from '@dashforge/theme-core';
import { AppShellQuickStart } from './AppShellQuickStart';
import { AppShellExamples } from './AppShellExamples';
import { AppShellApi } from './AppShellApi';

export function AppShellDocs() {
  const dashTheme = useDashTheme();
  const isDark = dashTheme.meta.mode === 'dark';

  return (
    <Stack spacing={8}>
      {/* Hero Section */}
      <Stack spacing={3} id="overview">
        <Typography
          variant="h1"
          sx={
            {
              /* blue gradient */
            }
          }
        >
          AppShell
        </Typography>
        <Typography
          variant="body1"
          sx={
            {
              /* description */
            }
          }
        >
          Application-level shell for authenticated experiences, admin panels,
          and dashboards. Orchestrates navigation, header, and content areas
          with responsive behavior.
        </Typography>
        <Box
          sx={
            {
              /* badge */
            }
          }
        >
          <Typography
            sx={
              {
                /* "Application Pattern" */
              }
            }
          >
            Application Pattern
          </Typography>
        </Box>
      </Stack>

      {/* Quick Start */}
      <Stack spacing={4} id="quick-start">
        <Typography variant="h2">Quick Start</Typography>
        <AppShellQuickStart />
      </Stack>

      {/* Examples */}
      <Stack spacing={4} id="examples">
        <Typography variant="h2">Examples</Typography>
        <AppShellExamples />
      </Stack>

      {/* API */}
      <Stack spacing={4} id="api">
        <Typography variant="h2">API Reference</Typography>
        <AppShellApi />
      </Stack>
    </Stack>
  );
}
```

**Key Points**:

- 4 sections with IDs: overview, quick-start, examples, api
- Blue gradient for Application category
- Badge: "Application Pattern"
- No notes section (can be added later)

---

### 4.2 AppShellQuickStart.tsx (~80 lines)

**Purpose**: Basic usage with code example

**Content**:

- Installation reminder (already in @dashforge/ui)
- Basic import example
- Minimal code example with AppShell
- 2-3 sentences about usage

**Structure**:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DocsCodePreview } from '../shared/DocsCodePreview';

export function AppShellQuickStart() {
  return (
    <Stack spacing={3}>
      <Typography>
        AppShell is available in <code>@dashforge/ui</code>. Import it alongside
        your navigation items and routing setup.
      </Typography>

      <DocsCodePreview
        code={`import { AppShell } from '@dashforge/ui';

function App() {
  const navItems = [
    { id: 'dashboard', type: 'item', label: 'Dashboard', key: 'dashboard' },
    { id: 'users', type: 'item', label: 'Users', key: 'users' },
  ];

  return (
    <AppShell
      items={navItems}
      renderLink={(item, children) => <a href={\`/\${item.key}\`}>{children}</a>}
      isActive={(item) => window.location.pathname === \`/\${item.key}\`}
      topBarLeft={<div>Logo</div>}
      topBarRight={<div>User Menu</div>}
    >
      <YourPageContent />
    </AppShell>
  );
}`}
        language="tsx"
      />

      <Typography variant="body2" color="text.secondary">
        AppShell handles layout coordination, responsive behavior, and
        navigation state. Use it once at the root of your application.
      </Typography>
    </Stack>
  );
}
```

---

### 4.3 AppShellExamples.tsx (~100 lines)

**Purpose**: Single comprehensive example with multiple use cases

**Content**:

- Import AppShellDemo
- Short description
- ONE demo that shows multiple scenarios in a simple way

**Structure**:

```tsx
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AppShellDemo } from './AppShellDemo';

export function AppShellExamples() {
  return (
    <Stack spacing={3}>
      <Typography>
        The example below demonstrates AppShell with navigation, header slots,
        and responsive behavior. Resize the viewport to see mobile behavior.
      </Typography>

      <AppShellDemo />

      <Typography variant="body2" color="text.secondary">
        Key features: Desktop side-by-side layout, mobile overlay navigation,
        customizable header slots, automatic content offset.
      </Typography>
    </Stack>
  );
}
```

---

### 4.4 AppShellApi.tsx (~120 lines)

**Purpose**: Props table

**Content**:

- Table with key AppShell props
- Brief descriptions
- Type information
- Default values

**Structure**:

```tsx
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

export function AppShellApi() {
  const props = [
    {
      name: 'items',
      type: 'LeftNavItem[]',
      required: true,
      default: '-',
      description: 'Navigation items for LeftNav',
    },
    {
      name: 'renderLink',
      type: 'RenderLinkFn',
      required: false,
      default: '-',
      description: 'Router-agnostic link renderer',
    },
    {
      name: 'isActive',
      type: 'IsActiveFn',
      required: false,
      default: '-',
      description: 'Callback to determine active item',
    },
    {
      name: 'navOpen',
      type: 'boolean',
      required: false,
      default: 'undefined',
      description: 'Controlled navigation open state',
    },
    {
      name: 'defaultNavOpen',
      type: 'boolean',
      required: false,
      default: 'true',
      description: 'Default nav open state (uncontrolled)',
    },
    {
      name: 'onNavOpenChange',
      type: '(open: boolean) => void',
      required: false,
      default: '-',
      description: 'Callback when nav state changes',
    },
    {
      name: 'topBarLeft',
      type: 'ReactNode',
      required: false,
      default: '-',
      description: 'Left-aligned TopBar content',
    },
    {
      name: 'topBarCenter',
      type: 'ReactNode',
      required: false,
      default: '-',
      description: 'Center-aligned TopBar content',
    },
    {
      name: 'topBarRight',
      type: 'ReactNode',
      required: false,
      default: '-',
      description: 'Right-aligned TopBar content',
    },
    {
      name: 'navWidthExpanded',
      type: 'number',
      required: false,
      default: '280',
      description: 'Width when nav is expanded (px)',
    },
    {
      name: 'navWidthCollapsed',
      type: 'number',
      required: false,
      default: '64',
      description: 'Width when nav is collapsed (px)',
    },
    {
      name: 'breakpoint',
      type: "'sm' | 'md' | 'lg' | 'xl'",
      required: false,
      default: "'lg'",
      description: 'Breakpoint for mobile behavior',
    },
    {
      name: 'children',
      type: 'ReactNode',
      required: true,
      default: '-',
      description: 'Main content area',
    },
  ];

  return (
    <Paper sx={{ overflow: 'hidden' }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <strong>Prop</strong>
            </TableCell>
            <TableCell>
              <strong>Type</strong>
            </TableCell>
            <TableCell>
              <strong>Required</strong>
            </TableCell>
            <TableCell>
              <strong>Default</strong>
            </TableCell>
            <TableCell>
              <strong>Description</strong>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.map((prop) => (
            <TableRow key={prop.name}>
              <TableCell>
                <code>{prop.name}</code>
              </TableCell>
              <TableCell>
                <code>{prop.type}</code>
              </TableCell>
              <TableCell>{prop.required ? 'Yes' : 'No'}</TableCell>
              <TableCell>{prop.default}</TableCell>
              <TableCell>{prop.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
```

---

### 4.5 AppShellDemo.tsx (~100 lines)

**Purpose**: Single demo showing all key features

**Content**:

- Mock nav items (inline, not separate file)
- AppShell with realistic setup
- Shows desktop/mobile behavior
- Shows slots usage
- Interactive button to toggle nav (optional, but simple)

**Structure**:

```tsx
import { useState } from 'react';
import { AppShell } from '@dashforge/ui';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import type { LeftNavItem } from '@dashforge/ui';

export function AppShellDemo() {
  const [navOpen, setNavOpen] = useState(true);

  const navItems: LeftNavItem[] = [
    { id: '1', type: 'item', label: 'Dashboard', key: 'dashboard' },
    { id: '2', type: 'item', label: 'Users', key: 'users' },
    { id: '3', type: 'item', label: 'Settings', key: 'settings' },
    { id: '4', type: 'divider' },
    { id: '5', type: 'item', label: 'Logout', key: 'logout' },
  ];

  return (
    <Box sx={{ height: 600, border: '1px solid', borderColor: 'divider' }}>
      <AppShell
        items={navItems}
        renderLink={(item, children) => (
          <div style={{ cursor: 'pointer' }}>{children}</div>
        )}
        isActive={(item) => item.key === 'dashboard'}
        navOpen={navOpen}
        onNavOpenChange={setNavOpen}
        topBarLeft={
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            My App
          </Typography>
        }
        topBarRight={
          <Button
            size="small"
            variant="outlined"
            onClick={() => setNavOpen(!navOpen)}
          >
            Toggle Nav
          </Button>
        }
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            Dashboard
          </Typography>
          <Typography color="text.secondary">
            This is the main content area. AppShell handles the layout
            coordination between navigation, header, and content. Resize your
            browser to see responsive behavior.
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2">
              Current nav state: <strong>{navOpen ? 'Open' : 'Closed'}</strong>
            </Typography>
          </Box>
        </Box>
      </AppShell>
    </Box>
  );
}
```

**Key Points**:

- Mock data inline (no separate file)
- Shows controlled state
- Toggle button demonstrates interactivity
- Simple, clear, functional

---

## 5. Implementation Steps (Simplified)

### Step 1: Sidebar (3 minutes)

1. Open `DocsSidebar.model.ts`
2. Insert "Application" group between "Theme System" and "Architecture"
3. Save

### Step 2: Routing (5 minutes)

1. Open `DocsPage.tsx`
2. Add import, TOC array, path detection
3. Update two ternary chains
4. Save

### Step 3: Create Files (60 minutes)

1. Create directory: `web/src/pages/Docs/components/appshell/`
2. Create `AppShellDocs.tsx` (30 min)
3. Create `AppShellQuickStart.tsx` (10 min)
4. Create `AppShellExamples.tsx` (5 min)
5. Create `AppShellApi.tsx` (10 min)
6. Create `AppShellDemo.tsx` (15 min)

### Step 4: Validate (10 minutes)

1. Run typecheck
2. Run dev server
3. Navigate to `/docs/application/appshell`
4. Verify sidebar order
5. Verify TOC works
6. Verify demo renders

**Total Time: ~80 minutes**

---

## 6. Acceptance Criteria (Simplified)

### Must Have ✅

- [ ] "Application" group exists in sidebar
- [ ] "Application" appears BETWEEN "Theme System" and "Architecture"
- [ ] "AppShell" item navigates to `/docs/application/appshell`
- [ ] Page renders with 4 sections (overview, quick-start, examples, api)
- [ ] TOC has 4 items and works
- [ ] Demo renders and is interactive
- [ ] No TypeScript errors
- [ ] No console errors

### That's It

No over-engineering. No excessive demos. Fast v1 delivery.

---

## 7. Files Summary

### Modified (2 files)

1. `web/src/pages/Docs/components/DocsSidebar.model.ts` (+7 lines)
2. `web/src/pages/Docs/DocsPage.tsx` (+15 lines)

### Created (5 files, ~500 lines total)

1. `web/src/pages/Docs/components/appshell/AppShellDocs.tsx` (~200 lines)
2. `web/src/pages/Docs/components/appshell/AppShellQuickStart.tsx` (~80 lines)
3. `web/src/pages/Docs/components/appshell/AppShellExamples.tsx` (~100 lines)
4. `web/src/pages/Docs/components/appshell/AppShellApi.tsx` (~120 lines)
5. `web/src/pages/Docs/components/appshell/AppShellDemo.tsx` (~100 lines)

**Total: 7 file changes, ~600 lines of code**

---

## 8. What We're NOT Doing

- ❌ AppShellComposition.tsx
- ❌ AppShellScenarios.tsx
- ❌ AppShellNotes.tsx
- ❌ demos/ subdirectory
- ❌ 4 separate demo files
- ❌ mockNavItems.ts
- ❌ AppShellLayoutVariants.tsx
- ❌ Over-documented API
- ❌ Implementation notes section (v2)
- ❌ Playground integration (v2)
- ❌ Video walkthrough (v2)
- ❌ Migration guide (v2)

---

## 9. Post-Implementation Report Template

After implementation, create:

```
.opencode/reports/add-appshell-docs-application-group-report.md
```

**Contents**:

1. Files changed (list with line counts)
2. Sidebar placement confirmation
3. Route added: `/docs/application/appshell`
4. TOC items: overview, quick-start, examples, api
5. Explicit statement: "AppShell placed under Application, not Layout"
6. Build status: pass/fail
7. Manual test results: pass/fail

---

## 10. Critical Reminders

1. **Sidebar Order**: Theme System → Application → Architecture
2. **Routing**: Use `.startsWith('/docs/application/appshell')`
3. **File Count**: 5 new files only
4. **No Over-Engineering**: This is v1, optimization later
5. **Speed**: ~80 minutes total implementation

---

**End of Simplified Plan**

Ready for fast execution.
