# AppShell Migration to docs - Execution Plan

**Date**: 2026-03-28  
**Status**: Analysis Complete - Ready for Execution  
**Project**: Dashforge

---

## Executive Summary

This plan details the migration of the **AppShell** component from `libs/dashforge/ui` to the documentation site at `docs/`. The AppShell is a composition component that orchestrates LeftNav, TopBar, and main content area with responsive layout coordination.

**Key Finding**: AppShell is already fully implemented and tested in the library, with complete unit tests (207 lines, 4 test intents). The migration to docs requires creating a demonstration page similar to existing stress pages.

---

## 1. Component Analysis

### 1.1 Current Location & Structure

```
libs/dashforge/ui/src/components/AppShell/
├── AppShell.tsx                 (145 lines - main component)
├── AppShell.unit.test.tsx       (207 lines - comprehensive unit tests)
├── types.ts                     (123 lines - TypeScript interfaces)
└── index.ts                     (2 lines - exports)
```

### 1.2 Component Features

The AppShell component provides:

1. **Composition Architecture**

   - Orchestrates LeftNav (side navigation)
   - Orchestrates TopBar (header)
   - Manages main content area with proper spacing

2. **Responsive Behavior**

   - Desktop: Side-by-side layout with adjustable nav width
   - Mobile: Overlay navigation with modal behavior
   - Configurable breakpoint (default: 'lg')

3. **State Management**

   - Controlled/uncontrolled nav open state
   - Supports `navOpen`, `defaultNavOpen`, and `onNavOpenChange`

4. **Layout Coordination**

   - Automatic main content offset based on nav width
   - Toolbar spacer for fixed TopBar
   - Smooth transitions between states

5. **Customization Options**
   - `navWidthExpanded` (default: 280px)
   - `navWidthCollapsed` (default: 64px)
   - `topBarPosition` (default: 'fixed')
   - `toolbarMinHeight` (responsive)
   - Custom slots: `leftNavHeader`, `leftNavFooter`, `topBarLeft`, `topBarCenter`, `topBarRight`

### 1.3 Dependencies

**Direct Dependencies**:

- `LeftNav` component (`libs/dashforge/ui/src/components/LeftNav/`)
- `TopBar` component (`libs/dashforge/ui/src/components/TopBar/`)
- MUI components: `Box`, `Toolbar`, `useMediaQuery`, `useTheme`

**Type Dependencies**:

- `LeftNavItem`, `RenderLinkFn`, `IsActiveFn` from LeftNav types
- `AppBarProps` from MUI
- `SxProps`, `Theme` from MUI

**Status**: All dependencies are already exported from `@dashforge/ui` and available in docs.

### 1.4 Export Status

AppShell is already exported from the library:

```typescript
// libs/dashforge/ui/src/index.ts
export { AppShell } from './components/AppShell/AppShell';
export type { AppShellProps } from './components/AppShell/types';
```

LeftNav and TopBar are also exported:

```typescript
export { LeftNav } from './components/LeftNav/LeftNav';
export { TopBar } from './components/TopBar/TopBar';
export type { LeftNavProps, TopBarProps, LeftNavItem, ... };
```

---

## 2. Test Coverage Analysis

### 2.1 Existing Unit Tests

The component has comprehensive unit tests covering 4 test intents:

**Intent A – Basic Composition** (1 test)

- A1: Renders LeftNav + TopBar + main children
- Verifies all three major sections are present

**Intent B – Desktop Offset Math** (2 tests)

- B1: navOpen=true uses expanded width for main offset
- B2: navOpen=false uses collapsed width for main offset
- Tests `data-dash-main-offset` attribute correctness

**Intent C – Mobile Behavior** (1 test)

- C1: main offset becomes 0 on mobile
- Validates responsive layout switching

**Intent D – Fixed TopBar Spacer** (2 tests)

- D1: adds toolbar spacer when TopBar position is fixed (default)
- D2: no spacer when TopBar position is static
- Ensures proper content spacing with fixed headers

**Coverage Assessment**: ✅ Complete

- All major features covered
- Both desktop and mobile tested
- Controlled/uncontrolled state patterns tested
- No skipped tests

---

## 3. Documentation Site Analysis

### 3.1 Current Structure

```
docs/
├── src/
│   ├── app/
│   │   ├── app.tsx              (Main router with TopNav)
│   │   └── playground/stress/   (Existing playground components)
│   ├── pages/
│   │   ├── autocomplete-stress/ (Example page structure)
│   │   ├── form-stress/         (Example page structure)
│   │   └── reactions-v2/        (Example page structure)
│   └── main.tsx
├── package.json
└── vite.config.mts
```

### 3.2 Existing Page Pattern

Based on analysis of `autocomplete-stress` and `form-stress`:

**Pattern Structure**:

```
pages/<feature-name>/
├── index.ts                     (Re-exports main page)
├── <Feature>Page.tsx            (Main page component)
└── <Example>*.tsx               (Individual example components)
```

**Page Component Pattern**:

```tsx
export function <Feature>Page() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', p: 3 }}>
      <Stack spacing={4} sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Box>
          <Typography variant="h4">Title</Typography>
          <Typography variant="body2" color="text.secondary">
            Description
          </Typography>
        </Box>

        {/* Examples */}
        <ExampleComponent1 />
        <ExampleComponent2 />
      </Stack>
    </Box>
  );
}
```

### 3.3 Current Router (app.tsx)

Currently uses basic AppBar + Toolbar navigation:

- No AppShell usage yet
- Manual navigation with Links
- Each page is self-contained with padding

**Key Insight**: The docs site itself does NOT currently use AppShell. Pages are standalone with manual TopNav.

---

## 4. Migration Strategy

### 4.1 Approach Options

**Option A: Demonstration Page Only** (RECOMMENDED)

- Create a dedicated page: `docs/src/pages/appshell-demo/`
- Show AppShell in action with various configurations
- Keep main app.tsx unchanged (maintains consistency with existing pages)
- Faster, safer, non-breaking

**Option B: Full App Integration**

- Replace app.tsx TopNav with AppShell
- Update all existing pages to work within AppShell layout
- More complex, requires testing all pages
- Breaking change to existing page structure

**Recommendation**: Option A (Demonstration Page)

- Aligns with existing pattern (form-stress, autocomplete-stress, etc.)
- Non-breaking
- Easier to review and validate
- Shows AppShell capabilities without disrupting existing functionality

### 4.2 Page Structure Plan

```
docs/src/pages/appshell-demo/
├── index.ts                          (Export AppShellDemoPage)
├── AppShellDemoPage.tsx              (Main page with multiple examples)
├── BasicLayoutExample.tsx            (Simple AppShell usage)
├── ResponsiveExample.tsx             (Desktop/mobile behavior demo)
├── ControlledNavExample.tsx          (Controlled nav state)
├── CustomSlotsExample.tsx            (Custom header/footer slots)
└── mockNavItems.ts                   (Shared nav items for demos)
```

---

## 5. Implementation Plan

### Phase 1: Prepare Mock Data & Utilities

**Files to Create**:

1. `docs/src/pages/appshell-demo/mockNavItems.ts`
   - Export sample LeftNavItem[] for demos
   - Include various item types (item, divider, header)
   - 5-8 items for realistic navigation

**Estimated Effort**: 15 minutes

---

### Phase 2: Create Example Components

**Files to Create**:

2. `docs/src/pages/appshell-demo/BasicLayoutExample.tsx`

   - Simplest AppShell usage
   - Show LeftNav + TopBar + content
   - Demo default behavior
   - **Lines**: ~80

3. `docs/src/pages/appshell-demo/ResponsiveExample.tsx`

   - Desktop vs mobile behavior
   - Show breakpoint switching
   - Visual indicators for current mode
   - **Lines**: ~100

4. `docs/src/pages/appshell-demo/ControlledNavExample.tsx`

   - Controlled nav state with external button
   - Demo `navOpen` + `onNavOpenChange`
   - Show state synchronization
   - **Lines**: ~90

5. `docs/src/pages/appshell-demo/CustomSlotsExample.tsx`
   - Custom `leftNavHeader`, `leftNavFooter`
   - Custom `topBarLeft`, `topBarCenter`, `topBarRight`
   - Show slot flexibility
   - **Lines**: ~120

**Estimated Effort**: 90 minutes

---

### Phase 3: Create Main Page Component

**Files to Create**:

6. `docs/src/pages/appshell-demo/AppShellDemoPage.tsx`

   - Main page orchestrating all examples
   - Header with description
   - Section for each example with explanatory text
   - Follows existing page pattern (form-stress, autocomplete-stress)
   - **Lines**: ~150

7. `docs/src/pages/appshell-demo/index.ts`
   - Re-export AppShellDemoPage
   - **Lines**: ~2

**Estimated Effort**: 30 minutes

---

### Phase 4: Integrate into Router

**Files to Modify**:

8. `docs/src/app/app.tsx`
   - Import AppShellDemoPage
   - Add route: `<Route path="/appshell-demo" element={<AppShellDemoPage />} />`
   - Add navigation button in TopNav
   - **Changes**: +3 lines (import, route, button)

**Estimated Effort**: 10 minutes

---

### Phase 5: Validation & Testing

**Validation Steps**:

1. **Build Check**

   ```bash
   npx nx run docs:build
   ```

   - Ensure no TypeScript errors
   - Ensure no build failures

2. **Dev Server Check**

   ```bash
   npx nx run docs:serve
   ```

   - Navigate to `/appshell-demo`
   - Test desktop behavior (nav expand/collapse)
   - Test mobile behavior (responsive breakpoint)
   - Test all example variations
   - Verify navigation between examples

3. **Visual Regression**
   - Check all examples render correctly
   - Verify transitions are smooth
   - Ensure no layout shifts
   - Test in light/dark mode (if applicable)

**Estimated Effort**: 30 minutes

---

## 6. File Creation Checklist

### New Files (7 total)

- [ ] `docs/src/pages/appshell-demo/mockNavItems.ts`
- [ ] `docs/src/pages/appshell-demo/BasicLayoutExample.tsx`
- [ ] `docs/src/pages/appshell-demo/ResponsiveExample.tsx`
- [ ] `docs/src/pages/appshell-demo/ControlledNavExample.tsx`
- [ ] `docs/src/pages/appshell-demo/CustomSlotsExample.tsx`
- [ ] `docs/src/pages/appshell-demo/AppShellDemoPage.tsx`
- [ ] `docs/src/pages/appshell-demo/index.ts`

### Modified Files (1 total)

- [ ] `docs/src/app/app.tsx` (add route + nav button)

---

## 7. Risk Assessment

### Low Risks ✅

1. **No Component Changes Required**

   - AppShell is already complete and tested
   - No modifications to library code
   - Zero risk of breaking existing functionality

2. **Isolated Demo Page**

   - New page in its own directory
   - No impact on existing pages
   - Easy to rollback if needed

3. **All Dependencies Available**
   - LeftNav, TopBar already exported
   - docs package.json already includes `@dashforge/ui`
   - No new dependencies needed

### Medium Risks ⚠️

1. **Router Integration**

   - Adding route to app.tsx
   - **Mitigation**: Simple route addition, well-tested pattern
   - **Rollback**: Remove 3 lines from app.tsx

2. **Responsive Behavior Testing**
   - Need to test breakpoint behavior
   - **Mitigation**: AppShell already tested for responsive behavior
   - **Action**: Manual testing at various screen sizes

---

## 8. Success Criteria

### Must Have ✅

- [ ] Page builds without TypeScript errors
- [ ] Page renders in dev server
- [ ] All 4 example components render correctly
- [ ] Navigation works (expand/collapse)
- [ ] Responsive behavior works (desktop/mobile)
- [ ] No console errors or warnings
- [ ] Route accessible from main navigation

### Should Have 🎯

- [ ] Smooth transitions between nav states
- [ ] Clear visual separation between examples
- [ ] Helpful descriptions for each example
- [ ] Code examples or inline documentation
- [ ] Dark mode compatibility (if app supports it)

### Nice to Have 🌟

- [ ] Live code editor for examples
- [ ] Prop controls for interactive demo
- [ ] Copy-to-clipboard for code samples
- [ ] Links to source code on GitHub

---

## 9. Timeline Estimate

| Phase                       | Effort | Cumulative |
| --------------------------- | ------ | ---------- |
| Phase 1: Mock Data          | 15 min | 15 min     |
| Phase 2: Example Components | 90 min | 105 min    |
| Phase 3: Main Page          | 30 min | 135 min    |
| Phase 4: Router Integration | 10 min | 145 min    |
| Phase 5: Validation         | 30 min | 175 min    |

**Total Estimated Time**: ~3 hours

---

## 10. Post-Migration Actions

### Documentation

- [ ] Add entry to project docs (if exists) about AppShell demo page
- [ ] Update README if needed
- [ ] Consider adding to component catalog or Storybook (future)

### Future Enhancements

1. **Interactive Controls**

   - Add prop panel to toggle AppShell props live
   - Show code snippets based on selected configuration

2. **Advanced Examples**

   - Nested navigation (multi-level LeftNav items)
   - Custom styling examples
   - Integration with routing libraries (react-router, Next.js)

3. **Full App Migration** (Option B from 4.1)
   - If desired, later migrate main app.tsx to use AppShell
   - Would require updating all existing pages
   - Defer until AppShell demo is validated

---

## 11. Alternative Considerations

### If App Migration is Required Later

If stakeholders decide to use AppShell for the main docs app (Option B):

**Additional Steps**:

1. Refactor `docs/src/app/app.tsx` to use AppShell
2. Update all page components to remove individual padding/layout
3. Create shared LeftNav configuration for main app
4. Test all existing pages (form-stress, autocomplete-stress, reactions-v2)
5. Ensure no layout regressions

**Estimated Effort**: +2-3 hours

**Risk Level**: Medium-High (affects all pages)

---

## 12. Conclusion

### Summary

The AppShell component is production-ready and fully tested. Migration to docs involves creating a demonstration page following the established pattern used by other feature pages (form-stress, autocomplete-stress). This is a low-risk, straightforward task.

### Recommendation

Proceed with **Option A** (Demonstration Page Only):

- Create `docs/src/pages/appshell-demo/`
- Implement 4 example components showing different AppShell features
- Add route to main app
- Total effort: ~3 hours

### Next Steps

1. Review and approve this plan
2. Execute Phase 1-5 in sequence
3. Validate demo page functionality
4. Consider future enhancements based on feedback

---

**End of Plan**
